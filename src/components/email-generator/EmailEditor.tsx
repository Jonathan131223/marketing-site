import React, { useEffect, useState, useCallback, useRef } from "react";
import { EmailTemplate } from "@/types/emailGenerator";
import { InlineFormattingPopover } from "./InlineFormattingPopover";
import { useEmailEditor } from "@/hooks/useEmailEditor";
import { renderEmailForContext } from "@/utils/emailRenderer";

// Extend the window interface for our custom property
declare global {
  interface Window {
    isUsingInlineEditor?: boolean;
  }
}


interface EmailEditorProps {
  email: EmailTemplate;
  onUpdate: (
    email: EmailTemplate,
    operation?:
      | "inline-edit"
      | "block-move"
      | "block-duplicate"
      | "block-delete"
      | "block-insert"
  ) => void;
  onExport: () => void;
  selectedUseCase?: string;
  isApplyingHistory?: boolean;
  /** When true (e.g. Template Tweaks gray background), body and #emailWrapper use gray to avoid white gap. */
  editorBodyGray?: boolean;
  /** The active background style (e.g. "gray_border") so the editor can inject border CSS immediately. */
  editorBackgroundStyle?: string;
  /** When true, badge should be positioned below the blended footer table. */
  footerBlendBackground?: boolean;
  /** Subject line - passed directly to ensure immediate updates */
  subject?: string;
  /** Preview text - passed directly to ensure immediate updates */
  preview?: string;
  /** When true, subject/preview suggestions are being fetched - show loading indicator */
  suggestionsLoading?: boolean;
  /** Company domain extracted from brief data (e.g. "myapp.com") */
  companyDomain?: string;
  /** When set, From line shows "Name <hello@domain>"; otherwise only hello@domain */
  fromSenderName?: string;
  /** When true, hide DnD block controls (grab, +, padding, duplicate, delete) and block outlines. The editor JS is still loaded. */
  hideDndControls?: boolean;
  /** When set, replaces the default Subject/Preview lines with this node (e.g. inline subject editor + copy/regenerate). */
  subjectPreviewInline?: React.ReactNode;
}

export const EmailEditor: React.FC<EmailEditorProps> = ({
  email,
  onUpdate,
  selectedUseCase,
  isApplyingHistory = false,
  editorBodyGray = false,
  editorBackgroundStyle,
  footerBlendBackground = false,
  subject,
  preview,
  suggestionsLoading = false,
  companyDomain,
  fromSenderName,
  hideDndControls = false,
  subjectPreviewInline,
}) => {
  const user = true; const session = true; const authLoading = false;
  const {
    iframeRef,
    iframeHeight,
    setIframeHeight,
    handleBlockOperation,
    handleInlineEdit,
    saveSelection,
    restoreSelection,
    lastSyncedContentRef,
    syncJustHappenedRef,
    canWriteContent,
  } = useEmailEditor({ email, onUpdate, selectedUseCase, isApplyingHistory });

  const [showFormatPopover, setShowFormatPopover] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState("");
  const [isIframeReady, setIsIframeReady] = useState(false);
  const lastWrittenContentRef = useRef<string>("");
  const [showSignupModal, setShowSignupModal] = useState(false);
  const savedRangeRef = useRef<Range | null>(null);
  // Track whether the popover was positioned via block or range, and store the block element
  const popoverBlockRef = useRef<Element | null>(null);
  const [isStormyLoading, setIsStormyLoading] = useState(false);
  const [showStormyPopover, setShowStormyPopover] = useState(false);
  const [stormyPopoverPosition, setStormyPopoverPosition] = useState({
    x: 0,
    y: 0,
  });
  const [selectedElementForStormy, setSelectedElementForStormy] =
    useState<HTMLElement | null>(null);
  const stormyInputRef = useRef<HTMLTextAreaElement>(null);
  const stormyCancelledRef = useRef<boolean>(false);
  const [triggerLinkPopover, setTriggerLinkPopover] = useState(false);
  const [existingLinkData, setExistingLinkData] = useState<{
    url: string;
    color: string;
    underline: boolean;
    newTab: boolean;
  } | null>(null);
  const [linkEditMode, setLinkEditMode] = useState(false);
  const editingAnchorRef = useRef<HTMLAnchorElement | null>(null);

  // Keep the formatting popover position in sync when the page scrolls
  useEffect(() => {
    if (!showFormatPopover) return;

    const recalcPosition = () => {
      const iframe = iframeRef.current;
      if (!iframe) return;
      const iframeRect = iframe.getBoundingClientRect();

      if (popoverBlockRef.current) {
        // Block-based positioning
        try {
          const blockRect = popoverBlockRef.current.getBoundingClientRect();
          setPopoverPosition({
            x: iframeRect.left + blockRect.left + blockRect.width / 2,
            y: iframeRect.top + blockRect.top - 40,
          });
        } catch {
          // Block removed from DOM
          setShowFormatPopover(false);
        }
      } else if (savedRangeRef.current) {
        // Range-based positioning
        try {
          const rect = savedRangeRef.current.getBoundingClientRect();
          // getBoundingClientRect returns 0s if the range is detached
          if (rect.width === 0 && rect.height === 0 && rect.top === 0) {
            setShowFormatPopover(false);
            return;
          }
          setPopoverPosition({
            x: iframeRect.left + rect.left + rect.width / 2,
            y: iframeRect.top + rect.top - 10,
          });
        } catch {
          setShowFormatPopover(false);
        }
      }
    };

    // Listen for scroll on the window (page scroll) and capture phase for any scroll container
    window.addEventListener("scroll", recalcPosition, true);
    window.addEventListener("resize", recalcPosition);

    // Also listen for scroll inside the iframe (email content scrolling)
    const iframeDoc = iframeRef.current?.contentDocument;
    if (iframeDoc) {
      iframeDoc.addEventListener("scroll", recalcPosition, true);
    }

    return () => {
      window.removeEventListener("scroll", recalcPosition, true);
      window.removeEventListener("resize", recalcPosition);
      if (iframeDoc) {
        iframeDoc.removeEventListener("scroll", recalcPosition, true);
      }
    };
  }, [showFormatPopover]);

  const applyInlineTextAlign = (
    iframeDoc: Document,
    align: "left" | "center" | "right" | "justify"
  ) => {
    const sel = iframeDoc.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    const rawNode =
      range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
        ? (range.commonAncestorContainer as Element)
        : (range.commonAncestorContainer.parentElement as Element | null);
    if (!rawNode) return;

    // Only align inside editable content
    const editableRoot = rawNode.closest?.('[contenteditable="true"]');
    if (!editableRoot) return;

    // Apply alignment to the selected "paragraph-like" elements (not the entire block).
    // Note: CSS `text-align` can't be applied to arbitrary substrings; the smallest safe unit
    // is typically a paragraph/list-item/container that contains the selected text.
    const emailBlock =
      rawNode.closest?.("tr.email-block") ||
      editableRoot.closest?.("tr.email-block") ||
      iframeDoc.querySelector("tr.email-block.gemini-block-highlight");

    const shouldSkip = (el: Element) =>
      !!el.closest(
        ".gemini-left-controls, .gemini-right-controls, .gemini-insert-popover, .gemini-button-control-popover, .gemini-image-control-popover, .gemini-social-control-popover, .gemini-social-block-control-popover, .gemini-padding-control-popover"
      );

    const root = emailBlock || editableRoot;
    // Include block-displayed spans (.gemini-placeholder with display:block acts as line container)
    const blockSelector =
      "p, li, h1, h2, h3, h4, h5, h6, td, th, div, ul, ol, span.gemini-placeholder, span.text";

    const containersToAlign = new Set<HTMLElement>();

    // Helper: check if a span acts as a block (has display:block or similar)
    const isBlockLikeSpan = (el: Element): boolean => {
      if (el.tagName !== "SPAN") return true; // non-spans are fine
      const style = (el as HTMLElement).style;
      const display = style?.display || "";
      // Accept if it has block-like display OR is a known line-wrapper class
      return (
        display === "block" ||
        display === "flex" ||
        el.classList.contains("gemini-placeholder") ||
        el.classList.contains("text")
      );
    };

    // Collect block-level containers that intersect the selection (via text nodes).
    try {
      const walker = iframeDoc.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => {
          const text = node.textContent || "";
          if (!text.trim()) return NodeFilter.FILTER_REJECT;
          try {
            // intersectsNode handles multi-node selections better than manual comparisons
            return range.intersectsNode(node)
              ? NodeFilter.FILTER_ACCEPT
              : NodeFilter.FILTER_REJECT;
          } catch {
            return NodeFilter.FILTER_REJECT;
          }
        },
      } as any);

      let node: Node | null;
      while ((node = walker.nextNode())) {
        const el =
          node.nodeType === Node.TEXT_NODE
            ? (node.parentElement as Element | null)
            : (node as Element | null);
        if (!el) continue;

        // Walk up to find the nearest block-like container
        let container = el.closest?.(blockSelector) as HTMLElement | null;

        // If it's a span, make sure it's block-like; otherwise keep going up
        while (container && !isBlockLikeSpan(container)) {
          container = container.parentElement?.closest?.(
            blockSelector
          ) as HTMLElement | null;
        }

        if (!container) continue;

        // Don't go beyond the contenteditable root (avoid aligning parent containers)
        if (!editableRoot.contains(container) && container !== editableRoot)
          continue;

        if (!root.contains(container)) continue;
        if (shouldSkip(container)) continue;
        containersToAlign.add(container);
      }
    } catch {
      // ignore; we'll fall back below
    }

    // Fallback: align the nearest block container to the selection.
    if (containersToAlign.size === 0) {
      let fallback = rawNode.closest?.(blockSelector) as HTMLElement | null;
      while (fallback && !isBlockLikeSpan(fallback)) {
        fallback = fallback.parentElement?.closest?.(
          blockSelector
        ) as HTMLElement | null;
      }
      if (!fallback) fallback = editableRoot as HTMLElement;
      if (fallback && !shouldSkip(fallback)) containersToAlign.add(fallback);
    }

    // Apply with !important to override pasted/template inline styles
    containersToAlign.forEach((el) => {
      el.style.setProperty("text-align", align, "important");
    });
  };

  // Convert rgb/rgba/named colors to hex
  const colorToHex = (color: string): string => {
    if (!color) return "#0066cc";
    if (color.startsWith("#")) return color;
    if (color.startsWith("rgb")) {
      const match = color.match(/\d+/g);
      if (match && match.length >= 3) {
        const r = parseInt(match[0]).toString(16).padStart(2, "0");
        const g = parseInt(match[1]).toString(16).padStart(2, "0");
        const b = parseInt(match[2]).toString(16).padStart(2, "0");
        return `#${r}${g}${b}`;
      }
    }
    return "#0066cc";
  };

  const exec = (command: string, value?: string) => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;

    const iframeDoc = iframe.contentDocument;
    const sel = iframeDoc.getSelection();

    // Restore the saved selection so execCommand hits the intended text
    if (savedRangeRef.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }

    // execCommand justify* is inconsistent with nested email markup; set alignment explicitly
    if (
      command === "justifyLeft" ||
      command === "justifyCenter" ||
      command === "justifyRight" ||
      command === "justifyFull"
    ) {
      const align =
        command === "justifyLeft"
          ? "left"
          : command === "justifyCenter"
            ? "center"
            : command === "justifyRight"
              ? "right"
              : "justify";
      applyInlineTextAlign(iframeDoc, align);
      handleInlineEdit();
      return;
    }

    // Enhanced link creation with color, underline, and target options
    if (command === "createLink" && value) {
      try {
        const opts = JSON.parse(value) as {
          url: string;
          color: string;
          underline: boolean;
          newTab: boolean;
        };

        // First create the link using execCommand
        iframeDoc.execCommand("createLink", false, opts.url);

        // Now find the newly created anchor and apply styles
        const newSel = iframeDoc.getSelection();
        if (newSel && newSel.rangeCount > 0) {
          const range = newSel.getRangeAt(0);
          let anchor: HTMLAnchorElement | null = null;

          // The anchor may be the parent of the selection or surrounding it
          const container = range.commonAncestorContainer;
          if (container.nodeType === Node.ELEMENT_NODE) {
            anchor = (container as Element).closest("a") as HTMLAnchorElement;
          } else if (container.parentElement) {
            anchor = container.parentElement.closest("a") as HTMLAnchorElement;
          }

          if (anchor) {
            anchor.style.color = opts.color;
            anchor.style.textDecoration = opts.underline ? "underline" : "none";
            if (opts.newTab) {
              anchor.setAttribute("target", "_blank");
              anchor.setAttribute("rel", "noopener noreferrer");
            } else {
              anchor.removeAttribute("target");
              anchor.removeAttribute("rel");
            }
          }

          savedRangeRef.current = range.cloneRange();
        }

        handleInlineEdit();
        setShowFormatPopover(false);
        setLinkEditMode(false);
        setExistingLinkData(null);
        return;
      } catch {
        // If JSON parsing fails, fall through to default behavior (plain URL string)
      }
    }

    // Edit an existing link (from click-on-link popover)
    if (command === "editLink" && value) {
      try {
        const opts = JSON.parse(value) as {
          url: string;
          color: string;
          underline: boolean;
          newTab: boolean;
        };

        const anchor = editingAnchorRef.current;
        if (anchor) {
          anchor.href = opts.url;
          anchor.style.color = opts.color;
          anchor.style.textDecoration = opts.underline ? "underline" : "none";
          if (opts.newTab) {
            anchor.setAttribute("target", "_blank");
            anchor.setAttribute("rel", "noopener noreferrer");
          } else {
            anchor.removeAttribute("target");
            anchor.removeAttribute("rel");
          }
        }

        handleInlineEdit();
        editingAnchorRef.current = null;
        setShowFormatPopover(false);
        setLinkEditMode(false);
        setExistingLinkData(null);
        return;
      } catch {
        // Fall through
      }
    }

    // Remove an existing link — unwrap the <a> tag, keeping text and removing link styles
    if (command === "removeLink") {
      const anchor = editingAnchorRef.current;
      if (anchor && anchor.parentNode) {
        // Move all children out of the anchor, stripping link-specific styles
        const parent = anchor.parentNode;
        while (anchor.firstChild) {
          const child = anchor.firstChild;
          // Reset color and text-decoration on text spans inside the link
          if (child instanceof HTMLElement) {
            child.style.removeProperty("color");
            child.style.removeProperty("text-decoration");
          }
          parent.insertBefore(child, anchor);
        }
        parent.removeChild(anchor);
      }

      handleInlineEdit();
      editingAnchorRef.current = null;
      setShowFormatPopover(false);
      setLinkEditMode(false);
      setExistingLinkData(null);
      return;
    }

    // Execute command in iframe document
    iframeDoc.execCommand(command, false, value ?? "");

    // Update savedRange so continuous drags type=color keep working
    const newSel = iframeDoc.getSelection();
    if (newSel && newSel.rangeCount > 0)
      savedRangeRef.current = newSel.getRangeAt(0).cloneRange();
  };

  const getStyleColor = (style: string) => {
    switch (style) {
      case "professional":
        return "from-blue-500 to-indigo-600";
      case "friendly":
        return "from-green-500 to-emerald-600";
      case "urgent":
        return "from-red-500 to-pink-600";
      default:
        return "from-purple-500 to-purple-600";
    }
  };

  // Enhanced iframe content writing with flicker prevention
  const writeIframeContent = useCallback(
    (content: string) => {
      // Normalize any preview-wrapped HTML back to editor form
      const normalizeForEditor = (raw: string) => {
        try {
          if (!raw || typeof raw !== "string") return raw;
          // Fast path: if it contains the preview wrapper, unwrap it
          if (raw.includes("email-preview-content")) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(raw, "text/html");
            const wrapper = doc.querySelector(".email-preview-content");
            if (wrapper) {
              return wrapper.innerHTML || raw;
            }
          }
          return raw;
        } catch {
          return raw;
        }
      };

      // Strip any existing email-editor-dnd.js script tags from saved content
      // These scripts don't execute properly when loaded via doc.write()
      // We always inject a fresh script in setupIframe() instead
      const stripDndScript = (raw: string) => {
        if (!raw || typeof raw !== "string") return raw;
        // Remove script tags that reference email-editor-dnd.js
        return raw.replace(
          /<script[^>]*src=["'][^"']*email-editor-dnd\.js["'][^>]*><\/script>/gi,
          ""
        );
      };

      const editorReadyContent = stripDndScript(normalizeForEditor(content));
      const iframe = iframeRef.current;
      if (!iframe?.contentDocument) return;

      const doc = iframe.contentDocument;

      // Only write if content has actually changed
      if (lastWrittenContentRef.current === editorReadyContent) {
        console.log("📄 Skipping iframe write - content unchanged");
        return;
      }

      console.log("📄 Writing content to iframe");
      console.log("🔍 Content debug:", {
        contentLength: content.length,
        scriptTags: (content.match(/<script/g) || []).length,
        mjwBlocks: (content.match(/class=".*mj-w.*"/g) || []).length,
        buttonBlocks: (content.match(/data-gemini-button="1"/g) || []).length,
      });
      lastWrittenContentRef.current = editorReadyContent;

      // Process content through centralized renderer for editor context
      const processedContent = renderEmailForContext(
        editorReadyContent,
        "editor"
      );

      // Use a more stable approach to prevent flickers
      try {
        // Clear ALL DnD flags before rewriting - the script will need to re-initialize
        // because doc.open()/write()/close() destroys the DOM and event listeners
        // but the window object (and its properties) persists!
        if (iframe?.contentWindow) {
          (iframe.contentWindow as any).emailEditorDnDLoaded = false;
          (iframe.contentWindow as any).emailEditorInitialized = false;
          (iframe.contentWindow as any).emailEditorEventListenersAdded = false;
        }

        doc.open();
        doc.write(processedContent);
        doc.close();

        // If HTML has blended footer, move badge below it (detect from DOM)
        const blendedFooter = doc.querySelector('table[data-blended-footer="1"]');
        const badgeRow = doc.querySelector('tr[data-digistorms-badge="1"]');
        const wrapperTd = doc.querySelector("#emailWrapper")?.querySelector(":scope > tbody > tr > td");
        if (
          blendedFooter &&
          badgeRow &&
          wrapperTd?.contains(badgeRow) &&
          !blendedFooter.contains(badgeRow)
        ) {
          const tbody = blendedFooter.querySelector("tbody");
          if (tbody) {
            badgeRow.remove();
            tbody.appendChild(badgeRow);
          }
        }

        // Mark iframe as ready after successful write
        setIsIframeReady(true);

        // Trigger height recalculation after content is written
        setTimeout(() => {
          if (iframe?.contentWindow) {
            iframe.contentWindow.postMessage(
              { type: "force-height-recalc" },
              "*"
            );
          }
        }, 100);
      } catch (error) {
        console.error("❌ Error writing to iframe:", error);
        setIsIframeReady(false);
      }
    },
    [iframeRef]
  );

  // Enhanced iframe setup with better error handling
  const setupIframe = useCallback(
    (doc: Document) => {
      if (!doc) return;

      const bodyBg = editorBodyGray ? "#f3f4f6" : "white";
      // Remove previous inject so we don't duplicate when editorBodyGray toggles
      doc.getElementById("email-editor-injected-style")?.remove();
      // Add editor-specific CSS - only what's needed for editing functionality
      const style = doc.createElement("style");
      style.id = "email-editor-injected-style";
      style.textContent = `
      body { 
        outline: none;
        cursor: default;
        margin: 0;
        padding: 20px 0 0 0 !important;
        background: ${bodyBg} !important;
      }

      /* When gray template is selected, wrapper matches to avoid white gap */
      #emailWrapper {
        background: ${bodyBg} !important;
      }

      /* Fix for "Gray with Border" style: Prevent main container from clipping editor controls */
      #emailWrapper > tbody > tr > td > table {
        overflow: visible !important;
      }
      ${editorBackgroundStyle === "gray_border" ? `
      /* Gray with rounded border */
      #emailWrapper > tbody > tr > td > table {
        border: 1px solid #e5e7eb !important;
        border-radius: 8px !important;
      }` : ""}
      ${editorBackgroundStyle === "gray_border_no_radius" ? `
      /* Gray with square border */
      #emailWrapper > tbody > tr > td > table {
        border: 1px solid #e5e7eb !important;
        border-radius: 0 !important;
      }` : ""}
      
      [contenteditable="true"] {
        outline: none;
        /* Fallback font for newly typed text that doesn't inherit from <font> tags */
        font-family: Arial, Helvetica, sans-serif;
      }
      
      [contenteditable="true"] p,
      [contenteditable="true"] h1,
      [contenteditable="true"] h2,
      [contenteditable="true"] h3,
      [contenteditable="true"] span,
      [contenteditable="true"] li,
      [contenteditable="true"] a {
        cursor: text;
      }
      
      /* Ensure text typed without wrapper inherits email-friendly font */
      .text, .gemini-placeholder {
        font-family: inherit;
      }

      /* Allow scrolling */
      body, html {
        overflow-x: hidden !important;
        overflow-y: auto !important;
      }

      tr.email-block {
        position: relative;
        transition: transform 0.2s ease-in-out;
        cursor: default;
        user-select: none;
      }
      
      tr.email-block * {
        user-select: none !important;
      }
      
      tr.email-block[contenteditable="true"] * {
        user-select: text !important;
      }
      
      /* Allow clicking buttons without text-selection cursor */
      tr.email-block a, tr.email-block button {
        cursor: pointer !important;
        user-select: none !important;
      }

      tr.email-block:hover:not(.gemini-block-highlight) {
        outline: 1px solid #7444DD;
        outline-offset: -1px;
      }

      tr.email-block.gemini-block-highlight {
        outline: 2px solid #7444DD !important;
        outline-offset: -2px;
      }

      /* When the block is being edited, push the outline outward so it
         doesn't overlap the cursor or first characters of text */
      tr.email-block.gemini-block-highlight[contenteditable="true"] {
        outline-offset: 3px !important;
      }

      tr.email-block.gemini-block-highlight:hover {
        outline-color: #7444DD !important;
      }
      
      /* Badge row should not be interactive */
      tr[data-digistorms-badge] {
        pointer-events: none;
      }

      /* Controls visibility (attached directly inside TD) */
      .gemini-left-controls, .gemini-right-controls {
        position: absolute;
        top: -10px;
        display: flex;
        gap: 6px;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s ease-in-out;
        z-index: 10000;
        font-family: Inter, Arial, sans-serif !important;
      }

      .gemini-left-controls {
        left: 8px;
      }

      .gemini-right-controls {
        right: 8px;
      }

      tr.email-block:hover .gemini-left-controls,
      tr.email-block:hover .gemini-right-controls,
      tr.email-block.gemini-block-highlight .gemini-left-controls,
      tr.email-block.gemini-block-highlight .gemini-right-controls {
        opacity: 1;
        pointer-events: auto;
      }

      .gemini-control-button {
        width: 23px;
        height: 23px;
        background: #7444DD;
        color: white;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        border: none;
        padding: 0;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .gemini-control-button:hover {
        background: #7444DD;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }

      .gemini-grab-handle {
        cursor: grab;
      }

      .gemini-delete-icon {
        cursor: pointer;
      }

      .gemini-duplicate-icon {
        cursor: pointer;
      }

      .gemini-insert-icon {
        cursor: pointer;
      }

      .gemini-social-block-icon {
        cursor: pointer;
      }

      .gemini-insert-popover {
        position: fixed;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        z-index: 10002;
        display: none;
        min-width: 120px;
        padding: 4px 0;
        font-family: Inter, Arial, sans-serif;
        font-size: 14px;
      }

      .gemini-popover-option {
        padding: 8px 16px;
        cursor: pointer;
        color: #374151;
        transition: background-color 0.15s ease;
        user-select: none;
      }

      .gemini-popover-option:hover {
        background-color: #f3f4f6;
      }

      .gemini-popover-option:first-child {
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
      }

      .gemini-popover-option:last-child {
        border-bottom-left-radius: 8px;
        border-bottom-right-radius: 8px;
      }

      .link-tooltip {
        position: fixed; /* Use fixed positioning */
        background-color: white;
        font-family: Inter Arial sans-serif;
        color: #333;
        padding: 5px 10px;
        border-radius: 5px;
        border: 1px solid #888;
        font-size: 12px;
        white-space: nowrap;
        z-index: 10001;
        opacity: 0;
        transition: opacity 0.2s;
        pointer-events: none; /* Keep this to prevent the tooltip from interfering with mouse events */
      }

      /* Empty state styles */
      .gemini-empty-state {
        transition: all 0.2s ease-in-out;
      }

      .gemini-empty-state:hover {
        border-color: #7444DD !important;
        background-color: #fafafa !important;
      }

      .gemini-empty-state .gemini-left-controls {
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s ease-in-out;
      }

      .gemini-empty-state:hover .gemini-left-controls {
        opacity: 1;
        pointer-events: auto;
      }

      /* Stormy AI Editor Styles */
      .stormy-edit-box {
        position: fixed;
        width: 300px;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        z-index: 10002;
        animation: slideIn 0.2s ease-out;
      }
      
      @keyframes slideIn {
        0% { opacity: 0; transform: translateY(-10px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      
      .stormy-input {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 13px;
        margin-bottom: 12px;
        resize: none;
        outline: none;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        box-sizing: border-box;
      }
      
      .stormy-input:focus {
        border-color: #7444DD;
        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
      }
      
      .stormy-suggestions {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 12px;
      }
      
      .stormy-suggestion {
        padding: 8px 12px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        font-size: 12px;
        color: #475569;
        cursor: pointer;
        transition: all 0.15s;
        text-align: left;
      }
      
      .stormy-suggestion:hover {
        background: #7444DD;
        color: white;
        border-color: #7444DD;
        transform: translateY(-1px);
      }
      
      .stormy-submit {
        width: 100%;
        background: #7444DD;
        color: white;
        border: none;
        border-radius: 6px;
        padding: 10px 16px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: background-color 0.2s;
      }
      
      .stormy-submit:hover {
        background: #7444DD;
      }
      
      .stormy-submit:disabled {
        background: #9ca3af;
        cursor: not-allowed;
      }
      
      .stormy-loading {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 255, 255, 0.95);
        padding: 20px 32px;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        color: #374151;
        z-index: 10003;
        border: 1px solid #e5e7eb;
      }
      
      .stormy-spinner {
        width: 20px;
        height: 20px;
        border: 2px solid #e5e7eb;
        border-top: 2px solid #7444DD;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      ${hideDndControls ? `
      /* Hide all DnD block controls while keeping the editor JS loaded */
      .gemini-left-controls,
      .gemini-right-controls,
      .gemini-insert-popover,
      .gemini-button-control-popover,
      .gemini-image-control-popover,
      .gemini-social-control-popover,
      .gemini-social-block-control-popover,
      .gemini-padding-control-popover {
        display: none !important;
      }
      tr.email-block:hover:not(.gemini-block-highlight) {
        outline: none !important;
      }
      tr.email-block.gemini-block-highlight {
        outline: none !important;
      }
      tr.email-block.gemini-block-highlight[contenteditable="true"] {
        outline: none !important;
      }
      tr.email-block.gemini-block-highlight:hover {
        outline-color: transparent !important;
      }
      .gemini-empty-state:hover {
        border-color: transparent !important;
      }
      ` : ""}

    `;
      doc.head.appendChild(style);

      // Image Editor Customization Script - Replaces inputs with Width Slider
      const imageEditorScript = doc.createElement("script");
      imageEditorScript.textContent = `
        (() => {
          let currentImage = null;

          // Capture clicked image to know what we are editing
          document.addEventListener('click', (e) => {
            if (e.target.tagName === 'IMG' && e.target.closest('.email-block')) {
              currentImage = e.target;
            }
          }, true);

          const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              if (mutation.type === 'childList' || mutation.type === 'attributes') {
                const popover = document.querySelector('.gemini-image-control-popover');
                if (popover && getComputedStyle(popover).display !== 'none' && !popover.dataset.enhanced) {
                  enhanceImagePopover(popover);
                }
              }
            });
          });

          observer.observe(document.body, { childList: true, attributes: true, subtree: true });

          function enhanceImagePopover(popover) {
            // Find original controls
            const widthInput = popover.querySelector('[data-k="width"]');
            const heightInput = popover.querySelector('[data-k="height"]');
            const aspectInput = popover.querySelector('[data-k="aspect"]');
            
            if (!widthInput) return;
            
            popover.dataset.enhanced = 'true';

            // Hide original controls
            // Hide inputs
            widthInput.style.display = 'none';
            if (heightInput) heightInput.style.display = 'none';
            if (aspectInput) {
              aspectInput.style.display = 'none';
              // Hide "Maintain aspect ratio" text if it's a following text node
              if (aspectInput.nextSibling && aspectInput.nextSibling.nodeType === 3) {
                aspectInput.nextSibling.textContent = '';
              }
              // Also hide if wrapped in label
              if (aspectInput.parentElement.tagName === 'LABEL') {
                aspectInput.parentElement.style.display = 'none';
              }
            }

            // Try to hide "Width" and "Height" text labels more aggressively
            // We need to find and hide the text nodes that say "Width" and "Height"
            // They are usually direct children of the popover or wrapped in a label
            const textNodes = [];
            const walker = document.createTreeWalker(popover, NodeFilter.SHOW_TEXT, null, false);
            let node;
            while(node = walker.nextNode()) {
              if (node.textContent.trim() === 'Width' || node.textContent.trim() === 'Height') {
                textNodes.push(node);
              }
            }
            textNodes.forEach(n => n.textContent = '');

            // Also hide any labels that might contain these texts
            const labels = popover.querySelectorAll('label');
            labels.forEach(label => {
              if (label.textContent.trim() === 'Width' || label.textContent.trim() === 'Height') {
                label.style.display = 'none';
              }
            });

            // Create Slider UI
            const container = document.createElement('div');
            container.className = 'custom-width-slider-container';
            container.style.cssText = 'width: 100%; padding: 8px 0; border-bottom: 1px solid #e5e7eb; margin-bottom: 12px; box-sizing: border-box;';
            
            // Determine if this is an icon (small image) or regular image
            // Icons should use pixel-based sizing, regular images use percentage
            let isIcon = false;
            let usePixelMode = false;
            let currentPixelWidth = 44; // Default icon size
            let initialVal = 100;
            
            if (currentImage) {
              // Check if it's an icon by looking at attributes or container size
              const hasIconKeyword = currentImage.hasAttribute('data-icon-keyword');
              const imageRect = currentImage.getBoundingClientRect();
              const actualWidth = imageRect.width;
              
              // Find the container to check its width
              let imgContainer = currentImage.parentElement;
              while (imgContainer && imgContainer.tagName !== 'TD' && imgContainer.tagName !== 'TH' && imgContainer.tagName !== 'BODY') {
                imgContainer = imgContainer.parentElement;
              }
              
              // Get container width
              let containerWidth = 0;
              if (imgContainer) {
                const containerRect = imgContainer.getBoundingClientRect();
                containerWidth = containerRect.width;
              }
              
              // Determine if we should use pixel mode:
              // - Image has icon keyword attribute
              // - Container is narrow (< 150px) - typical for icon columns
              // - Current image is small (< 80px)
              isIcon = hasIconKeyword || containerWidth < 150 || actualWidth < 80;
              usePixelMode = isIcon;
              
              console.log('📐 Image sizing mode:', {
                isIcon,
                usePixelMode,
                hasIconKeyword,
                actualWidth,
                containerWidth,
                containerTag: imgContainer?.tagName
              });
              
              if (usePixelMode) {
                // PIXEL MODE: For icons and small images
                // Get the actual rendered pixel width
                currentPixelWidth = Math.round(actualWidth);
                initialVal = Math.max(20, Math.min(200, currentPixelWidth)); // Clamp 20-200px
              } else {
                // PERCENTAGE MODE: For regular images
              const w = currentImage.style.width;
              const widthAttr = currentImage.getAttribute('width');
              
              if (w && w.includes('%')) {
                  initialVal = parseInt(w) || 100;
              } else if (widthAttr && widthAttr.includes('%')) {
                  initialVal = parseInt(widthAttr) || 100;
                } else if (containerWidth > 0 && actualWidth > 0) {
                  // Calculate percentage based on container
                  initialVal = Math.round((actualWidth / containerWidth) * 100);
                  initialVal = Math.max(10, Math.min(100, initialVal));
                }
              }
            }
            
            // Create different slider UI based on mode
            if (usePixelMode) {
              // PIXEL MODE UI
              container.innerHTML = \`
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; width: 100%;">
                  <label style="font-weight: 600; font-size: 14px; color: #111827;">Size</label>
                  <span class="width-value" style="font-size: 14px; color: #374151; font-variant-numeric: tabular-nums;">\${initialVal}px</span>
                </div>
                <div style="width: 100%;">
                  <input type="range" min="20" max="200" value="\${initialVal}" class="width-slider" style="width: 100%; accent-color: #7444DD; height: 6px; border-radius: 3px; cursor: pointer; box-sizing: border-box;">
                </div>
              \`;
            } else {
              // PERCENTAGE MODE UI
            container.innerHTML = \`
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; width: 100%;">
                <label style="font-weight: 600; font-size: 14px; color: #111827;">Width</label>
                <span class="width-value" style="font-size: 14px; color: #374151; font-variant-numeric: tabular-nums;">\${initialVal}%</span>
              </div>
              <div style="width: 100%;">
                <input type="range" min="10" max="100" value="\${initialVal}" class="width-slider" style="width: 100%; accent-color: #7444DD; height: 6px; border-radius: 3px; cursor: pointer; box-sizing: border-box;">
              </div>
            \`;
            }

            const slider = container.querySelector('.width-slider');
            const display = container.querySelector('.width-value');

            slider.addEventListener('input', (e) => {
              const val = e.target.value;
              
              if (currentImage) {
                if (usePixelMode) {
                  // PIXEL MODE: Apply pixel width
                  display.textContent = val + 'px';
                  currentImage.style.width = val + 'px';
                  currentImage.style.height = 'auto';
                  currentImage.setAttribute('width', val);
                  currentImage.removeAttribute('height');
                } else {
                  // PERCENTAGE MODE: Apply percentage width
                  display.textContent = val + '%';
                currentImage.style.width = val + '%';
                  currentImage.style.height = 'auto';
                  currentImage.removeAttribute('width');
                  currentImage.removeAttribute('height');
                  currentImage.style.maxWidth = '100%';
                }
              }
            });

            // Insert before the width input
            // We assume widthInput is the first element in the dimensions group
            if (widthInput.parentElement) {
              widthInput.parentElement.insertBefore(container, widthInput);
            }
          }
        })();
      `;
      doc.head.appendChild(imageEditorScript);

      // Load external DnD script with error handling (only if not already loaded)
      if (!doc.querySelector('script[src="/email-editor-dnd.js"]')) {
        const dndScript = doc.createElement("script");
        dndScript.src = "/email-editor-dnd.js";
        dndScript.async = false; // Load synchronously to ensure proper initialization
        dndScript.onload = () => {
          console.log("✅ DnD script loaded successfully");
          // Force initialization after script loads
          setTimeout(() => {
            if (iframeRef.current?.contentWindow) {
              iframeRef.current.contentWindow.postMessage(
                { type: "force-initialization" },
                "*"
              );
            }
          }, 100);
        };
        dndScript.onerror = () => {
          console.error("❌ Failed to load DnD script");
        };
        doc.head.appendChild(dndScript); // Add to head instead of body
        console.log("📄 DnD script added to iframe");
      } else {
        console.log("📄 DnD script already exists, skipping");
      }

      // Disable link hover tooltip entirely
      const existingTooltip = doc.querySelector(".link-tooltip");
      if (existingTooltip) existingTooltip.remove();

      // Remove previous hover handlers if any were attached
      const existingMouseOverHandler = (doc.body as any)
        ._tooltipMouseOverHandler;
      const existingMouseOutHandler = (doc.body as any)._tooltipMouseOutHandler;
      if (existingMouseOverHandler)
        doc.body.removeEventListener("mouseover", existingMouseOverHandler);
      if (existingMouseOutHandler)
        doc.body.removeEventListener("mouseout", existingMouseOutHandler);
      (doc.body as any)._tooltipMouseOverHandler = undefined;
      (doc.body as any)._tooltipMouseOutHandler = undefined;

      // Remove existing click handler to prevent duplicates
      const existingClickHandler = (doc.body as any)._tooltipClickHandler;
      if (existingClickHandler) {
        doc.body.removeEventListener("click", existingClickHandler);
      }

      const clickHandler = (e: MouseEvent) => {
        const target = (e.target as HTMLElement).closest("a");
        if (target) {
          e.preventDefault();
          // We don't want links to be clickable in the editor
        }
      };

      (doc.body as any)._tooltipClickHandler = clickHandler;
      doc.body.addEventListener("click", clickHandler);

      // Restrict editing to explicit editable nodes only
      doc.body.contentEditable = "false";
      doc.body.style.outline = "none";

      const isInsideEditable = (el: EventTarget | null) => {
        const node = el as Element | null;
        if (!node) return false;
        return !!node.closest('[contenteditable="true"]');
      };

      const isInsidePopover = (el: EventTarget | null) => {
        const node = el as Element | null;
        if (!node) return false;
        return !!node.closest(
          ".gemini-button-control-popover, .gemini-image-control-popover, .gemini-social-block-control-popover, .gemini-social-control-popover, .gemini-insert-popover"
        );
      };

      // CMD+K shortcut to trigger link creation
      const cmdKHandler = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "k") {
          e.preventDefault();
          e.stopPropagation();

          const sel = doc.getSelection();
          if (!sel || sel.rangeCount === 0 || !sel.toString().trim()) return;

          // Save current selection
          savedRangeRef.current = sel.getRangeAt(0).cloneRange();

          const range = sel.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const iframeRect = iframeRef.current?.getBoundingClientRect();
          if (!iframeRect) return;

          // Position and show formatting popover with link sub-popover open
          setSelectedText(sel.toString());
          setPopoverPosition({
            x: iframeRect.left + rect.left + rect.width / 2,
            y: iframeRect.top + rect.top,
          });
          setShowFormatPopover(true);
          setTriggerLinkPopover(true);
        }
      };
      doc.addEventListener("keydown", cmdKHandler, true);

      // Block typing/backspace outside editable nodes
      const keydownGuard = (e: KeyboardEvent) => {
        // Allow CMD+K through (handled by cmdKHandler above)
        if ((e.metaKey || e.ctrlKey) && e.key === "k") return;

        if (isInsideEditable(e.target)) return;
        if (isInsidePopover(e.target)) return; // Allow typing in popovers

        const isCharacterKey = e.key.length === 1; // letters, numbers, symbols
        const isEditingKey =
          isCharacterKey ||
          e.key === "Backspace" ||
          e.key === "Delete" ||
          e.key === "Enter" ||
          e.key === "Tab" ||
          e.key === " ";
        if (isEditingKey) {
          e.preventDefault();
          e.stopPropagation();
        }
      };
      doc.addEventListener("keydown", keydownGuard, true);

      // Block paste/drop outside editable nodes
      const pasteGuard = (e: ClipboardEvent) => {
        if (isInsideEditable(e.target)) return;
        if (isInsidePopover(e.target)) return; // Allow paste in popovers
        e.preventDefault();
        e.stopPropagation();
      };
      const dropGuard = (e: DragEvent) => {
        if (isInsideEditable(e.target)) return;
        if (isInsidePopover(e.target)) return; // Allow drop in popovers
        e.preventDefault();
        e.stopPropagation();
      };
      doc.addEventListener("paste", pasteGuard, true);
      doc.addEventListener("drop", dropGuard, true);

      // Enhanced selection handlers with debouncing (prevent duplicates)
      const existingMouseUpHandler = (doc as any)._mouseUpHandler;
      if (existingMouseUpHandler) {
        doc.removeEventListener("mouseup", existingMouseUpHandler);
      }

      let selectionTimeout: NodeJS.Timeout;
      const mouseUpHandler = (e: MouseEvent) => {
        clearTimeout(selectionTimeout);
        selectionTimeout = setTimeout(() => {
          const target = e.target as Element;
          const block = target?.closest("tr.email-block");
          if (!block) {
            setShowFormatPopover(false);
            return;
          }

          // Check if the target or any parent within the block is contenteditable
          const editableElement = target.closest('[contenteditable="true"]');
          if (!editableElement) {
            setShowFormatPopover(false);
            return;
          }

          const selection = doc.getSelection();
          if (selection && selection.toString().trim()) {
            // Text is being selected — always clear link-edit state
            setLinkEditMode(false);
            setExistingLinkData(null);
            editingAnchorRef.current = null;

            // Ignore selections inside button links
            try {
              const container = selection.getRangeAt(0)
                .commonAncestorContainer as Node;
              const el = (
                container.nodeType === Node.ELEMENT_NODE
                  ? (container as Element)
                  : (container.parentElement as Element)
              ) as Element | null;
              if (el && el.closest && el.closest('a[data-gemini-button="1"]')) {
                setShowFormatPopover(false);
                return;
              }
            } catch { }
            const range = selection.getRangeAt(0);
            const iframeRect = iframeRef.current?.getBoundingClientRect();
            if (!iframeRect) return;

            const selectedNode =
              range.startContainer.nodeType === Node.ELEMENT_NODE
                ? range.startContainer
                : range.startContainer.parentNode;
            const block = (selectedNode as Element)?.closest?.(
              "tr.email-block"
            );

            // Find the text element that contains the selection
            const textElementTags = [
              "P",
              "SPAN",
              "DIV",
              "H1",
              "H2",
              "H3",
              "H4",
              "H5",
              "H6",
              "LI",
              "TD",
              "TH",
            ];
            let textElement: HTMLElement | null = null;
            let currentNode: Node | null = range.commonAncestorContainer;

            // Walk up the DOM tree to find a text element
            while (currentNode && currentNode !== doc.body) {
              if (currentNode.nodeType === Node.ELEMENT_NODE) {
                const el = currentNode as HTMLElement;
                if (textElementTags.includes(el.tagName)) {
                  textElement = el;
                  break;
                }
              }
              currentNode = currentNode.parentNode;
            }

            if (block) {
              const blockRect = block.getBoundingClientRect();
              setSelectedText(selection.toString());
              setPopoverPosition({
                x: iframeRect.left + blockRect.left + blockRect.width / 2,
                y: iframeRect.top + blockRect.top - 40,
              });
              // Save selection and block reference for scroll tracking
              savedRangeRef.current = range.cloneRange();
              popoverBlockRef.current = block;
              setShowFormatPopover(true);

              // Store text element for Stormy (but don't show popover yet)
              if (textElement) {
                setSelectedElementForStormy(textElement);
              } else {
                setSelectedElementForStormy(null);
              }
            } else {
              const rect = range.getBoundingClientRect();
              setSelectedText(selection.toString());
              setPopoverPosition({
                x: iframeRect.left + rect.left + rect.width / 2,
                y: iframeRect.top + rect.top - 10,
              });
              // Save selection reference for scroll tracking (no block)
              savedRangeRef.current = range.cloneRange();
              popoverBlockRef.current = null;
              setShowFormatPopover(true);

              // Store text element for Stormy (but don't show popover yet)
              if (textElement) {
                setSelectedElementForStormy(textElement);
              } else {
                setSelectedElementForStormy(null);
              }
            }
          } else {
            // No text selection — check if user clicked on an existing link
            const clickedTarget = e.target as Element;
            const clickedAnchor = clickedTarget?.closest?.("a") as HTMLAnchorElement | null;

            if (
              clickedAnchor &&
              !clickedAnchor.getAttribute("data-gemini-button") &&
              editableElement
            ) {
              // Extract existing link properties
              const href = clickedAnchor.getAttribute("href") || "";
              const color = clickedAnchor.style.color
                ? colorToHex(clickedAnchor.style.color)
                : "#0066cc";
              const textDeco = clickedAnchor.style.textDecoration || "";
              const hasUnderline = !textDeco.includes("none");
              const hasNewTab = clickedAnchor.getAttribute("target") === "_blank";

              const iframeRect = iframeRef.current?.getBoundingClientRect();
              if (iframeRect) {
                const anchorRect = clickedAnchor.getBoundingClientRect();
                editingAnchorRef.current = clickedAnchor;
                setExistingLinkData({
                  url: href,
                  color,
                  underline: hasUnderline,
                  newTab: hasNewTab,
                });
                setLinkEditMode(true);
                setSelectedText(clickedAnchor.textContent || "");
                setPopoverPosition({
                  x: iframeRect.left + anchorRect.left + anchorRect.width / 2,
                  y: iframeRect.top + anchorRect.top - 10,
                });
                popoverBlockRef.current = null;
                setShowFormatPopover(true);
              }
            } else {
              setShowFormatPopover(false);
              setLinkEditMode(false);
              setExistingLinkData(null);
              editingAnchorRef.current = null;
            }
            setSelectedElementForStormy(null);
          }
        }, 10);
      };

      (doc as any)._mouseUpHandler = mouseUpHandler;
      doc.addEventListener("mouseup", mouseUpHandler);

      // In persistent toolbar mode, forward iframe mousedown to parent so Radix popovers close
      const existingIframeMouseDown = (doc as any)._iframeMouseDownHandler;
      if (existingIframeMouseDown) {
        doc.removeEventListener("mousedown", existingIframeMouseDown);
      }
      if (hideDndControls) {
        const iframeMouseDownHandler = () => {
          document.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
        };
        (doc as any)._iframeMouseDownHandler = iframeMouseDownHandler;
        doc.addEventListener("mousedown", iframeMouseDownHandler);
      }

      // Enhanced input handler with debouncing (prevent duplicates)
      const existingInputHandler = (doc as any)._inputHandler;
      if (existingInputHandler) {
        doc.removeEventListener("input", existingInputHandler);
      }

      let inputTimeout: NodeJS.Timeout;
      const inputHandler = () => {
        clearTimeout(inputTimeout);
        inputTimeout = setTimeout(() => {
          handleInlineEdit();
        }, 100);
      };

      (doc as any)._inputHandler = inputHandler;
      doc.addEventListener("input", inputHandler);

      // Height measurement script - ignores highlight changes
      if (!doc.querySelector('script[data-height-script="true"]')) {
        const script = doc.createElement("script");
        script.setAttribute("data-height-script", "true");
        script.textContent = `
        (() => {
          let resizeTimeout;
          let lastSent = 0;

          function computeContentHeight() {
            // Force reflow to get accurate height after content removal
            // scrollHeight is "sticky" and doesn't shrink immediately
            const wrapper = document.getElementById('emailWrapper');
            if (wrapper) {
              // Measure the actual content wrapper - more reliable than document.scrollHeight
              const rect = wrapper.getBoundingClientRect();
              const wrapperHeight = rect.height + 40; // Add some padding
              const finalHeight = Math.max(wrapperHeight, 400);
              return finalHeight;
            }
            
            // Fallback: force body height reset to get accurate measurement
            const originalHeight = document.body.style.height;
            document.body.style.height = 'auto';
            
            const documentHeight = Math.max(
              document.documentElement.scrollHeight || 0,
              document.body.scrollHeight || 0
            );
            
            document.body.style.height = originalHeight;
            
            // Ensure minimum height of 400px
            const finalHeight = Math.max(documentHeight, 400);
            
            return finalHeight;
          }

          function sendHeight(force = false) {
            const height = computeContentHeight();
            
            // Only send if height changed significantly
            if (!force && Math.abs(height - lastSent) < 5) return;
            
            lastSent = height;
            window.parent.postMessage({ type: 'resize', height }, '*');
          }

          function debouncedSendHeight() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => sendHeight(false), 100);
          }

          // Initial height calculation
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => sendHeight(true));
          } else {
            sendHeight(true);
          }
          
          // Listen to input changes for text edits
          document.addEventListener('input', debouncedSendHeight);
          window.addEventListener('load', () => sendHeight(true));
          
          // Watch for DOM mutations (block delete, add, move) to recalculate height
          const mutationObserver = new MutationObserver((mutations) => {
            // Check if any mutation affects the email content structure
            const hasStructuralChange = mutations.some(m => 
              m.type === 'childList' && 
              (m.addedNodes.length > 0 || m.removedNodes.length > 0)
            );
            if (hasStructuralChange) {
              // Delay slightly to let DOM settle after operations
              setTimeout(() => sendHeight(true), 150);
            }
          });
          
          // Observe the email wrapper for structural changes
          const wrapper = document.getElementById('emailWrapper');
          if (wrapper) {
            mutationObserver.observe(wrapper, { 
              childList: true, 
              subtree: true 
            });
          }
          
          // Listen for force height recalculation messages
          window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'force-height-recalc') {
              console.log('📏 Force height recalculation triggered');
              setTimeout(() => sendHeight(true), 50);
            }
          });
        })();
      `;
        doc.head.appendChild(script);
        console.log("📄 Height measurement script added to iframe");
      }

      // Restore selection if we have one saved
      setTimeout(() => {
        restoreSelection();
      }, 100);

      // Hide all popovers and controls on initial load - AGGRESSIVE HIDING
      const hideAllPopovers = () => {
        const iframe = iframeRef.current;
        if (iframe?.contentWindow && iframe?.contentDocument) {
          // Send messages to DnD script
          iframe.contentWindow.postMessage({ type: "hide-all-popovers" }, "*");
          iframe.contentWindow.postMessage(
            { type: "hide-insert-popover" },
            "*"
          );
          iframe.contentWindow.postMessage({ type: "clear-highlight" }, "*");
          iframe.contentWindow.postMessage({ type: "close-all-popovers" }, "*");

          // Directly hide all popover elements in the iframe
          const popovers = iframe.contentDocument.querySelectorAll(
            ".gemini-button-control-popover, .gemini-image-control-popover, .gemini-social-block-control-popover, .gemini-social-control-popover, .gemini-insert-popover"
          );
          popovers.forEach((popover: Element) => {
            (popover as HTMLElement).style.display = "none";
          });

          console.log("📄 Aggressively hid all popovers on initial load");
        }
      };

      // Hide immediately and again after delay to catch late-loaded popovers
      setTimeout(hideAllPopovers, 100);
      setTimeout(hideAllPopovers, 300);
      setTimeout(hideAllPopovers, 500);
    },
    [iframeRef, saveSelection, restoreSelection, handleInlineEdit, editorBodyGray, editorBackgroundStyle, hideDndControls]
  );

  // Ref to track if we're currently processing history to prevent duplicate runs
  const isProcessingHistoryRef = useRef(false);
  const lastHistoryContentRef = useRef<string>("");

  // Enhanced iframe content management
  useEffect(() => {
    // Skip during history application - the history effect handles this
    if (isApplyingHistory || isProcessingHistoryRef.current) {
      return;
    }

    // Skip write when we just synced from iframe — unless parent pushed newer HTML
    // (e.g. DigiStorms badge after finalizeHtml). Otherwise badge never appears until edit.
    if (syncJustHappenedRef?.current) {
      syncJustHappenedRef.current = false;
      if (email.content === lastSyncedContentRef.current) {
        return;
      }
    }

    if (iframeRef.current && email.content && email.isHtml) {
      const parentPushedNewHtml =
        email.content !== lastSyncedContentRef.current;
      // Prop-driven updates (badge init, tweaks) must apply even if state machine is busy
      if (!canWriteContent() && !parentPushedNewHtml) {
        return;
      }

      const iframe = iframeRef.current;
      const existingDoc =
        iframe.contentDocument || iframe.contentWindow?.document;
      const hasDnDScript = !!existingDoc?.querySelector(
        'script[src="/email-editor-dnd.js"]'
      );

      // CRITICAL: If content hasn't changed, DON'T rewrite the iframe
      // This prevents destroying the DnD script during sync cycles or rapid updates
      if (lastSyncedContentRef.current === email.content) {
        // Content is already in sync - just ensure the script is setup if missing
        if (!hasDnDScript && existingDoc) {
          console.log(
            "📄 Content in sync but script missing, setting up iframe only"
          );
          setupIframe(existingDoc);
        }
        // If HTML contains blended footer table, move badge below it (detect from DOM, not props)
        if (existingDoc) {
          const blendedFooter = existingDoc.querySelector('table[data-blended-footer="1"]');
          const badgeRow = existingDoc.querySelector('tr[data-digistorms-badge="1"]');
          const wrapperTd = existingDoc.querySelector("#emailWrapper")?.querySelector(":scope > tbody > tr > td");
          if (
            blendedFooter &&
            badgeRow &&
            wrapperTd?.contains(badgeRow) &&
            !blendedFooter.contains(badgeRow)
          ) {
            const tbody = blendedFooter.querySelector("tbody");
            if (tbody) {
              badgeRow.remove();
              tbody.appendChild(badgeRow);
            }
          }
        }
        return;
      }

      const doc = iframe.contentDocument || iframe.contentWindow?.document;

      if (doc) {
        console.log(
          "📄 Iframe useEffect triggered - writing email content to iframe"
        );
        lastSyncedContentRef.current = email.content;

        // Write content first
        writeIframeContent(email.content);

        // Setup iframe after content is written
        setTimeout(() => {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          setupIframe(iframeDoc || doc);
          // If HTML contains blended footer table, move badge below it (detect from DOM)
          if (iframeDoc) {
            const blendedFooter = iframeDoc.querySelector('table[data-blended-footer="1"]');
            const badgeRow = iframeDoc.querySelector('tr[data-digistorms-badge="1"]');
            const wrapperTd = iframeDoc.querySelector("#emailWrapper")?.querySelector(":scope > tbody > tr > td");
            if (
              blendedFooter &&
              badgeRow &&
              wrapperTd?.contains(badgeRow) &&
              !blendedFooter.contains(badgeRow)
            ) {
              const tbody = blendedFooter.querySelector("tbody");
              if (tbody) {
                badgeRow.remove();
                tbody.appendChild(badgeRow);
              }
            }
          }
        }, 100); // Increased delay to ensure content is fully loaded
      }
    }
  }, [
    email.content,
    email.isHtml,
    canWriteContent,
    lastSyncedContentRef,
    writeIframeContent,
    setupIframe,
    isApplyingHistory,
  ]);

  // Handle undo/redo - force iframe rewrite when isApplyingHistory is true
  // This bypasses the normal canWriteContent check which blocks writes during history application
  useEffect(() => {
    // Guard: Only process once per history application cycle
    if (!isApplyingHistory) {
      isProcessingHistoryRef.current = false;
      return;
    }

    if (!email.content || !email.isHtml) return;

    // Guard: Prevent duplicate processing for same content
    if (
      isProcessingHistoryRef.current &&
      lastHistoryContentRef.current === email.content
    ) {
      return;
    }

    const iframe = iframeRef.current;
    if (!iframe) return;

    // Mark as processing
    isProcessingHistoryRef.current = true;
    lastHistoryContentRef.current = email.content;

    console.log("↩️ History application - rewriting iframe content");

    // Clean historical content to remove editor UI artifacts before writing
    const cleanHistoricalContent = (html: string): string => {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        // Remove all editor control elements
        doc
          .querySelectorAll(".gemini-left-controls, .gemini-right-controls")
          .forEach((el) => el.remove());

        // Remove editor-related classes from all elements
        doc.querySelectorAll("[class]").forEach((el) => {
          const classes = el.className
            .split(" ")
            .filter(
              (c) =>
                !c.startsWith("gemini-") ||
                c === "gemini-placeholder" ||
                c === "gemini-image-wrapper"
            );
          el.className = classes.join(" ").trim();
          if (!el.className) el.removeAttribute("class");
        });

        // Remove contenteditable from body
        doc.body?.removeAttribute("contenteditable");

        // Remove draggable attributes
        doc
          .querySelectorAll("[draggable]")
          .forEach((el) => el.removeAttribute("draggable"));

        return doc.documentElement.outerHTML;
      } catch (e) {
        console.error("Error cleaning historical content:", e);
        return html;
      }
    };

    // Hide iframe briefly during transition to prevent flash of editor controls
    iframe.style.opacity = "0";
    iframe.style.transition = "opacity 0.08s ease-out";

    // Clean and write content
    const cleanedContent = cleanHistoricalContent(email.content);

    // Clear lastWrittenContent to force writeIframeContent to accept the historical content
    lastWrittenContentRef.current = "";

    // Update lastSyncedContentRef to the historical content to prevent immediate re-sync
    lastSyncedContentRef.current = email.content;

    // Write the cleaned historical content to iframe
    writeIframeContent(cleanedContent);

    // Setup iframe after content is written, then fade back in
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc) {
      setTimeout(() => {
        setupIframe(doc);
        // If HTML has blended footer, move badge below it (detect from DOM)
        const blendedFooter = doc.querySelector('table[data-blended-footer="1"]');
        const badgeRow = doc.querySelector('tr[data-digistorms-badge="1"]');
        const wrapperTd = doc.querySelector("#emailWrapper")?.querySelector(":scope > tbody > tr > td");
        if (
          blendedFooter &&
          badgeRow &&
          wrapperTd?.contains(badgeRow) &&
          !blendedFooter.contains(badgeRow)
        ) {
          const tbody = blendedFooter.querySelector("tbody");
          if (tbody) {
            badgeRow.remove();
            tbody.appendChild(badgeRow);
          }
        }
        // Fade iframe back in after setup is complete
        iframe.style.opacity = "1";
        console.log("✅ History applied");
      }, 80);
    }
  }, [isApplyingHistory, email.content, email.isHtml]); // Reduced dependencies - only react to actual state changes

  // Ensure the editor controls are present when returning to this view
  // (e.g., after navigating to the portal and back) even if the content
  // string hasn't changed and the above effect short-circuits.
  useEffect(() => {
    // Skip during history application - the history effect handles setup
    if (isApplyingHistory || isProcessingHistoryRef.current) return;

    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    const hasDnDScript = !!doc.querySelector(
      'script[src="/email-editor-dnd.js"]'
    );
    const hasControls = !!doc.body?.querySelector(".gemini-left-controls");

    // If the script is missing (new iframe mount), inject styles/script
    if (!hasDnDScript) {
      setupIframe(doc);
      return;
    }

    // If script exists but controls aren't attached yet, force init
    if (hasDnDScript && !hasControls) {
      try {
        iframe.contentWindow?.postMessage(
          { type: "force-initialization" },
          "*"
        );
      } catch (_) {
        // no-op
      }
    }

    // If HTML has blended footer, ensure badge is below it (detect from DOM)
    const blendedFooter = doc.querySelector('table[data-blended-footer="1"]');
    const badgeRow = doc.querySelector('tr[data-digistorms-badge="1"]');
    const wrapperTd = doc.querySelector("#emailWrapper")?.querySelector(":scope > tbody > tr > td");
    if (
      blendedFooter &&
      badgeRow &&
      wrapperTd?.contains(badgeRow) &&
      !blendedFooter.contains(badgeRow)
    ) {
      const tbody = blendedFooter.querySelector("tbody");
      if (tbody) {
        badgeRow.remove();
        tbody.appendChild(badgeRow);
      }
    }
  }, [iframeRef, setupIframe, email.id, isApplyingHistory, editorBodyGray, isIframeReady]);

  // Enhanced message handling
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;

      if (
        event.data.type === "resize" &&
        typeof event.data.height === "number"
      ) {
        setIframeHeight(event.data.height);
      } else if (event.data.type === "dnd-update") {
        // Get operation type from the message, default to 'block-move'
        const operation = event.data.operation || "block-move";

        // Content changed inside iframe - invalidate lastWrittenContentRef
        // so undo/redo can detect that the iframe content differs from what was last written
        lastWrittenContentRef.current = "";

        // Handle block operation through state machine
        handleBlockOperation(
          operation as
          | "inline-edit"
          | "block-move"
          | "block-duplicate"
          | "block-delete"
          | "block-insert"
        );
      } else if (event.data.type === "content-changed") {
        // Handle content-changed messages
        // NOTE: Standard operations (inline-edit, block-move, block-delete, etc.) are
        // already handled by the "dnd-update" message above. ParentNotifier.notifyUpdate
        // sends BOTH dnd-update and content-changed. We must NOT call handleBlockOperation
        // again here, or we'd get duplicate lock/sync cycles that race and cause the first
        // block operation to be silently reverted.
        const operation = event.data.operation || "inline-edit";
        console.log(`📝 EmailEditor received content-changed: ${operation}`);

        // Content changed inside iframe - invalidate lastWrittenContentRef
        lastWrittenContentRef.current = "";

        if (operation === "radical-refresh-1") {
          // Force sync content immediately, bypassing state machine checks
          const iframe = iframeRef.current;
          if (iframe?.contentDocument) {
            const rawContent = iframe.contentDocument.documentElement.outerHTML;
            // Process through centralized renderer - use "save" to keep email-block
            const processedContent = renderEmailForContext(rawContent, "save");
            onUpdate({ ...email, content: processedContent }, "block-insert");
            console.log("🔥 Force updated content via radical refresh");
          }
        }
        // For all other operations, skip - already handled by dnd-update above
      } else if (event.data.type === "clean-content-response") {
        // Handle clean content response for export operations
        const { content, requestId } = event.data;
        console.log(
          "📄 Received clean content for export:",
          content.length,
          "chars"
        );

        // Store the clean content for export operations
        (window as any).cleanEmailContent = content;

        // For radical refresh, force update the email content
        if (requestId === "radical-refresh-final") {
          console.log("🔥 Radical refresh final content update");
          onUpdate({ ...email, content }, "block-insert");
        }

        // Resolve any pending export operations
        if ((window as any).pendingExportResolve) {
          (window as any).pendingExportResolve(content);
          (window as any).pendingExportResolve = null;
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [email, onUpdate, handleBlockOperation]);

  // Enhanced click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      // Don't close if clicking on color picker inputs or their containers
      if (
        target.closest('input[type="color"]') ||
        target.closest(".color-picker-container") ||
        target.closest("[data-color-picker]") ||
        target.closest(".inline-formatting-popover-container") || // Added this check
        target.closest("[data-radix-popper-content-wrapper]") ||
        target.closest("[data-radix-popover-content]") ||
        target.closest(".fixed.z-50") || // InlineFormattingPopover
        target.closest(".gemini-social-block-control-popover") || // Social block popover
        (showStormyPopover && target.closest(".fixed.z-50")) // Stormy popover
      ) {
        return;
      }

      if (
        iframeRef.current &&
        !iframeRef.current.contains(event.target as Node)
      ) {
        setShowFormatPopover(false);
        setShowStormyPopover(false);
        setSelectedElementForStormy(null);
        if (iframeRef.current.contentWindow) {
          iframeRef.current.contentWindow.postMessage(
            { type: "clear-highlight" },
            "*"
          );
          // Also hide insert popover and image control popover when clicking outside
          iframeRef.current.contentWindow.postMessage(
            { type: "hide-insert-popover" },
            "*"
          );
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showStormyPopover]);

  // Focus Stormy input when popover opens
  useEffect(() => {
    if (showStormyPopover && stormyInputRef.current) {
      setTimeout(() => {
        stormyInputRef.current?.focus();
      }, 100);
    }
  }, [showStormyPopover]);

  const handleSignupSuccess = () => {
    setShowSignupModal(false);
  };

  // Stormy AI suggestions
  const stormySuggestions = [
    "Make this shorter and punchier",
    "Change the tone to be more casual",
    "Explain a bit more",
  ];

  // Handle AI editing with Stormy
  const handleStormyEdit = useCallback(
    async (prompt: string) => {
      if (!selectedElementForStormy || !prompt.trim()) return;

      setIsStormyLoading(true);
      setShowStormyPopover(false);
      const iframe = iframeRef.current;
      if (!iframe?.contentDocument) {
        setIsStormyLoading(false);
        return;
      }

      const doc = iframe.contentDocument;
      const element = selectedElementForStormy;

      // Use the actual selected text (from the selection state), or fall back to element text
      // This ensures we only send the highlighted text, not the entire element
      const originalText =
        selectedText.trim() || element.textContent?.trim() || "";

      if (!originalText) {
        console.warn("No text to edit");
        setIsStormyLoading(false);
        return;
      }

      // Reset cancellation flag
      stormyCancelledRef.current = false;

      try {
        console.log("🌪️ Stormy is processing:", prompt);

        const response = await fetch(
          "https://api-test.digistorms.net/email-generator/ask-stormy-edit",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              use_case: selectedUseCase || "general",
              content_to_modify: originalText,
              instructions: prompt,
            }),
          }
        );

        // Check if request was cancelled
        if (stormyCancelledRef.current) {
          console.log("🚫 Stormy request was cancelled");
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to edit content: HTTP ${response.status}`);
        }

        const result = await response.json();

        let editedText =
          result?.editedContent || result?.content || originalText;

        // Strip any HTML tags from AI response to ensure we only get plain text
        // This prevents the AI from adding inline styles like font-family: Times
        const tempDiv = doc.createElement("div");
        tempDiv.innerHTML = editedText;
        editedText = tempDiv.textContent || tempDiv.innerText || editedText;

        // Trim trailing whitespace and newlines to avoid extra <br> tags at the end
        editedText = editedText.trim();

        // Check if the response has multiple paragraphs (line breaks)
        const hasMultipleParagraphs = editedText.includes("\n\n") || editedText.includes("\n");

        // Convert line breaks to <br> tags for proper email rendering
        // \n\n = paragraph break (double line break)
        // \n = line break
        // Trim trailing <br> tags to avoid extra spacing
        let formattedText = editedText
          .replace(/\n\n/g, "<br><br>")
          .replace(/\n/g, "<br>");

        // Remove trailing <br> tags (single or double) to prevent extra spacing
        formattedText = formattedText.replace(/(<br\s*\/?>)+$/gi, "");

        // Update only the selected text, preserving HTML structure (icons, images) and styles
        const selection = doc.getSelection();
        if (selection && savedRangeRef.current) {
          try {
            // Restore the selection range
            selection.removeAllRanges();
            const range = savedRangeRef.current.cloneRange();
            selection.addRange(range);

            // Get the container element and its computed styles to preserve font
            const container =
              range.commonAncestorContainer.nodeType === Node.TEXT_NODE
                ? range.commonAncestorContainer.parentElement
                : (range.commonAncestorContainer as HTMLElement);

            // Get font styles from the container element
            // Prioritize inline styles over computed styles to avoid browser defaults
            const containerInlineStyle = container?.getAttribute("style") || "";

            // Extract font-family from inline style if present
            let fontFamily = "";
            if (containerInlineStyle) {
              const fontFamilyMatch = containerInlineStyle.match(
                /font-family:\s*([^;]+)/i
              );
              if (fontFamilyMatch) {
                fontFamily = fontFamilyMatch[1].trim();
              }
            }

            // Fall back to computed style only if no inline style found
            if (!fontFamily && container) {
              const computedStyle = window.getComputedStyle(container);
              fontFamily = computedStyle.fontFamily || "";

              // Filter out browser defaults like "Times", "serif", etc.
              // Only use if it contains Arial, Helvetica, Inter, or sans-serif
              if (
                fontFamily &&
                !/arial|helvetica|inter|sans-serif/i.test(fontFamily)
              ) {
                fontFamily = "";
              }
            }

            // Use editor default if no valid font found
            if (!fontFamily) {
              fontFamily = "Arial, Helvetica, sans-serif, Inter";
            }

            const fontSize =
              container?.style?.fontSize ||
              (container ? window.getComputedStyle(container).fontSize : "") ||
              "";
            const fontStyle =
              container?.style?.fontStyle ||
              (container ? window.getComputedStyle(container).fontStyle : "") ||
              "";
            const fontWeight =
              container?.style?.fontWeight ||
              (container
                ? window.getComputedStyle(container).fontWeight
                : "") ||
              "";
            const color =
              container?.style?.color ||
              (container ? window.getComputedStyle(container).color : "") ||
              "";
            const lineHeight =
              container?.style?.lineHeight ||
              (container
                ? window.getComputedStyle(container).lineHeight
                : "") ||
              "";

            // Extract only text nodes from the range (exclude images/icons)
            const textNodes: Text[] = [];
            const walker = doc.createTreeWalker(
              range.commonAncestorContainer,
              NodeFilter.SHOW_TEXT,
              {
                acceptNode: (node) => {
                  if (range.intersectsNode(node)) {
                    return NodeFilter.FILTER_ACCEPT;
                  }
                  return NodeFilter.FILTER_REJECT;
                },
              }
            );

            let node;
            while ((node = walker.nextNode())) {
              if (node.textContent?.trim()) {
                textNodes.push(node as Text);
              }
            }

            // If we found text nodes, replace them
            if (textNodes.length > 0) {
              // Collect all text content from selected nodes
              const allSelectedText = textNodes
                .map((n) => n.textContent)
                .join("");

              // Remove other text nodes that were part of the selection first
              for (let i = 1; i < textNodes.length; i++) {
                const parent = textNodes[i].parentNode;
                if (parent) {
                  parent.removeChild(textNodes[i]);
                }
              }

              // Handle multi-paragraph content with <br> tags
              if (hasMultipleParagraphs) {
                // Create a span to hold the formatted content with line breaks
                const span = doc.createElement("span");
                const styleParts: string[] = [];
                styleParts.push(`font-family: ${fontFamily}`);
                if (fontSize) styleParts.push(`font-size: ${fontSize}`);
                if (fontStyle) styleParts.push(`font-style: ${fontStyle}`);
                if (fontWeight) styleParts.push(`font-weight: ${fontWeight}`);
                if (color) styleParts.push(`color: ${color}`);
                if (lineHeight) styleParts.push(`line-height: ${lineHeight}`);

                if (styleParts.length > 0) {
                  span.setAttribute("style", styleParts.join("; "));
                }

                // Use innerHTML to render <br> tags as actual line breaks
                span.innerHTML = formattedText;

                // Replace the text node with our new span
                const parent = textNodes[0].parentNode;
                if (parent) {
                  parent.replaceChild(span, textNodes[0]);
                }
              } else {
                // Simple text replacement (no line breaks)
                textNodes[0].textContent = editedText;

                // Don't wrap in a span - let the parent element's styles handle the font
                // The parent already has the correct font-family from the email template
                // Only wrap if absolutely necessary and parent has no styles at all
                const parent = textNodes[0].parentElement;
                if (
                  parent &&
                  !parent.getAttribute("style") &&
                  parent.tagName !== "B" &&
                  parent.tagName !== "STRONG" &&
                  parent.tagName !== "I" &&
                  parent.tagName !== "EM" &&
                  parent.tagName !== "SPAN"
                ) {
                  // Check if we need to preserve any styles
                  const needsStylePreservation =
                    fontSize || fontStyle || fontWeight || color || lineHeight;

                  if (needsStylePreservation) {
                    const span = doc.createElement("span");
                    const styleParts: string[] = [];
                    // Always use the editor's default font family
                    styleParts.push(`font-family: ${fontFamily}`);
                    if (fontSize) styleParts.push(`font-size: ${fontSize}`);
                    if (fontStyle) styleParts.push(`font-style: ${fontStyle}`);
                    if (fontWeight) styleParts.push(`font-weight: ${fontWeight}`);
                    if (color) styleParts.push(`color: ${color}`);
                    if (lineHeight) styleParts.push(`line-height: ${lineHeight}`);

                    if (styleParts.length > 0) {
                      span.setAttribute("style", styleParts.join("; "));
                      parent.insertBefore(span, textNodes[0]);
                      span.appendChild(textNodes[0]);
                    }
                  }
                }
              }
            } else {
              // No text nodes found in range, find text nodes in the element
              const walker = doc.createTreeWalker(
                element,
                NodeFilter.SHOW_TEXT,
                null
              );

              const allTextNodes: Text[] = [];
              let node;
              while ((node = walker.nextNode())) {
                if (node.textContent?.trim()) {
                  allTextNodes.push(node as Text);
                }
              }

              // Replace the first text node with the edited text, remove others
              if (allTextNodes.length > 0) {
                // Remove other text nodes first
                for (let i = 1; i < allTextNodes.length; i++) {
                  const parent = allTextNodes[i].parentNode;
                  if (parent) {
                    parent.removeChild(allTextNodes[i]);
                  }
                }

                // Handle multi-paragraph content
                if (hasMultipleParagraphs) {
                  const span = doc.createElement("span");
                  span.innerHTML = formattedText;
                  const parent = allTextNodes[0].parentNode;
                  if (parent) {
                    parent.replaceChild(span, allTextNodes[0]);
                  }
                } else {
                  allTextNodes[0].textContent = editedText;
                }
              } else {
                // No text nodes found, append the edited text
                if (hasMultipleParagraphs) {
                  const span = doc.createElement("span");
                  span.innerHTML = formattedText;
                  element.appendChild(span);
                } else {
                  element.appendChild(doc.createTextNode(editedText));
                }
              }
            }

            // Clean up: Remove trailing <br> tags from spans we just inserted
            // This prevents extra spacing at the end of the content
            if (hasMultipleParagraphs) {
              // Find the span we just inserted and clean up trailing breaks
              const insertedSpans = container?.querySelectorAll('span[style*="font-family"]');
              if (insertedSpans && insertedSpans.length > 0) {
                // Clean up the most recently inserted span (last one)
                const lastSpan = insertedSpans[insertedSpans.length - 1] as HTMLElement;
                let html = lastSpan.innerHTML;
                // Remove trailing <br> tags (single or multiple)
                html = html.replace(/(<br\s*\/?>)+$/gi, "");
                // Also remove trailing <br> tags followed by whitespace
                html = html.replace(/(<br\s*\/?>\s*)+$/gi, "");
                lastSpan.innerHTML = html;
              }
            }

            // Clear selection after insertion
            selection.removeAllRanges();
          } catch (error) {
            console.warn(
              "Failed to use selection range, falling back to element text replacement:",
              error
            );
            // Fallback: replace only text content, preserving HTML structure
            // Find and replace text nodes while preserving all other elements
            const fallbackWalker = doc.createTreeWalker(
              element,
              NodeFilter.SHOW_TEXT,
              null
            );

            const fallbackTextNodes: Text[] = [];
            let fallbackNode;
            while ((fallbackNode = fallbackWalker.nextNode())) {
              if (fallbackNode.textContent?.trim()) {
                fallbackTextNodes.push(fallbackNode as Text);
              }
            }

            // Replace the first text node with the edited text, remove others
            if (fallbackTextNodes.length > 0) {
              // Remove other text nodes first
              for (let i = 1; i < fallbackTextNodes.length; i++) {
                const parent = fallbackTextNodes[i].parentNode;
                if (parent) {
                  parent.removeChild(fallbackTextNodes[i]);
                }
              }

              // Handle multi-paragraph content
              if (hasMultipleParagraphs) {
                const span = doc.createElement("span");
                span.innerHTML = formattedText;
                const parent = fallbackTextNodes[0].parentNode;
                if (parent) {
                  parent.replaceChild(span, fallbackTextNodes[0]);
                }
              } else {
                fallbackTextNodes[0].textContent = editedText;
              }
            } else {
              // No text nodes found, append the edited text
              if (hasMultipleParagraphs) {
                const span = doc.createElement("span");
                span.innerHTML = formattedText;
                element.appendChild(span);
              } else {
                element.appendChild(doc.createTextNode(editedText));
              }
            }
          }
        } else {
          // No selection range available, use fallback method
          // Find and replace text nodes while preserving all other elements
          const noSelectionWalker = doc.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null
          );

          const noSelectionTextNodes: Text[] = [];
          let noSelectionNode;
          while ((noSelectionNode = noSelectionWalker.nextNode())) {
            if (noSelectionNode.textContent?.trim()) {
              noSelectionTextNodes.push(noSelectionNode as Text);
            }
          }

          // Replace the first text node with the edited text, remove others
          if (noSelectionTextNodes.length > 0) {
            // Remove other text nodes first
            for (let i = 1; i < noSelectionTextNodes.length; i++) {
              const parent = noSelectionTextNodes[i].parentNode;
              if (parent) {
                parent.removeChild(noSelectionTextNodes[i]);
              }
            }

            // Handle multi-paragraph content
            if (hasMultipleParagraphs) {
              const span = doc.createElement("span");
              span.innerHTML = formattedText;
              const parent = noSelectionTextNodes[0].parentNode;
              if (parent) {
                parent.replaceChild(span, noSelectionTextNodes[0]);
              }
            } else {
              noSelectionTextNodes[0].textContent = editedText;
            }
          } else {
            // No text nodes found, append the edited text
            if (hasMultipleParagraphs) {
              const span = doc.createElement("span");
              span.innerHTML = formattedText;
              element.appendChild(span);
            } else {
              element.appendChild(doc.createTextNode(editedText));
            }
          }
        }

        // Trigger content update
        handleInlineEdit();

        console.log(
          "✅ Text updated from:",
          originalText.substring(0, 50),
          "to:",
          editedText.substring(0, 50)
        );

        // Close popovers and clear selection after successful edit
        setShowStormyPopover(false);
        setShowFormatPopover(false);
        setSelectedElementForStormy(null);

        // Clear selection in iframe
        if (doc.getSelection) {
          const selection = doc.getSelection();
          if (selection) {
            selection.removeAllRanges();
          }
        }
      } catch (error) {
        // Don't show error if request was cancelled
        if (stormyCancelledRef.current) {
          console.log("🚫 Stormy request was cancelled");
          return;
        }

        console.error("❌ Error calling Stormy AI:", error);
        // Show error message
        const errorDiv = doc.createElement("div");
        errorDiv.style.cssText = `
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        background: #fee2e2 !important;
        color: #991b1b !important;
        padding: 20px 32px !important;
        border-radius: 12px !important;
        box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important;
        z-index: 10003 !important;
        border: 1px solid #fecaca !important;
        font-size: 14px !important;
      `;
        errorDiv.textContent = `Error: ${error instanceof Error ? error.message : "Unknown error"
          }`;
        doc.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
      } finally {
        if (!stormyCancelledRef.current) {
          setIsStormyLoading(false);
          setSelectedElementForStormy(null);
        }
      }
    },
    [selectedUseCase, handleInlineEdit, selectedElementForStormy, selectedText]
  );

  /** Guest on Customize (and elsewhere): block editor + toolbar interaction until sign-in */
  const guestEditorLocked = !authLoading && (!user || !session);

  return (
    <div className="max-w-7xl mx-auto border border-gray-200 rounded-2xl">
      {/* Live Preview - Full Width */}
      <div className="bg-white rounded-2xl overflow-hidden relative">
        {/* Email metadata (From, To, Subject) */}
        <div className="bg-white px-6 py-4 border-b space-y-1.5">
          <div className="text-sm flex">
            <span className="text-muted-foreground w-16 shrink-0">From:</span>
            <span className="min-w-0">
              {fromSenderName?.trim()
                ? `${fromSenderName.trim()} <hello@${companyDomain || "company.com"}>`
                : `hello@${companyDomain || "company.com"}`}
            </span>
          </div>
          <div className="text-sm flex">
            <span className="text-muted-foreground w-16 shrink-0">To:</span>
            <span className="min-w-0">you@example.com</span>
          </div>
          {subjectPreviewInline ? (
            subjectPreviewInline
          ) : (
            <>
              <div className="text-sm flex">
                <span className="text-muted-foreground w-16 shrink-0">Subject:</span>
                {suggestionsLoading ? (
                  <span className="text-muted-foreground animate-pulse">...</span>
                ) : (
                  <span className="font-medium min-w-0">{subject ?? email.subject ?? "No subject"}</span>
                )}
              </div>
              <div className="text-sm flex">
                <span className="text-muted-foreground w-16 shrink-0">Preview:</span>
                {suggestionsLoading ? (
                  <span className="text-muted-foreground animate-pulse">...</span>
                ) : (preview || email.preview) ? (
                  <span className="text-muted-foreground min-w-0">{preview ?? email.preview ?? ""}</span>
                ) : (
                  <span className="text-muted-foreground">No preview text</span>
                )}
              </div>
            </>
          )}
        </div>

        <div className="relative">
          {/* Persistent formatting toolbar (reuses InlineFormattingPopover in static mode) */}
          {hideDndControls && (
            <InlineFormattingPopover
              persistent
              isOpen={true}
              onClose={() => { }}
              position={{ x: 0, y: 0 }}
              selectedText={selectedText}
              onFormat={(command, value) => {
                if (guestEditorLocked) return;
                // Ensure iframe selection is restored before executing
                const iframe = iframeRef.current;
                if (iframe?.contentDocument) {
                  const sel = iframe.contentDocument.getSelection();
                  if (savedRangeRef.current && sel) {
                    sel.removeAllRanges();
                    sel.addRange(savedRangeRef.current);
                  }
                }
                exec(command, value);
              }}
              showStormyButton={!isStormyLoading && !guestEditorLocked}
              openLinkPopover={triggerLinkPopover}
              onLinkPopoverOpened={() => setTriggerLinkPopover(false)}
              existingLinkData={existingLinkData}
              linkEditMode={linkEditMode}
              onSaveSelection={() => {
                const iframe = iframeRef.current;
                if (!iframe?.contentDocument) return;
                const sel = iframe.contentDocument.getSelection();
                if (sel && sel.rangeCount > 0) {
                  savedRangeRef.current = sel.getRangeAt(0).cloneRange();
                }
              }}
              onOpenStormy={() => {
                if (guestEditorLocked) return;
                if (iframeRef.current && !isStormyLoading) {
                  const iframe = iframeRef.current;
                  const stormyEl = selectedElementForStormy
                    || iframe.contentDocument?.getElementById("email-body")
                    || null;
                  if (stormyEl) {
                    setSelectedElementForStormy(stormyEl);
                    const iframeRect = iframe.getBoundingClientRect();
                    setStormyPopoverPosition({
                      x: iframeRect.left + iframeRect.width / 2,
                      y: iframeRect.top - 60,
                    });
                    setShowStormyPopover(true);
                  }
                }
              }}
            />
          )}

          <div className="">
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            {email.content && email.isHtml ? (
              <div className="relative">
                <div
                  style={{
                    filter: isStormyLoading ? "blur(2px)" : "none",
                    transition: "filter 0.2s ease",
                    pointerEvents:
                      isStormyLoading || guestEditorLocked ? "none" : "auto",
                  }}
                >
                  <iframe
                    ref={iframeRef}
                    data-email-editor="true"
                    className="w-full border-0 min-h-[250px]"
                    style={{
                      height: `${iframeHeight}px`,
                    }}
                    title="Email Preview"
                  />
                </div>
                {/* Loading indicator */}
                {!isIframeReady && (
                  <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                    <div className="text-gray-500">Loading editor...</div>
                  </div>
                )}

                {/* Stormy Loading Overlay */}
                {isStormyLoading && (
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-auto">
                    <div className="bg-white rounded-lg shadow-xl p-6 flex flex-col items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        <span
                          className="text-sm font-medium text-gray-700"
                          style={{ fontFamily: "Arial, sans-serif" }}
                        >
                          Stormy is working his magic ⚡
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          stormyCancelledRef.current = true;
                          setIsStormyLoading(false);
                          setShowStormyPopover(false);
                          setShowFormatPopover(false);
                          setSelectedElementForStormy(null);

                          // Clear selection in iframe
                          const iframe = iframeRef.current;
                          if (iframe?.contentDocument) {
                            const doc = iframe.contentDocument;
                            if (doc.getSelection) {
                              const selection = doc.getSelection();
                              if (selection) {
                                selection.removeAllRanges();
                              }
                            }
                          }
                        }}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        style={{ fontFamily: "Arial, sans-serif" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <p>No email content available</p>
              </div>
            )}
          </div>
        </div>

          {/* Guest: cover toolbar + body — no blur; blocks clicks (opacity only) */}
          {guestEditorLocked && (
            <div className="absolute inset-0 z-[100] flex items-center justify-center bg-white/90 pointer-events-auto">
              <div className="bg-white rounded-lg p-6 max-w-md mx-4 text-center shadow-xl border border-border">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Sign In
                </h3>
                <p className="text-gray-600 mb-4">
                  Get access to the email editor and save your work.
                </p>
                <button
                  type="button"
                  onClick={() => setShowSignupModal(true)}
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Inline Formatting Popover (hidden when persistent toolbar is active) */}
      <InlineFormattingPopover
        isOpen={!hideDndControls && showFormatPopover && !isStormyLoading}
        onClose={() => {
          setShowFormatPopover(false);
          setShowStormyPopover(false);
          setLinkEditMode(false);
          setExistingLinkData(null);
          editingAnchorRef.current = null;
        }}
        position={popoverPosition}
        selectedText={selectedText}
        onFormat={exec}
        showStormyButton={!!selectedElementForStormy && !isStormyLoading}
        openLinkPopover={triggerLinkPopover}
        onLinkPopoverOpened={() => setTriggerLinkPopover(false)}
        existingLinkData={existingLinkData}
        linkEditMode={linkEditMode}
        onOpenStormy={() => {
          if (
            selectedElementForStormy &&
            iframeRef.current &&
            !isStormyLoading
          ) {
            const iframeRect = iframeRef.current.getBoundingClientRect();
            // Use the same position as the formatting popover, but offset upward
            setStormyPopoverPosition({
              x: popoverPosition.x,
              y: popoverPosition.y - 60, // Position above the formatting popover
            });
            setShowStormyPopover(true);
          }
        }}
      />

      {/* Stormy AI Popover */}
      {showStormyPopover && selectedElementForStormy && !isStormyLoading && (
        <div
          className="fixed z-50 bg-background border border-border rounded-lg shadow-lg backdrop-blur-sm"
          style={{
            left: Math.max(
              10,
              Math.min(
                stormyPopoverPosition.x - 150,
                window.innerWidth - 300 - 10
              )
            ),
            top: Math.max(stormyPopoverPosition.y, 10),
            fontFamily: "Arial, sans-serif",
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
        >
          <div
            className="p-4 w-[300px]"
            style={{ fontFamily: "Arial, sans-serif" }}
          >
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <img
                    src="/lovable-uploads/8e728019-0b85-4a18-bc89-6b6583826e7d.png"
                    className="w-6 h-6 rounded-full"
                    alt="Stormy"
                  />
                  <span
                    className="text-sm font-semibold text-foreground"
                    style={{ fontFamily: "Arial, sans-serif" }}
                  >
                    AI Editor
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowStormyPopover(false);
                    // Don't clear selectedElementForStormy - keep the button visible
                  }}
                  className="text-muted-foreground hover:text-foreground"
                  title="Close"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md px-2.5 py-1.5">
                <p
                  className="text-xs text-yellow-800 leading-relaxed"
                  style={{ fontFamily: "Arial, sans-serif" }}
                >
                  Select the text content you want to transform
                </p>
              </div>
            </div>
            <textarea
              ref={stormyInputRef}
              className="w-full p-2 border border-border rounded-md text-sm mb-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ fontFamily: "Arial, sans-serif" }}
              placeholder="Try: make this shorter, change the tone, explain more…"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (stormyInputRef.current?.value.trim()) {
                    handleStormyEdit(stormyInputRef.current.value.trim());
                  }
                }
                if (e.key === "Escape") {
                  setShowStormyPopover(false);
                  // Don't clear selectedElementForStormy - keep the button visible
                }
              }}
            />
            <div className="flex flex-col gap-2 mb-3">
              {stormySuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  className="px-3 py-2 text-xs text-left bg-muted hover:bg-primary hover:text-primary-foreground rounded-md transition-colors"
                  style={{ fontFamily: "Arial, sans-serif" }}
                  onClick={() => {
                    if (stormyInputRef.current) {
                      stormyInputRef.current.value = suggestion;
                      stormyInputRef.current.focus();
                    }
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: "Arial, sans-serif" }}
              disabled={isStormyLoading}
              onClick={() => {
                if (stormyInputRef.current?.value.trim()) {
                  handleStormyEdit(stormyInputRef.current.value.trim());
                }
              }}
            >
              {isStormyLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22,2 15,22 11,13 2,9 22,2" />
                  </svg>
                  Generate
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Signup Modal removed for email-generator */}
    </div>
  );
};
