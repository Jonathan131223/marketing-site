import { useEffect, useRef } from "react";
import { useAppDispatch } from "@/store/context";
import {
  workflowActions,
  editorActions,
  historyActions,
} from "@/store/actions";
import { StatePersistence } from "@/store/persistence";
import type { AppState } from "@/store/types";

interface UseStateRestorationProps {
  onStateRestored?: (restoredState: Partial<AppState>) => void;
  onNoStateFound?: () => void;
}

export const useStateRestoration = ({
  onStateRestored,
  onNoStateFound,
}: UseStateRestorationProps = {}) => {
  const dispatch = useAppDispatch();
  const hasRestored = useRef(false);

  useEffect(() => {
    if (hasRestored.current) return;
    hasRestored.current = true;

    // Dev-only logging. Previously these console.log statements fired in
    // production on every email generator page mount and some dumped full
    // brief data (companyName, productName, senderName) — customer-provided
    // PII into a medium that browser extensions can scrape. Gated behind
    // import.meta.env.DEV so prod bundles stay silent.
    const devLog = import.meta.env.DEV
      ? // eslint-disable-next-line no-console
        (...args: unknown[]) => console.log(...args)
      : () => {};

    devLog("Checking for persisted state...");

    // Schema version gate: if the stored shape is from a prior release,
    // wipe it before any reducer tries to consume it. This prevents the
    // "stale briefData shape crashes render" failure mode we saw on
    // 2026-04-11 where users with weeks of accumulated state hit an
    // error boundary after the tab layout redesign shipped.
    const wiped = StatePersistence.ensureSchemaVersion();
    if (wiped) {
      devLog("Schema version mismatch — wiped old state");
      onNoStateFound?.();
      return;
    }

    const stateInfo = StatePersistence.getStateInfo();
    devLog("Persisted state info:", stateInfo);

    if (!StatePersistence.hasPersistedState()) {
      devLog("No persisted state found");
      onNoStateFound?.();
      return;
    }

    try {
      // Restore workflow state
      const workflowState = StatePersistence.loadWorkflowState();
      const briefData = StatePersistence.loadBriefData();
      const selectedEmail = StatePersistence.loadSelectedEmail();
      const templateTweaks = StatePersistence.loadTemplateTweaks();
      const editorState = StatePersistence.loadEditorState();
      const historyState = StatePersistence.loadHistoryState();

      const restoredState: Partial<AppState> = {};

      // Restore workflow state
      if (workflowState) {
        // Dev log the keys only, not the values — even in dev, selectedUseCase
        // is the only identifying field here and it's a non-sensitive slug.
        devLog("Restoring workflow state", Object.keys(workflowState));
        dispatch(workflowActions.setStep(workflowState.currentStep));
        dispatch(workflowActions.setCategory(workflowState.selectedCategory));
        dispatch(workflowActions.setUseCase(workflowState.selectedUseCase));
        restoredState.workflow = workflowState;
      }

      // Restore brief data
      if (briefData) {
        devLog("Restoring brief data");
        dispatch(workflowActions.setBriefData(briefData));
        restoredState.workflow = { ...restoredState.workflow, briefData };
      }

      // Restore selected email
      if (selectedEmail) {
        devLog("Restoring selected email");
        dispatch(workflowActions.setSelectedEmail(selectedEmail));
        restoredState.workflow = { ...restoredState.workflow, selectedEmail };
      }

      // Restore template tweaks
      if (templateTweaks) {
        devLog("Restoring template tweaks");
        // Use the action from store/actions.ts (we need to cast or ensure it exists)
        // Assuming workflowActions.setTemplateTweaks exists as added in previous steps
        if (workflowActions.setTemplateTweaks) {
          dispatch(workflowActions.setTemplateTweaks(templateTweaks));
          restoredState.workflow = {
            ...restoredState.workflow,
            templateTweaks: templateTweaks as any,
          };
        }
      }

      // Restore editor state
      if (editorState) {
        // Log keys only — lastSyncedContent can contain user email HTML.
        devLog("Restoring editor state", Object.keys(editorState));
        if (editorState.iframeHeight) {
          dispatch(editorActions.setHeight(editorState.iframeHeight));
        }
        if (editorState.lastSyncedContent) {
          dispatch(editorActions.setLastSynced(editorState.lastSyncedContent));
        }
        restoredState.editor = {
          ...restoredState.editor,
          iframeHeight: editorState.iframeHeight,
          lastSyncedContent: editorState.lastSyncedContent,
          pendingOperations: editorState.pendingOperations || [],
        };
      }

      // Restore history state
      if (historyState) {
        // Log entry count only — entries contain full email HTML.
        devLog(
          "Restoring history state",
          { entries: historyState.entries.length, currentIndex: historyState.currentIndex }
        );
        // Clear existing history first
        dispatch(historyActions.clear());

        // Add all entries
        historyState.entries.forEach((entry) => {
          dispatch(
            historyActions.addEntry(entry.content, entry.operation as any)
          );
        });

        // Set current index
        if (historyState.currentIndex >= 0) {
          dispatch(historyActions.setIndex(historyState.currentIndex));
        }

        restoredState.history = historyState;
      }

      devLog("State restoration completed");
      onStateRestored?.(restoredState);
    } catch (error) {
      // Errors are always logged, even in prod — silent failures are worse
      // than visible ones for debugging. The error object itself does not
      // contain restored PII.
      // eslint-disable-next-line no-console
      console.error("Error during state restoration:", error);
      // Clear corrupted state
      StatePersistence.clearAll();
      onNoStateFound?.();
    }
  }, [dispatch, onStateRestored, onNoStateFound]);

  return {
    hasRestored: hasRestored.current,
    clearPersistedState: () => {
      StatePersistence.clearAll();
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log("Cleared all persisted state");
      }
    },
    getStateInfo: StatePersistence.getStateInfo,
  };
};
