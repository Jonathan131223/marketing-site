import type {
  AppAction,
  FlowStep,
  UseCaseCategory,
  UseCase,
  BriefData,
  EmailTemplate,
  TemplateTweaks,
  EditorState,
  OperationType,
  HistoryEntry,
} from "./types";
import { StatePersistence } from "./persistence";

// Enhanced Workflow Action Creators with Persistence
// Note: Persistence is now handled by persistenceMiddleware in store.ts
// which saves state AFTER the reducer updates it, ensuring we always save the correct state
export const persistentWorkflowActions = {
  setStep: (step: FlowStep): AppAction => {
    return {
      type: "WORKFLOW_SET_STEP",
      payload: step,
    };
  },

  setCategory: (category: UseCaseCategory): AppAction => {
    return {
      type: "WORKFLOW_SET_CATEGORY",
      payload: category,
    };
  },

  setUseCase: (useCase: UseCase | null): AppAction => {
    return {
      type: "WORKFLOW_SET_USE_CASE",
      payload: useCase,
    };
  },

  setBriefData: (briefData: BriefData | null): AppAction => {
    // Persist brief data separately for better granularity
    StatePersistence.saveBriefData(briefData);

    return {
      type: "WORKFLOW_SET_BRIEF_DATA",
      payload: briefData,
    };
  },

  setSelectedEmail: (email: EmailTemplate | null): AppAction => {
    // Persist selected email
    StatePersistence.saveSelectedEmail(email);

    return {
      type: "WORKFLOW_SET_SELECTED_EMAIL",
      payload: email,
    };
  },

  setTemplateTweaks: (tweaks: TemplateTweaks | null): AppAction => {
    // Persist template tweaks
    StatePersistence.saveTemplateTweaks(tweaks);

    return {
      type: "WORKFLOW_SET_TEMPLATE_TWEAKS",
      payload: tweaks,
    };
  },

  reset: (): AppAction => {
    // Clear all persisted state on reset
    StatePersistence.clearAll();

    return {
      type: "WORKFLOW_RESET",
    };
  },
};

// Enhanced Editor Action Creators with Persistence
export const persistentEditorActions = {
  setState: (state: EditorState): AppAction => {
    return {
      type: "EDITOR_STATE_CHANGE",
      payload: state,
    };
  },

  setEditing: (isEditing: boolean): AppAction => {
    return {
      type: "EDITOR_SET_EDITING",
      payload: isEditing,
    };
  },

  setHeight: (height: number): AppAction => {
    // Persist editor height
    const currentEditorState = StatePersistence.loadEditorState();
    StatePersistence.saveEditorState({
      ...currentEditorState,
      iframeHeight: height,
    });

    return {
      type: "EDITOR_SET_HEIGHT",
      payload: height,
    };
  },

  lockContent: (): AppAction => {
    return {
      type: "EDITOR_LOCK_CONTENT",
    };
  },

  unlockContent: (): AppAction => {
    return {
      type: "EDITOR_UNLOCK_CONTENT",
    };
  },

  setLastSynced: (content: string): AppAction => {
    // Persist last synced content
    const currentEditorState = StatePersistence.loadEditorState();
    StatePersistence.saveEditorState({
      ...currentEditorState,
      lastSyncedContent: content,
    });

    return {
      type: "EDITOR_SET_LAST_SYNCED",
      payload: content,
    };
  },

  queueOperation: (
    id: string,
    type: OperationType,
    content?: string
  ): AppAction => {
    // Persist pending operations
    const currentEditorState = StatePersistence.loadEditorState();
    const pendingOperations = currentEditorState?.pendingOperations || [];
    StatePersistence.saveEditorState({
      ...currentEditorState,
      pendingOperations: [
        ...pendingOperations,
        { id, type, content, timestamp: Date.now() },
      ],
    });

    return {
      type: "EDITOR_QUEUE_OPERATION",
      payload: { id, type, content },
    };
  },

  processOperation: (id: string): AppAction => {
    // Remove processed operation from persistence
    const currentEditorState = StatePersistence.loadEditorState();
    if (currentEditorState?.pendingOperations) {
      StatePersistence.saveEditorState({
        ...currentEditorState,
        pendingOperations: currentEditorState.pendingOperations.filter(
          (op) => op.id !== id
        ),
      });
    }

    return {
      type: "EDITOR_PROCESS_OPERATION",
      payload: id,
    };
  },

  clearOperations: (): AppAction => {
    // Clear pending operations from persistence
    const currentEditorState = StatePersistence.loadEditorState();
    StatePersistence.saveEditorState({
      ...currentEditorState,
      pendingOperations: [],
    });

    return {
      type: "EDITOR_CLEAR_OPERATIONS",
    };
  },
};

// Enhanced History Action Creators with Persistence
export const persistentHistoryActions = {
  addEntry: (content: string, operation: OperationType): AppAction => {
    // Persist history entries
    const currentHistory = StatePersistence.loadHistoryState();
    const entries = currentHistory?.entries || [];
    const newEntry = {
      content,
      operation,
      timestamp: Date.now(),
    };

    StatePersistence.saveHistoryState({
      entries: [...entries, newEntry],
      currentIndex: entries.length,
    });

    return {
      type: "HISTORY_ADD_ENTRY",
      payload: newEntry,
    };
  },

  setIndex: (index: number): AppAction => {
    // Persist current history index
    const currentHistory = StatePersistence.loadHistoryState();
    StatePersistence.saveHistoryState({
      ...currentHistory,
      currentIndex: index,
    });

    return {
      type: "HISTORY_SET_INDEX",
      payload: index,
    };
  },

  setApplying: (isApplying: boolean): AppAction => {
    return {
      type: "HISTORY_SET_APPLYING",
      payload: isApplying,
    };
  },

  clear: (): AppAction => {
    // Clear history from persistence
    StatePersistence.saveHistoryState({
      entries: [],
      currentIndex: -1,
    });

    return {
      type: "HISTORY_CLEAR",
    };
  },

  undo: (): AppAction => {
    // Update history index in persistence
    const currentHistory = StatePersistence.loadHistoryState();
    if (currentHistory && currentHistory.currentIndex > 0) {
      StatePersistence.saveHistoryState({
        ...currentHistory,
        currentIndex: currentHistory.currentIndex - 1,
      });
    }

    return {
      type: "HISTORY_UNDO",
    };
  },

  redo: (): AppAction => {
    // Update history index in persistence
    const currentHistory = StatePersistence.loadHistoryState();
    if (
      currentHistory &&
      currentHistory.currentIndex < currentHistory.entries.length - 1
    ) {
      StatePersistence.saveHistoryState({
        ...currentHistory,
        currentIndex: currentHistory.currentIndex + 1,
      });
    }

    return {
      type: "HISTORY_REDO",
    };
  },
};

// UI Action Creators (no persistence needed for UI state)
export const persistentUIActions = {
  showFormatPopover: (
    position: { x: number; y: number },
    selectedText: string
  ): AppAction => ({
    type: "UI_SHOW_FORMAT_POPOVER",
    payload: { position, selectedText },
  }),

  hideFormatPopover: (): AppAction => ({
    type: "UI_HIDE_FORMAT_POPOVER",
  }),

  setSelectedText: (text: string): AppAction => ({
    type: "UI_SET_SELECTED_TEXT",
    payload: text,
  }),
};
