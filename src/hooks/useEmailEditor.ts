import { useRef, useCallback, useState, useEffect } from "react";
import { EmailTemplate } from "@/types/emailGenerator";
import { useEmailEditorStateMachine } from "./useEmailEditorStateMachine";

interface SavedSelection {
  range: Range;
  text: string;
  checksum: string;
  timestamp: number;
}

interface UseEmailEditorProps {
  email: EmailTemplate;
  onUpdate: (
    email: EmailTemplate,
    operation?:
      | "inline-edit"
      | "block-move"
      | "block-duplicate"
      | "block-delete"
      | "block-insert",
  ) => void;
  selectedUseCase?: string;
  isApplyingHistory?: boolean;
}

export const useEmailEditor = ({
  email,
  onUpdate,
  selectedUseCase,
  isApplyingHistory = false,
}: UseEmailEditorProps) => {
  const [iframeHeight, setIframeHeight] = useState(600);
  const [isEditing, setIsEditing] = useState(false);

  const editingTimeoutRef = useRef<NodeJS.Timeout>();
  const savedSelectionRef = useRef<SavedSelection | null>(null);
  const selectionTimeoutRef = useRef<NodeJS.Timeout>();
  const lastContentRef = useRef<string>("");

  // Use the enhanced state machine for robust content management
  const {
    iframeRef,
    state,
    canWriteContent,
    lockContent,
    unlockContent,
    handleBlockOperation,
    handleInlineEdit,
    // syncContent,
    // debouncedSync,
    lastSyncedContentRef,
    syncJustHappenedRef,
    cleanup,
    isLocked,
    hasPendingSync,
  } = useEmailEditorStateMachine({ email, onUpdate, isApplyingHistory });

  // Enhanced selection preservation with validation and atomic operations
  const saveSelection = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument || isApplyingHistory || state === "LOCKED")
      return;

    const selection = iframe.contentDocument.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString();

    // Create a unique identifier for text nodes with better path resolution
    const getNodePath = (node: Node): string => {
      const path: number[] = [];
      let current: Node | null = node;

      while (current && current !== iframe.contentDocument!.body) {
        const parent = current.parentNode;
        if (parent) {
          const index = Array.from(parent.childNodes).indexOf(
            current as ChildNode,
          );
          path.unshift(index);
        }
        current = parent;
      }

      return path.join(",");
    };

    // Enhanced checksum for validation
    const createChecksum = (text: string, path: string): string => {
      const combined = `${text}:${path}:${Date.now()}`;
      return btoa(encodeURIComponent(combined)).slice(0, 15);
    };

    const path = getNodePath(range.startContainer);
    const checksum = createChecksum(selectedText, path);

    // Only save if selection has actually changed
    if (savedSelectionRef.current?.checksum !== checksum) {
      savedSelectionRef.current = {
        range: range.cloneRange(),
        text: selectedText,
        checksum,
        timestamp: Date.now(),
      };

      console.log("Selection saved:", { text: selectedText, checksum });
    }
  }, [iframeRef, isApplyingHistory, state]);

  // Enhanced selection restoration with validation and retry logic
  const restoreSelection = useCallback(() => {
    const iframe = iframeRef.current;
    if (
      !iframe?.contentDocument ||
      !savedSelectionRef.current ||
      isApplyingHistory
    )
      return;

    const { range, checksum, timestamp } = savedSelectionRef.current;

    // Validate selection is still recent (within 5 seconds)
    if (Date.now() - timestamp > 5000) {
      console.log("Selection too old, clearing");
      savedSelectionRef.current = null;
      return;
    }

    try {
      const selection = iframe.contentDocument.getSelection();
      if (!selection) return;

      // Clear existing selection
      selection.removeAllRanges();

      // Try to restore the range
      selection.addRange(range);

      // Validate the restored selection
      const restoredText = selection.toString();
      if (restoredText === savedSelectionRef.current.text) {
        console.log("Selection restored successfully");
      } else {
        console.log("Selection restoration failed - text mismatch");
        savedSelectionRef.current = null;
      }
    } catch (error) {
      console.error("Error restoring selection:", error);
      savedSelectionRef.current = null;
    }
  }, [iframeRef, isApplyingHistory]);

  // Debounced selection saving to prevent excessive saves
  const debouncedSaveSelection = useCallback(() => {
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current);
    }

    selectionTimeoutRef.current = setTimeout(() => {
      saveSelection();
    }, 100);
  }, [saveSelection]);

  // Enhanced editing state management
  const setEditingState = useCallback((editing: boolean) => {
    setIsEditing(editing);

    if (editingTimeoutRef.current) {
      clearTimeout(editingTimeoutRef.current);
    }

    if (editing) {
      editingTimeoutRef.current = setTimeout(() => {
        setIsEditing(false);
      }, 2000);
    }
  }, []);

  // Enhanced format command handler with proper state management and email-safe alignment
  const handleFormatCommand = useCallback(
    (command: string, value?: string) => {
      const iframe = iframeRef.current;
      if (!iframe?.contentDocument || state === "LOCKED") return;

      const doc = iframe.contentDocument;

      // Set editing state and lock content
      setEditingState(true);
      lockContent(1000);

      // Focus the iframe to ensure commands work properly
      iframe.focus();
      iframe.contentWindow?.focus();

      // Save selection before formatting
      saveSelection();

      // Handle special case for insertText (used by emoji insertion)
      if (command === "insertText" && value) {
        const selection = doc.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          const textNode = doc.createTextNode(value);
          range.insertNode(textNode);
          range.setStartAfter(textNode);
          range.setEndAfter(textNode);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      } else {
        // Execute the command
        doc.execCommand(command, false, value);

        // For alignment commands, also set HTML attributes for email client compatibility
        if (
          command === "justifyCenter" ||
          command === "justifyLeft" ||
          command === "justifyRight"
        ) {
          const selection = doc.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const container = range.commonAncestorContainer;

            // Find the closest block element (p, div, td, etc.)
            let element =
              container.nodeType === Node.TEXT_NODE
                ? container.parentElement
                : (container as Element);
            while (
              element &&
              ![
                "P",
                "DIV",
                "TD",
                "TH",
                "H1",
                "H2",
                "H3",
                "H4",
                "H5",
                "H6",
              ].includes(element.tagName)
            ) {
              element = element.parentElement;
            }

            if (element) {
              // Set both CSS style and HTML align attribute for email compatibility
              const alignValue =
                command === "justifyCenter"
                  ? "center"
                  : command === "justifyLeft"
                    ? "left"
                    : "right";

              // Fix: Type assertion to access style property safely
              (element as HTMLElement).style.textAlign = alignValue;
              element.setAttribute("align", alignValue);

              // Also ensure parent table cells have proper alignment
              const parentTd = element.closest("td");
              if (parentTd) {
                parentTd.style.textAlign = alignValue;
                parentTd.setAttribute("align", alignValue);
              }

              // Also ensure parent table has proper alignment
              const parentTable = element.closest("table");
              if (parentTable) {
                parentTable.style.textAlign = alignValue;
                parentTable.setAttribute("align", alignValue);
              }
            }
          }
        }
      }

      // Immediate focus restoration with retry logic
      const restoreFocus = () => {
        iframe.focus();
        iframe.contentWindow?.focus();
        restoreSelection();
      };

      // Try immediately
      restoreFocus();

      // Also try after a short delay to ensure DOM is updated
      setTimeout(restoreFocus, 50);

      // Trigger inline edit handling
      handleInlineEdit();

      // Unlock content after editing with delay
      setTimeout(() => {
        unlockContent();
      }, 500);
    },
    [
      iframeRef,
      state,
      setEditingState,
      lockContent,
      unlockContent,
      saveSelection,
      restoreSelection,
      handleInlineEdit,
    ],
  );

  // Enhanced inline edit handler with content change detection
  const handleInlineEditWithHistory = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;

    const currentContent = iframe.contentDocument.documentElement.outerHTML;

    // Only trigger if content actually changed
    if (currentContent !== lastContentRef.current) {
      lastContentRef.current = currentContent;
      handleInlineEdit();
    }
  }, [handleInlineEdit]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (editingTimeoutRef.current) {
        clearTimeout(editingTimeoutRef.current);
      }
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
      cleanup();
    };
  }, [cleanup]);

  return {
    iframeRef,
    iframeHeight,
    setIframeHeight,
    isEditing,
    handleFormatCommand,
    handleBlockOperation,
    handleInlineEdit: handleInlineEditWithHistory,
    saveSelection: debouncedSaveSelection,
    restoreSelection,
    lastSyncedContentRef,
    syncJustHappenedRef,
    canWriteContent,
    editorState: state,
    isLocked,
    hasPendingSync,
  };
};
