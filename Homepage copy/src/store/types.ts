import {
  EmailTemplate,
  UseCase,
  UseCaseCategory,
  BriefData,
  TemplateTweaks,
} from "@/pages/Index";

// Re-export types for use in other store modules
export type {
  EmailTemplate,
  UseCase,
  UseCaseCategory,
  BriefData,
  TemplateTweaks,
};

// Editor States
export type EditorState = "IDLE" | "EDITING" | "SYNCING" | "UPDATING";
export type OperationType =
  | "inline-edit"
  | "block-move"
  | "block-duplicate"
  | "block-delete"
  | "block-insert"
  | "stormy-edit";
export type FlowStep = "picker" | "brief" | "loading" | "gallery" | "editor";

// History Entry
export interface HistoryEntry {
  content: string;
  timestamp: number;
  operation: OperationType;
}

// Global App State
export interface AppState {
  workflow: WorkflowState;
  editor: EmailEditorState;
  history: HistoryState;
  ui: UIState;
}

// Workflow State
export interface WorkflowState {
  currentStep: FlowStep;
  selectedCategory: UseCaseCategory;
  selectedUseCase: UseCase | null;
  briefData: BriefData | null;
  selectedEmail: EmailTemplate | null;
  templateTweaks: TemplateTweaks | null;
}

// Editor State
export interface EmailEditorState {
  state: EditorState;
  isEditing: boolean;
  iframeHeight: number;
  contentLocked: boolean;
  lastSyncedContent: string;
  pendingOperations: Array<{
    id: string;
    type: OperationType;
    timestamp: number;
    content?: string;
  }>;
}

// History State
export interface HistoryState {
  entries: HistoryEntry[];
  currentIndex: number;
  isApplyingHistory: boolean;
  maxEntries: number;
}

// UI State
export interface UIState {
  showFormatPopover: boolean;
  popoverPosition: { x: number; y: number } | null;
  selectedText: string;
}

// Actions
export type AppAction =
  // Workflow Actions
  | { type: "WORKFLOW_SET_STEP"; payload: FlowStep }
  | { type: "WORKFLOW_SET_CATEGORY"; payload: UseCaseCategory }
  | { type: "WORKFLOW_SET_USE_CASE"; payload: UseCase | null }
  | { type: "WORKFLOW_SET_BRIEF_DATA"; payload: BriefData | null }
  | { type: "WORKFLOW_SET_SELECTED_EMAIL"; payload: EmailTemplate | null }
  | { type: "WORKFLOW_SET_TEMPLATE_TWEAKS"; payload: TemplateTweaks | null }
  | { type: "WORKFLOW_RESET" }

  // Editor Actions
  | { type: "EDITOR_STATE_CHANGE"; payload: EditorState }
  | { type: "EDITOR_SET_EDITING"; payload: boolean }
  | { type: "EDITOR_SET_HEIGHT"; payload: number }
  | { type: "EDITOR_LOCK_CONTENT" }
  | { type: "EDITOR_UNLOCK_CONTENT" }
  | { type: "EDITOR_SET_LAST_SYNCED"; payload: string }
  | {
      type: "EDITOR_QUEUE_OPERATION";
      payload: { id: string; type: OperationType; content?: string };
    }
  | { type: "EDITOR_PROCESS_OPERATION"; payload: string }
  | { type: "EDITOR_CLEAR_OPERATIONS" }

  // History Actions
  | { type: "HISTORY_ADD_ENTRY"; payload: HistoryEntry }
  | { type: "HISTORY_SET_INDEX"; payload: number }
  | { type: "HISTORY_SET_APPLYING"; payload: boolean }
  | { type: "HISTORY_CLEAR" }
  | { type: "HISTORY_UNDO" }
  | { type: "HISTORY_REDO" }
  | { type: "HISTORY_RESTORE"; payload: { entries: HistoryEntry[]; currentIndex: number } }

  // UI Actions
  | {
      type: "UI_SHOW_FORMAT_POPOVER";
      payload: { position: { x: number; y: number }; selectedText: string };
    }
  | { type: "UI_HIDE_FORMAT_POPOVER" }
  | { type: "UI_SET_SELECTED_TEXT"; payload: string };

// Store interface
export interface Store {
  getState: () => AppState;
  dispatch: (action: AppAction) => void;
  subscribe: (listener: () => void) => () => void;
}

// Middleware type
export type Middleware = (
  store: Store
) => (next: (action: AppAction) => void) => (action: AppAction) => void;
