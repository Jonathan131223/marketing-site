import { useEffect, useRef } from "react";
import { useAppDispatch } from "@/store/context";
import {
  workflowActions,
  editorActions,
  historyActions,
} from "@/store/actions";
import { StatePersistence } from "@/store/persistence";
import { AppState } from "@/store/types";

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

    console.log("Checking for persisted state...");
    const stateInfo = StatePersistence.getStateInfo();
    console.log("Persisted state info:", stateInfo);

    if (!StatePersistence.hasPersistedState()) {
      console.log("No persisted state found");
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
        console.log("Restoring workflow state:", workflowState);
        dispatch(workflowActions.setStep(workflowState.currentStep));
        dispatch(workflowActions.setCategory(workflowState.selectedCategory));
        dispatch(workflowActions.setUseCase(workflowState.selectedUseCase));
        restoredState.workflow = workflowState;
      }

      // Restore brief data
      if (briefData) {
        console.log("Restoring brief data");
        dispatch(workflowActions.setBriefData(briefData));
        restoredState.workflow = { ...restoredState.workflow, briefData };
      }

      // Restore selected email
      if (selectedEmail) {
        console.log("Restoring selected email");
        dispatch(workflowActions.setSelectedEmail(selectedEmail));
        restoredState.workflow = { ...restoredState.workflow, selectedEmail };
      }

      // Restore template tweaks
      if (templateTweaks) {
        console.log("Restoring template tweaks");
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
        console.log("Restoring editor state:", editorState);
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
        console.log("Restoring history state:", historyState);
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

      console.log("State restoration completed");
      onStateRestored?.(restoredState);
    } catch (error) {
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
      console.log("Cleared all persisted state");
    },
    getStateInfo: StatePersistence.getStateInfo,
  };
};
