import {
  AppState,
  AppAction,
  WorkflowState,
  EmailEditorState,
  HistoryState,
  UIState,
  HistoryEntry,
} from "./types";

// Initial States
const initialWorkflowState: WorkflowState = {
  currentStep: "picker",
  selectedCategory: "activation",
  selectedUseCase: null,
  briefData: null,
  selectedEmail: null,
  templateTweaks: null,
};

const initialEditorState: EmailEditorState = {
  state: "IDLE",
  isEditing: false,
  iframeHeight: 600,
  contentLocked: false,
  lastSyncedContent: "",
  pendingOperations: [],
};

const initialHistoryState: HistoryState = {
  entries: [],
  currentIndex: -1,
  isApplyingHistory: false,
  maxEntries: 20,
};

const initialUIState: UIState = {
  showFormatPopover: false,
  popoverPosition: null,
  selectedText: "",
};

export const initialState: AppState = {
  workflow: initialWorkflowState,
  editor: initialEditorState,
  history: initialHistoryState,
  ui: initialUIState,
};

// Workflow Reducer
export const workflowReducer = (
  state: WorkflowState,
  action: AppAction
): WorkflowState => {
  switch (action.type) {
    case "WORKFLOW_SET_STEP":
      return { ...state, currentStep: action.payload };
    case "WORKFLOW_SET_CATEGORY":
      return { ...state, selectedCategory: action.payload };
    case "WORKFLOW_SET_USE_CASE":
      return { ...state, selectedUseCase: action.payload };
    case "WORKFLOW_SET_BRIEF_DATA":
      return { ...state, briefData: action.payload };
    case "WORKFLOW_SET_SELECTED_EMAIL":
      return { ...state, selectedEmail: action.payload };
    case "WORKFLOW_SET_TEMPLATE_TWEAKS":
      return { ...state, templateTweaks: action.payload };
    case "WORKFLOW_RESET":
      return {
        ...initialWorkflowState,
        selectedCategory: state.selectedCategory, // Keep category selection
      };
    default:
      return state;
  }
};

// Editor Reducer
export const editorReducer = (
  state: EmailEditorState,
  action: AppAction
): EmailEditorState => {
  switch (action.type) {
    case "EDITOR_STATE_CHANGE":
      return { ...state, state: action.payload };
    case "EDITOR_SET_EDITING":
      return { ...state, isEditing: action.payload };
    case "EDITOR_SET_HEIGHT":
      return { ...state, iframeHeight: action.payload };
    case "EDITOR_LOCK_CONTENT":
      return { ...state, contentLocked: true };
    case "EDITOR_UNLOCK_CONTENT":
      return { ...state, contentLocked: false };
    case "EDITOR_SET_LAST_SYNCED":
      return { ...state, lastSyncedContent: action.payload };
    case "EDITOR_QUEUE_OPERATION":
      return {
        ...state,
        pendingOperations: [
          ...state.pendingOperations,
          { ...action.payload, timestamp: Date.now() },
        ],
      };
    case "EDITOR_PROCESS_OPERATION":
      return {
        ...state,
        pendingOperations: state.pendingOperations.filter(
          (op) => op.id !== action.payload
        ),
      };
    case "EDITOR_CLEAR_OPERATIONS":
      return { ...state, pendingOperations: [] };
    default:
      return state;
  }
};

// History Reducer
export const historyReducer = (
  state: HistoryState,
  action: AppAction
): HistoryState => {
  switch (action.type) {
    case "HISTORY_ADD_ENTRY": {
      // Don't add if we're applying history
      if (state.isApplyingHistory) return state;

      const newEntry = action.payload;

      // Don't add if content hasn't changed
      const lastEntry = state.entries[state.currentIndex];
      if (lastEntry && lastEntry.content === newEntry.content) return state;

      // Remove future history if we're not at the end
      const newEntries = state.entries.slice(0, state.currentIndex + 1);
      newEntries.push(newEntry);

      // Keep only maxEntries
      if (newEntries.length > state.maxEntries) {
        newEntries.shift();
        return {
          ...state,
          entries: newEntries,
          currentIndex: state.maxEntries - 1,
        };
      }

      return {
        ...state,
        entries: newEntries,
        currentIndex: newEntries.length - 1,
      };
    }
    case "HISTORY_SET_INDEX":
      return { ...state, currentIndex: action.payload };
    case "HISTORY_SET_APPLYING":
      return { ...state, isApplyingHistory: action.payload };
    case "HISTORY_CLEAR":
      return { ...initialHistoryState };
    case "HISTORY_UNDO": {
      if (state.isApplyingHistory || state.currentIndex <= 0) return state;
      return {
        ...state,
        currentIndex: state.currentIndex - 1,
        isApplyingHistory: true,
      };
    }
    case "HISTORY_REDO": {
      if (
        state.isApplyingHistory ||
        state.currentIndex >= state.entries.length - 1
      )
        return state;
      return {
        ...state,
        currentIndex: state.currentIndex + 1,
        isApplyingHistory: true,
      };
    }
    case "HISTORY_RESTORE": {
      const { entries, currentIndex } = action.payload;
      return {
        ...state,
        entries,
        currentIndex,
        isApplyingHistory: false,
      };
    }
    default:
      return state;
  }
};

// UI Reducer
export const uiReducer = (state: UIState, action: AppAction): UIState => {
  switch (action.type) {
    case "UI_SHOW_FORMAT_POPOVER":
      return {
        ...state,
        showFormatPopover: true,
        popoverPosition: action.payload.position,
        selectedText: action.payload.selectedText,
      };
    case "UI_HIDE_FORMAT_POPOVER":
      return {
        ...state,
        showFormatPopover: false,
        popoverPosition: null,
        selectedText: "",
      };
    case "UI_SET_SELECTED_TEXT":
      return { ...state, selectedText: action.payload };
    default:
      return state;
  }
};

// Root Reducer
export const rootReducer = (state: AppState, action: AppAction): AppState => {
  return {
    workflow: workflowReducer(state.workflow, action),
    editor: editorReducer(state.editor, action),
    history: historyReducer(state.history, action),
    ui: uiReducer(state.ui, action),
  };
};
