import { AppState } from './types';

// Workflow Selectors
export const workflowSelectors = {
  getCurrentStep: (state: AppState) => state.workflow.currentStep,
  getSelectedCategory: (state: AppState) => state.workflow.selectedCategory,
  getSelectedUseCase: (state: AppState) => state.workflow.selectedUseCase,
  getBriefData: (state: AppState) => state.workflow.briefData,
  getSelectedEmail: (state: AppState) => state.workflow.selectedEmail,
  
  // Computed selectors
  isInEditor: (state: AppState) => state.workflow.currentStep === 'editor',
  hasSelectedEmail: (state: AppState) => state.workflow.selectedEmail !== null,
  canProceedToEditor: (state: AppState) => 
    state.workflow.selectedEmail !== null && state.workflow.currentStep === 'gallery',
};

// Editor Selectors
export const editorSelectors = {
  getEditorState: (state: AppState) => state.editor.state,
  isEditing: (state: AppState) => state.editor.isEditing,
  getIframeHeight: (state: AppState) => state.editor.iframeHeight,
  isContentLocked: (state: AppState) => state.editor.contentLocked,
  getLastSyncedContent: (state: AppState) => state.editor.lastSyncedContent,
  getPendingOperations: (state: AppState) => state.editor.pendingOperations,
  
  // Computed selectors
  canWriteContent: (state: AppState) => 
    !state.editor.contentLocked && 
    !state.history.isApplyingHistory && 
    state.editor.state === 'IDLE',
  isIdle: (state: AppState) => state.editor.state === 'IDLE',
  hasPendingOperations: (state: AppState) => state.editor.pendingOperations.length > 0,
};

// History Selectors
export const historySelectors = {
  getHistoryEntries: (state: AppState) => state.history.entries,
  getCurrentIndex: (state: AppState) => state.history.currentIndex,
  isApplyingHistory: (state: AppState) => state.history.isApplyingHistory,
  getMaxEntries: (state: AppState) => state.history.maxEntries,
  
  // Computed selectors
  canUndo: (state: AppState) => 
    state.history.currentIndex > 0 && 
    state.history.entries.length > 0 &&
    !state.history.isApplyingHistory,
  canRedo: (state: AppState) => 
    state.history.currentIndex < state.history.entries.length - 1 && 
    state.history.entries.length > 0 &&
    !state.history.isApplyingHistory,
  getCurrentEntry: (state: AppState) => 
    state.history.entries[state.history.currentIndex] || null,
  getPreviousEntry: (state: AppState) => 
    state.history.entries[state.history.currentIndex - 1] || null,
  getNextEntry: (state: AppState) => 
    state.history.entries[state.history.currentIndex + 1] || null,
};

// UI Selectors
export const uiSelectors = {
  showFormatPopover: (state: AppState) => state.ui.showFormatPopover,
  getPopoverPosition: (state: AppState) => state.ui.popoverPosition,
  getSelectedText: (state: AppState) => state.ui.selectedText,
  
  // Computed selectors
  hasSelectedText: (state: AppState) => state.ui.selectedText.length > 0,
  isPopoverVisible: (state: AppState) => 
    state.ui.showFormatPopover && state.ui.popoverPosition !== null,
};

// Combined selectors for complex operations
export const combinedSelectors = {
  // Check if email update should trigger history entry
  shouldAddToHistory: (state: AppState, newContent: string) => {
    const currentEmail = state.workflow.selectedEmail;
    const isApplying = state.history.isApplyingHistory;
    
    return !isApplying && 
           currentEmail && 
           newContent !== currentEmail.content &&
           newContent !== state.editor.lastSyncedContent;
  },
  
  // Get the current workflow context
  getWorkflowContext: (state: AppState) => ({
    step: state.workflow.currentStep,
    useCase: state.workflow.selectedUseCase,
    hasData: state.workflow.briefData !== null,
    hasEmail: state.workflow.selectedEmail !== null,
    canEdit: state.workflow.currentStep === 'editor' && state.workflow.selectedEmail !== null,
  }),
  
  // Get editor operation context
  getEditorContext: (state: AppState) => ({
    canOperate: editorSelectors.canWriteContent(state),
    state: state.editor.state,
    isLocked: state.editor.contentLocked,
    hasOperations: state.editor.pendingOperations.length > 0,
    isApplyingHistory: state.history.isApplyingHistory,
  }),
};