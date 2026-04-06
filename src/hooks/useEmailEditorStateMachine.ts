import { useRef, useCallback, useState, useMemo } from "react";
import { EmailTemplate } from "@/types/emailGenerator";
import { renderEmailForContext } from "@/utils/emailRenderer";

type EditorState = "IDLE" | "EDITING" | "SYNCING" | "UPDATING" | "LOCKED";
type OperationType =
  | "inline-edit"
  | "block-move"
  | "block-duplicate"
  | "block-delete"
  | "block-insert";

interface OperationQueue {
  id: string;
  type: OperationType;
  timestamp: number;
  content?: string;
  priority: "high" | "normal" | "low";
}

interface UseEmailEditorStateMachineProps {
  email: EmailTemplate;
  onUpdate: (email: EmailTemplate, operation?: OperationType) => void;
  isApplyingHistory?: boolean;
}

export const useEmailEditorStateMachine = ({
  email,
  onUpdate,
  isApplyingHistory = false,
}: UseEmailEditorStateMachineProps) => {
  const [state, setState] = useState<EditorState>("IDLE");
  const [operationQueue, setOperationQueue] = useState<OperationQueue[]>([]);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const contentLockRef = useRef(false);
  const lastSyncedContentRef = useRef<string>("");
  const operationTimeoutRef = useRef<NodeJS.Timeout>();
  const syncTimeoutRef = useRef<NodeJS.Timeout>();
  const pendingSyncRef = useRef<boolean>(false);
  /** Set when we just synced from iframe so the next content effect skips writing (avoids reload loop). */
  const syncJustHappenedRef = useRef(false);

  // Enhanced content locking with timeout
  const lockContent = useCallback((timeout = 1000) => {
    contentLockRef.current = true;
    setState("LOCKED");

    // Auto-unlock after timeout
    setTimeout(() => {
      if (contentLockRef.current) {
        contentLockRef.current = false;
        setState("IDLE");
      }
    }, timeout);
  }, []);

  const unlockContent = useCallback(() => {
    contentLockRef.current = false;
    if (state === "LOCKED") {
      setState("IDLE");
    }
  }, [state]);

  // State transitions with validation
  const transitionTo = useCallback(
    (newState: EditorState) => {
      // Prevent invalid transitions
      if (state === "LOCKED" && newState !== "IDLE") {
        console.log(
          `Blocked state transition: ${state} -> ${newState} (content locked)`
        );
        return;
      }

      setState(newState);
    },
    [state]
  );

  // Enhanced queue management with priority
  const queueOperation = useCallback(
    (
      type: OperationType,
      content?: string,
      priority: "high" | "normal" | "low" = "normal"
    ) => {
      const operation: OperationQueue = {
        id: `${Date.now()}-${Math.random()}`,
        type,
        timestamp: Date.now(),
        content,
        priority,
      };

      setOperationQueue((prev) => {
        const newQueue = [...prev, operation];
        // Sort by priority (high first) then by timestamp
        return newQueue.sort((a, b) => {
          const priorityOrder = { high: 3, normal: 2, low: 1 };
          const aPriority = priorityOrder[a.priority];
          const bPriority = priorityOrder[b.priority];
          if (aPriority !== bPriority) return bPriority - aPriority;
          return a.timestamp - b.timestamp;
        });
      });

      return operation.id;
    },
    []
  );

  const processNextOperation = useCallback(() => {
    if (state !== "IDLE" || operationQueue.length === 0) return;

    const nextOperation = operationQueue[0];
    setOperationQueue((prev) => prev.slice(1));

    transitionTo("SYNCING");

    // Process the operation with appropriate delay based on type
    const delay = nextOperation.type === "inline-edit" ? 50 : 100;

    setTimeout(() => {
      transitionTo("IDLE");
      // Continue processing if there are more operations
      if (operationQueue.length > 1) {
        setTimeout(processNextOperation, 25);
      }
    }, delay);
  }, [state, operationQueue, transitionTo]);

  // Debounced content synchronization with conflict resolution
  const syncContent = useCallback(
    (operation: OperationType = "inline-edit") => {
      const iframe = iframeRef.current;
      // Use contentLockRef (a ref) instead of `state` (a stale closure value)
      // to get an accurate real-time check of whether content is locked.
      if (!iframe?.contentDocument || contentLockRef.current || isApplyingHistory) {
        // Queue the operation if we can't process it now
        if (contentLockRef.current) {
          queueOperation(operation, undefined, "high");
        }
        return;
      }

      // Clear any pending sync
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      // Mark that we have a pending sync
      pendingSyncRef.current = true;

      transitionTo("SYNCING");

      const cleanContent = () => {
        const doc = iframe.contentDocument?.cloneNode(true) as Document;
        if (!doc) return "";

        // Remove all script tags and UI elements
        doc.querySelectorAll("script").forEach((script) => script.remove());
        doc
          .querySelectorAll(".gemini-left-controls, .gemini-right-controls")
          .forEach((el) => el.remove());

        // Clean UI classes and attributes
        doc
          .querySelectorAll(".gemini-block-highlight")
          .forEach((el) => el.classList.remove("gemini-block-highlight"));
        doc
          .querySelectorAll('[draggable="true"]')
          .forEach((el) => el.setAttribute("draggable", "false"));
        doc
          .querySelectorAll('[contenteditable="true"]')
          .forEach((el) => el.setAttribute("contenteditable", "false"));
        doc.body.removeAttribute("contenteditable");

        return doc.documentElement.outerHTML;
      };

      const rawContent = cleanContent();

      // Process the cleaned content through the centralized renderer for save context
      // This strips editor controls but keeps email-block class for re-editing
      const newContent = renderEmailForContext(rawContent, "save");

      // Only sync if content actually changed and we're not in a locked state
      if (
        newContent !== lastSyncedContentRef.current &&
        newContent !== email.content &&
        !contentLockRef.current
      ) {
        console.log(`Syncing content for operation: ${operation}`);
        console.log(
          `Calling onUpdate with content length: ${newContent.length}`
        );
        console.log(`Content preview: ${newContent.substring(0, 200)}...`);
        lastSyncedContentRef.current = newContent;
        syncJustHappenedRef.current = true;

        transitionTo("UPDATING");
        // Explicitly preserve subject and preview to prevent them from being reset
        onUpdate(
          {
            ...email,
            content: newContent,
            subject: email.subject || "",
            preview: email.preview || "",
          },
          operation
        );

        // Return to idle after update
        setTimeout(() => {
          transitionTo("IDLE");
          pendingSyncRef.current = false;
        }, 50);
      } else {
        transitionTo("IDLE");
        pendingSyncRef.current = false;
      }
    },
    [email, onUpdate, state, isApplyingHistory, transitionTo, queueOperation]
  );

  // Enhanced debounced sync with operation batching
  const debouncedSync = useCallback(
    (operation: OperationType = "inline-edit") => {
      if (operationTimeoutRef.current) {
        clearTimeout(operationTimeoutRef.current);
      }

      // Use shorter delay for inline edits, longer for block operations
      const delay = operation === "inline-edit" ? 200 : 300;

      operationTimeoutRef.current = setTimeout(() => {
        if (!pendingSyncRef.current) {
          syncContent(operation);
        }
      }, delay);
    },
    [syncContent]
  );

  // Enhanced block operation handler with proper locking
  const handleBlockOperation = useCallback(
    (operation: OperationType) => {
      // Use the ref for the guard check instead of the stale `state` closure value.
      // This prevents duplicate lock/sync cycles when handleBlockOperation is called
      // multiple times in rapid succession (e.g. from dual postMessage dispatch).
      if (contentLockRef.current) {
        queueOperation(operation, undefined, "high");
        return;
      }

      // Lock content during block operations to prevent external writes
      lockContent(500);

      // Allow some time for the DOM to update, then sync
      setTimeout(() => {
        // Unlock before syncing so the contentLockRef check in syncContent passes
        unlockContent();
        syncContent(operation);
      }, 150);
    },
    [queueOperation, lockContent, unlockContent, syncContent]
  );

  // Enhanced inline edit handler with conflict resolution
  const handleInlineEdit = useCallback(() => {
    if (state === "LOCKED") {
      // Queue the operation if content is locked
      queueOperation("inline-edit", undefined, "normal");
      return;
    }

    if (state === "IDLE") {
      transitionTo("EDITING");
      // Use debounced sync for inline edits
      debouncedSync("inline-edit");
    } else {
      // Queue the operation if we're not in IDLE state (e.g., EDITING, SYNCING, UPDATING)
      // This ensures badge toggles and other edits don't get lost
      queueOperation("inline-edit", undefined, "normal");
    }
  }, [state, transitionTo, debouncedSync, queueOperation]);

  // Check if content writing is allowed with enhanced validation
  const canWriteContent = useCallback(() => {
    return (
      !contentLockRef.current &&
      !isApplyingHistory &&
      state === "IDLE" &&
      !pendingSyncRef.current
    );
  }, [isApplyingHistory, state]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (operationTimeoutRef.current) {
      clearTimeout(operationTimeoutRef.current);
    }
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    contentLockRef.current = false;
    pendingSyncRef.current = false;
  }, []);

  // Process queued operations when state becomes idle
  useMemo(() => {
    if (state === "IDLE" && operationQueue.length > 0) {
      setTimeout(processNextOperation, 50);
    }
  }, [state, operationQueue.length, processNextOperation]);

  return {
    iframeRef,
    state,
    canWriteContent,
    lockContent,
    unlockContent,
    handleBlockOperation,
    handleInlineEdit,
    syncContent,
    debouncedSync,
    lastSyncedContentRef,
    syncJustHappenedRef,
    cleanup,
    isLocked: contentLockRef.current,
    hasPendingSync: pendingSyncRef.current,
  };
};
