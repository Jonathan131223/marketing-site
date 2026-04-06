/**
 * Standardized Email Renderer
 *
 * This utility provides consistent email HTML rendering across all components.
 * All visual fixes are applied consistently, with only context-specific features
 * (like editor controls) being added on top.
 */

import { stripDigiStormsBadge } from "@/utils/digiStormsBadge";

export type EmailRenderContext =
  | "editor" // EmailEditor - adds editing controls
  | "preview" // EmailGallery - minimal preview styles
  | "portal" // UserPortal - read-only preview
  | "save" // For saving drafts - strips controls but keeps email-block
  | "export" // AIGeneratorPanel - clean for export/download
  | "email-client"; // For sending emails - minimal processing

/**
 * Main email rendering function
 */
export function renderEmailForContext(
  htmlContent: string,
  context: EmailRenderContext
): string {
  if (!htmlContent || typeof htmlContent !== "string") {
    return "";
  }

  // Never surface the legacy "Powered by DigiStorms" footer row
  let processed = stripDigiStormsBadge(htmlContent);

  // First, apply all standard visual fixes consistently
  processed = applyStandardEmailFixes(processed);

  // Ensure unsubscribe text is always wrapped in a link
  processed = ensureUnsubscribeLinks(processed);

  // Badge must always be below the footer — fix misplaced badge (e.g. in logo table)
  processed = repositionBadgeBelowFooter(processed);

  // Then, add context-specific features
  switch (context) {
    case "editor":
      return processed; // Keep everything as-is for editing
    case "preview":
      return addPreviewStyles(processed); // Hide editor controls visually, allow link clicks
    case "portal":
      return addPreviewStyles(processed); // Hide editor controls visually, allow link clicks
    case "save":
      return addSaveStyles(processed); // Strip controls but keep email-block for re-editing
    case "export":
      return addCleanExportStyles(processed); // Strip editor controls for clean HTML export
    case "email-client":
      return addCleanExportStyles(processed); // Strip editor controls for email sending
    default:
      return processed;
  }
}

/** Whether the email HTML uses a gray body background (for preview container styling) */
export function emailHasGrayBackground(html: string): boolean {
  const c = html || "";
  return (
    c.includes("background: #f0f0f0") ||
    c.includes("background:#f0f0f0") ||
    c.includes("background: rgb(240, 240, 240)") ||
    c.includes("background:rgb(240, 240, 240)") ||
    c.includes("background: #f3f4f6") ||
    c.includes("background:#f3f4f6") ||
    c.includes("background: rgb(243, 244, 246)") ||
    c.includes("background:rgb(243, 244, 246)") ||
    c.includes('bgcolor="#f3f4f6"')
  );
}

/**
 * Ensures any bare "Unsubscribe" text (not already inside an <a> tag)
 * is converted to a proper anchor link with a placeholder href.
 */
function ensureUnsubscribeLinks(html: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    let changed = false;

    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null);
    const textNodes: Text[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) {
      textNodes.push(node as Text);
    }

    for (const textNode of textNodes) {
      const text = textNode.textContent || "";
      // Case-insensitive match for "unsubscribe" that isn't already inside an anchor
      if (/unsubscribe/i.test(text) && !textNode.parentElement?.closest("a")) {
        const match = text.match(/unsubscribe/i);
        if (match && match.index !== undefined) {
          const before = text.substring(0, match.index);
          const word = match[0];
          const after = text.substring(match.index + word.length);

          const fragment = doc.createDocumentFragment();
          if (before) fragment.appendChild(doc.createTextNode(before));

          const anchor = doc.createElement("a");
          anchor.href = "#unsubscribe";
          anchor.textContent = word;
          anchor.style.color = "#505050";
          anchor.style.textDecoration = "underline";
          fragment.appendChild(anchor);

          if (after) fragment.appendChild(doc.createTextNode(after));

          textNode.parentNode?.replaceChild(fragment, textNode);
          changed = true;
        }
      }
    }

    if (changed) {
      const doctypeMatch = html.match(/<!doctype[^>]*>/i);
      const doctype = doctypeMatch ? doctypeMatch[0] : "";
      const rebuilt = doc.documentElement.outerHTML;
      return doctype ? `${doctype}\n${rebuilt}` : rebuilt;
    }
  } catch (e) {
    console.error("Error ensuring unsubscribe links:", e);
  }
  return html;
}

/**
 * If a legacy badge row is still present, keep it below the footer (logo table fix).
 * Usually stripped earlier via stripDigiStormsBadge.
 */
function repositionBadgeBelowFooter(html: string): string {
  if (!html.includes('data-digistorms-badge="1"')) return html;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const badgeRow = doc.querySelector('tr[data-digistorms-badge="1"]');
    if (!badgeRow) return html;

    const wrapperTd = doc.querySelector("#emailWrapper > tbody > tr > td");
    if (!wrapperTd?.contains(badgeRow)) return html;

    // Find footer tbody: blended footer, or tbody containing #email-footer / unsubscribe
    const blendedFooter = doc.querySelector('table[data-blended-footer="1"]');
    const footerTbody =
      blendedFooter?.querySelector(":scope > tbody") ??
      doc.querySelector('#email-footer')?.closest("tbody") ??
      doc.querySelector('a[href*="unsubscribe"]')?.closest("tbody");

    if (!footerTbody) return html;

    // If badge is in logo table, move it to footer tbody (below footer content)
    const blendedLogo = doc.querySelector('table[data-blended-logo="1"]');
    if (blendedLogo?.contains(badgeRow)) {
      badgeRow.remove();
      footerTbody.appendChild(badgeRow);
      const doctypeMatch = html.match(/<!doctype[^>]*>/i);
      const doctype = doctypeMatch ? doctypeMatch[0] : "";
      return doctype ? `${doctype}\n${doc.documentElement.outerHTML}` : doc.documentElement.outerHTML;
    }

    return html;
  } catch {
    return html;
  }
}

/**
 * Standard email fixes - applies all visual fixes consistently across all contexts
 */
function applyStandardEmailFixes(html: string): string {
  let processed = html;

  // 1. Ensure proper DOCTYPE
  if (!processed.includes("<!DOCTYPE html>")) {
    processed = "<!DOCTYPE html>\n" + processed;
  }

  // 2. Ensure proper charset
  if (!processed.includes("charset=")) {
    processed = processed.replace(
      /<head>/i,
      '<head>\n<meta content="text/html; charset=utf-8" http-equiv="Content-Type"/>'
    );
  }

  // 3. Ensure viewport meta tag
  if (!processed.includes('name="viewport"')) {
    processed = processed.replace(
      /<head>/i,
      '<head>\n<meta content="width=device-width, initial-scale=1" name="viewport"/>'
    );
  }

  // 4. Fix self-closing tags that some email clients don't handle well
  processed = processed
    .replace(/<img([^>]*?)\s*\/>/gi, "<img$1>")
    .replace(/<br\s*\/>/gi, "<br>")
    .replace(/<hr\s*\/>/gi, "<hr>");

  // 5. Ensure images have proper attributes for email clients
  processed = processed.replace(/<img([^>]*?)>/gi, (match, attrs) => {
    // Add border="0" if not present
    if (!attrs.includes("border=")) {
      attrs += ' border="0"';
    }
    // Add alt="" if not present
    if (!attrs.includes("alt=")) {
      attrs += ' alt=""';
    }
    return `<img${attrs}>`;
  });

  // 6. Apply only essential email client fixes
  const visualFixes = `
    <style>
      /* Essential: Ensure social icons maintain proper sizing in email clients */
      img[src*="/assets/socials/"] {
        max-width: 32px !important;
        height: auto !important;
        display: inline-block !important;
        vertical-align: middle !important;
        margin: 0 !important;
      }
    </style>`;

  // Insert visual fixes before the closing head tag or at the beginning if no head
  if (processed.includes("</head>")) {
    processed = processed.replace("</head>", visualFixes + "\n</head>");
  } else {
    processed = visualFixes + "\n" + processed;
  }

  return processed;
}

/**
 * Add preview styles - hide editor controls visually but keep structure intact
 * This is used for EmailGallery, UserPortal, and AIGeneratorPanel previews
 * Links remain clickable, but editing controls are hidden via CSS
 */
function addPreviewStyles(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Make all links open in new tab (so they don't open inside the preview iframe)
  const allLinks = doc.querySelectorAll("a");
  allLinks.forEach((link) => {
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
  });

  // Add preview class to body
  if (doc.body) {
    doc.body.classList.add("email-preview-content");
  }

  // Inject preview styles that HIDE editor controls via CSS (don't remove them)
  // This keeps the HTML structure intact for when user goes back to editor
  const css = `
    /* Preview mode: hide all editor controls */
    .gemini-left-controls,
    .gemini-right-controls,
    .gemini-control-button,
    .gemini-insert-popover,
    .gemini-image-control-popover,
    .gemini-button-control-popover,
    .gemini-social-control-popover,
    .gemini-social-block-control-popover,
    .gemini-padding-control-popover,
    .gemini-column-add-button,
    .gemini-column-placeholder,
    .gemini-image-upload-area,
    .gemini-empty-state {
      display: none !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }

    /* Disable block hover/highlight effects */
    tr.email-block {
      outline: none !important;
    }
    tr.email-block:hover {
      outline: none !important;
    }
    .gemini-block-highlight {
      outline: none !important;
    }

    /* Preview mode scrolling */
    .email-preview-content {
      overflow: auto !important;
      height: 100% !important;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    .email-preview-content::-webkit-scrollbar {
      width: 0 !important;
      height: 0 !important;
      display: none !important;
    }

    /* Disable text selection and editing */
    [contenteditable="true"] {
      cursor: default !important;
      -webkit-user-select: none !important;
      user-select: none !important;
    }

    /* Disable pointer events on non-link elements */
    .email-preview-content *:not(a):not(a *) {
      pointer-events: none !important;
      user-select: none !important;
    }

    /* Enable clicking on links and their children (images inside links, etc.) */
    .email-preview-content a,
    .email-preview-content a * {
      pointer-events: auto !important;
      cursor: pointer !important;
    }
    ${emailHasGrayBackground(html) ? `
    /* Match body/wrapper to gray email so no white strip at bottom of iframe */
    body#emailBody,
    #emailWrapper {
      background: #f3f4f6 !important;
    }
    ` : ""}
  `;
  const styleEl = doc.createElement("style");
  styleEl.id = "preview-mode-styles";
  styleEl.textContent = css;

  if (doc.head) {
    doc.head.appendChild(styleEl);
  } else if (doc.body) {
    const head = doc.createElement("head");
    head.appendChild(styleEl);
    doc.documentElement.insertBefore(head, doc.body);
  }

  return doc.documentElement.outerHTML;
}

/**
 * Strip editor controls but keep email-block class for re-editing
 * Used for: saving drafts, internal content storage
 */
function addSaveStyles(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Remove editor-specific scripts
  const dndScripts = doc.querySelectorAll('script[src*="email-editor-dnd.js"]');
  dndScripts.forEach((el) => el.remove());

  const editorScripts = doc.querySelectorAll(
    "script[data-height-script], script[data-editor-script]"
  );
  editorScripts.forEach((el) => el.remove());

  // Remove editor control elements
  const controlElementsToRemove = [
    ".gemini-insert-popover",
    ".gemini-image-control-popover",
    ".gemini-button-control-popover",
    ".gemini-social-control-popover",
    ".gemini-social-block-control-popover",
    ".gemini-padding-control-popover",
    ".gemini-column-add-button",
    ".gemini-column-placeholder",
    ".gemini-left-controls",
    ".gemini-right-controls",
    ".gemini-control-button",
    ".gemini-insert-icon",
    ".gemini-grab-handle",
    ".gemini-duplicate-icon",
    ".gemini-delete-icon",
    ".gemini-padding-icon",
    ".gemini-social-block-icon",
    ".gemini-image-upload-area",
    ".gemini-image-input",
    ".gemini-empty-state",
  ];

  controlElementsToRemove.forEach((selector) => {
    const elements = doc.querySelectorAll(selector);
    elements.forEach((el) => el.remove());
  });

  // Remove editor-specific style tags
  const existingStyles = doc.querySelectorAll("style");
  existingStyles.forEach((styleEl) => {
    const content = styleEl.textContent || "";
    if (
      content.includes(".gemini-") ||
      content.includes("contenteditable") ||
      content.includes(".stormy-") ||
      content.includes("email-preview-content")
    ) {
      styleEl.remove();
    }
  });

  // Clean up editor-specific attributes but KEEP email-block class
  const remainingElements = doc.querySelectorAll("*");
  remainingElements.forEach((el) => {
    const htmlEl = el as HTMLElement;

    el.removeAttribute("contenteditable");
    el.removeAttribute("draggable");

    // Remove only temporary editor classes, keep email-block
    el.classList.remove(
      "gemini-block-highlight",
      "gemini-block-hover",
      "gemini-dragging"
    );

    if (htmlEl.style) {
      htmlEl.style.removeProperty("outline");
      htmlEl.style.removeProperty("outline-offset");
      htmlEl.style.removeProperty("user-select");
    }

    // Handle placeholder spans: keep the element and text so re-editing and
    // write-back to the iframe don't produce empty blocks; only strip semantics.
    if (el.classList.contains("gemini-placeholder")) {
      el.classList.remove("gemini-placeholder");
      el.removeAttribute("data-placeholder");
    }
  });

  return doc.documentElement.outerHTML;
}

/**
 * Strip all editor controls for clean HTML export
 * Used for: downloading HTML, sending emails, copying HTML
 */
function addCleanExportStyles(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Remove editor-specific scripts (they're only needed in editor mode)
  const dndScripts = doc.querySelectorAll('script[src*="email-editor-dnd.js"]');
  dndScripts.forEach((el) => el.remove());

  // Remove height script and other editor inline scripts
  const editorScripts = doc.querySelectorAll(
    "script[data-height-script], script[data-editor-script]"
  );
  editorScripts.forEach((el) => el.remove());

  // Remove editor control elements completely
  const controlElementsToRemove = [
    ".gemini-insert-popover",
    ".gemini-image-control-popover",
    ".gemini-button-control-popover",
    ".gemini-social-control-popover",
    ".gemini-social-block-control-popover",
    ".gemini-padding-control-popover",
    ".gemini-column-add-button",
    ".gemini-column-placeholder",
    ".gemini-left-controls",
    ".gemini-right-controls",
    ".gemini-control-button",
    ".gemini-insert-icon",
    ".gemini-grab-handle",
    ".gemini-duplicate-icon",
    ".gemini-delete-icon",
    ".gemini-padding-icon",
    ".gemini-social-block-icon",
    ".gemini-image-upload-area",
    ".gemini-image-input",
    ".gemini-empty-state",
  ];

  controlElementsToRemove.forEach((selector) => {
    const elements = doc.querySelectorAll(selector);
    elements.forEach((el) => el.remove());
  });

  // Remove editor-specific style tags
  const existingStyles = doc.querySelectorAll("style");
  existingStyles.forEach((styleEl) => {
    const content = styleEl.textContent || "";
    if (
      content.includes(".gemini-") ||
      content.includes("email-block") ||
      content.includes("contenteditable") ||
      content.includes(".stormy-") ||
      content.includes("email-preview-content")
    ) {
      styleEl.remove();
    }
  });

  // Make all links open in new tab
  const allLinks = doc.querySelectorAll("a");
  allLinks.forEach((link) => {
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
  });

  // Clean up editor-specific attributes and classes
  const remainingElements = doc.querySelectorAll("*");
  remainingElements.forEach((el) => {
    const htmlEl = el as HTMLElement;

    // Remove editor-specific attributes
    el.removeAttribute("contenteditable");
    el.removeAttribute("draggable");

    // Remove editor-specific classes
    el.classList.remove(
      "gemini-block-highlight",
      "gemini-block-hover",
      "gemini-dragging",
      "email-block"
    );

    // Remove editor-specific inline styles
    if (htmlEl.style) {
      htmlEl.style.removeProperty("outline");
      htmlEl.style.removeProperty("outline-offset");
      htmlEl.style.removeProperty("user-select");
    }

    // Handle placeholder spans
    if (el.classList.contains("gemini-placeholder")) {
      const placeholderText = el.getAttribute("data-placeholder");
      const actualText = el.textContent?.trim();

      if (actualText === placeholderText) {
        el.remove();
      } else {
        el.classList.remove("gemini-placeholder");
        el.removeAttribute("data-placeholder");
      }
    }
  });

  return doc.documentElement.outerHTML;
}
