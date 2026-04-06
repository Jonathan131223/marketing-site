import {
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

// Workflow Action Creators
export const workflowActions = {
  setStep: (step: FlowStep): AppAction => ({
    type: "WORKFLOW_SET_STEP",
    payload: step,
  }),

  setCategory: (category: UseCaseCategory): AppAction => ({
    type: "WORKFLOW_SET_CATEGORY",
    payload: category,
  }),

  setUseCase: (useCase: UseCase | null): AppAction => ({
    type: "WORKFLOW_SET_USE_CASE",
    payload: useCase,
  }),

  setBriefData: (briefData: BriefData | null): AppAction => ({
    type: "WORKFLOW_SET_BRIEF_DATA",
    payload: briefData,
  }),

  setSelectedEmail: (email: EmailTemplate | null): AppAction => ({
    type: "WORKFLOW_SET_SELECTED_EMAIL",
    payload: email,
  }),

  setTemplateTweaks: (tweaks: TemplateTweaks | null): AppAction => ({
    type: "WORKFLOW_SET_TEMPLATE_TWEAKS",
    payload: tweaks,
  }),

  reset: (): AppAction => ({
    type: "WORKFLOW_RESET",
  }),
};

// Editor Action Creators
export const editorActions = {
  setState: (state: EditorState): AppAction => ({
    type: "EDITOR_STATE_CHANGE",
    payload: state,
  }),

  setEditing: (isEditing: boolean): AppAction => ({
    type: "EDITOR_SET_EDITING",
    payload: isEditing,
  }),

  setHeight: (height: number): AppAction => ({
    type: "EDITOR_SET_HEIGHT",
    payload: height,
  }),

  lockContent: (): AppAction => ({
    type: "EDITOR_LOCK_CONTENT",
  }),

  unlockContent: (): AppAction => ({
    type: "EDITOR_UNLOCK_CONTENT",
  }),

  setLastSynced: (content: string): AppAction => ({
    type: "EDITOR_SET_LAST_SYNCED",
    payload: content,
  }),

  queueOperation: (
    id: string,
    type: OperationType,
    content?: string
  ): AppAction => ({
    type: "EDITOR_QUEUE_OPERATION",
    payload: { id, type, content },
  }),

  processOperation: (id: string): AppAction => ({
    type: "EDITOR_PROCESS_OPERATION",
    payload: id,
  }),

  clearOperations: (): AppAction => ({
    type: "EDITOR_CLEAR_OPERATIONS",
  }),
};

// History Action Creators
export const historyActions = {
  addEntry: (content: string, operation: OperationType): AppAction => ({
    type: "HISTORY_ADD_ENTRY",
    payload: {
      content,
      operation,
      timestamp: Date.now(),
    },
  }),

  setIndex: (index: number): AppAction => ({
    type: "HISTORY_SET_INDEX",
    payload: index,
  }),

  setApplying: (isApplying: boolean): AppAction => ({
    type: "HISTORY_SET_APPLYING",
    payload: isApplying,
  }),

  clear: (): AppAction => ({
    type: "HISTORY_CLEAR",
  }),

  undo: (): AppAction => ({
    type: "HISTORY_UNDO",
  }),

  redo: (): AppAction => ({
    type: "HISTORY_REDO",
  }),

  restore: (entries: HistoryEntry[], currentIndex: number): AppAction => ({
    type: "HISTORY_RESTORE",
    payload: { entries, currentIndex },
  }),
};

// UI Action Creators
export const uiActions = {
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
