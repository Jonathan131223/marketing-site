import { useCallback } from "react";
import { useStore, useAppDispatch } from "@/store/context";
import {
  workflowActions,
  editorActions,
  historyActions,
  uiActions,
} from "@/store/actions";
import { persistentWorkflowActions } from "@/store/persistentActions";
import {
  workflowSelectors,
  editorSelectors,
  historySelectors,
  uiSelectors,
  combinedSelectors,
} from "@/store/selectors";
import type {
  OperationType,
  EmailTemplate,
  UseCase,
  UseCaseCategory,
  BriefData,
  FlowStep,
  TemplateTweaks,
} from "@/store/types";

// Main hook that provides all store interactions
export const useAppStore = () => {
  const { state } = useStore();
  const dispatch = useAppDispatch();

  // Workflow actions
  const workflow = {
    // Selectors
    currentStep: workflowSelectors.getCurrentStep(state),
    selectedCategory: workflowSelectors.getSelectedCategory(state),
    selectedUseCase: workflowSelectors.getSelectedUseCase(state),
    briefData: workflowSelectors.getBriefData(state),
    selectedEmail: workflowSelectors.getSelectedEmail(state),
    templateTweaks: (state.workflow as any)
      .templateTweaks as TemplateTweaks | null, // Access directly until selector is added
    isInEditor: workflowSelectors.isInEditor(state),
    hasSelectedEmail: workflowSelectors.hasSelectedEmail(state),
    canProceedToEditor: workflowSelectors.canProceedToEditor(state),

    // Actions (using persistent actions for automatic state saving)
    setStep: useCallback(
      (step: FlowStep) => dispatch(persistentWorkflowActions.setStep(step)),
      [dispatch]
    ),
    setCategory: useCallback(
      (category: UseCaseCategory) =>
        dispatch(persistentWorkflowActions.setCategory(category)),
      [dispatch]
    ),
    setUseCase: useCallback(
      (useCase: UseCase | null) =>
        dispatch(persistentWorkflowActions.setUseCase(useCase)),
      [dispatch]
    ),
    setBriefData: useCallback(
      (briefData: BriefData | null) =>
        dispatch(persistentWorkflowActions.setBriefData(briefData)),
      [dispatch]
    ),
    setSelectedEmail: useCallback(
      (email: EmailTemplate | null) =>
        dispatch(persistentWorkflowActions.setSelectedEmail(email)),
      [dispatch]
    ),
    setTemplateTweaks: useCallback(
      (tweaks: TemplateTweaks | null) =>
        dispatch(persistentWorkflowActions.setTemplateTweaks(tweaks)),
      [dispatch]
    ),
    reset: useCallback(
      () => dispatch(persistentWorkflowActions.reset()),
      [dispatch]
    ),
  };

  // Editor actions
  const editor = {
    // Selectors
    state: editorSelectors.getEditorState(state),
    isEditing: editorSelectors.isEditing(state),
    iframeHeight: editorSelectors.getIframeHeight(state),
    isContentLocked: editorSelectors.isContentLocked(state),
    lastSyncedContent: editorSelectors.getLastSyncedContent(state),
    pendingOperations: editorSelectors.getPendingOperations(state),
    canWriteContent: editorSelectors.canWriteContent(state),
    isIdle: editorSelectors.isIdle(state),
    hasPendingOperations: editorSelectors.hasPendingOperations(state),

    // Actions
    setState: useCallback(
      (editorState: "IDLE" | "EDITING" | "SYNCING" | "UPDATING") =>
        dispatch(editorActions.setState(editorState)),
      [dispatch]
    ),
    setEditing: useCallback(
      (isEditing: boolean) => dispatch(editorActions.setEditing(isEditing)),
      [dispatch]
    ),
    setHeight: useCallback(
      (height: number) => dispatch(editorActions.setHeight(height)),
      [dispatch]
    ),
    lockContent: useCallback(
      () => dispatch(editorActions.lockContent()),
      [dispatch]
    ),
    unlockContent: useCallback(
      () => dispatch(editorActions.unlockContent()),
      [dispatch]
    ),
    setLastSynced: useCallback(
      (content: string) => dispatch(editorActions.setLastSynced(content)),
      [dispatch]
    ),
    queueOperation: useCallback(
      (id: string, type: OperationType, content?: string) =>
        dispatch(editorActions.queueOperation(id, type, content)),
      [dispatch]
    ),
    processOperation: useCallback(
      (id: string) => dispatch(editorActions.processOperation(id)),
      [dispatch]
    ),
    clearOperations: useCallback(
      () => dispatch(editorActions.clearOperations()),
      [dispatch]
    ),
  };

  // History actions
  const history = {
    // Selectors
    entries: historySelectors.getHistoryEntries(state),
    currentIndex: historySelectors.getCurrentIndex(state),
    isApplyingHistory: historySelectors.isApplyingHistory(state),
    maxEntries: historySelectors.getMaxEntries(state),
    canUndo: historySelectors.canUndo(state),
    canRedo: historySelectors.canRedo(state),
    currentEntry: historySelectors.getCurrentEntry(state),
    previousEntry: historySelectors.getPreviousEntry(state),
    nextEntry: historySelectors.getNextEntry(state),

    // Actions
    addEntry: useCallback(
      (content: string, operation: OperationType) =>
        dispatch(historyActions.addEntry(content, operation)),
      [dispatch]
    ),
    setIndex: useCallback(
      (index: number) => dispatch(historyActions.setIndex(index)),
      [dispatch]
    ),
    setApplying: useCallback(
      (isApplying: boolean) => dispatch(historyActions.setApplying(isApplying)),
      [dispatch]
    ),
    clear: useCallback(() => dispatch(historyActions.clear()), [dispatch]),
    performUndo: useCallback(() => dispatch(historyActions.undo()), [dispatch]),
    performRedo: useCallback(() => dispatch(historyActions.redo()), [dispatch]),
    restore: useCallback(
      (entries: import("@/store/types").HistoryEntry[], currentIndex: number) =>
        dispatch(historyActions.restore(entries, currentIndex)),
      [dispatch]
    ),
  };

  // UI actions
  const ui = {
    // Selectors
    showFormatPopover: uiSelectors.showFormatPopover(state),
    popoverPosition: uiSelectors.getPopoverPosition(state),
    selectedText: uiSelectors.getSelectedText(state),
    hasSelectedText: uiSelectors.hasSelectedText(state),
    isPopoverVisible: uiSelectors.isPopoverVisible(state),

    // Actions
    showPopover: useCallback(
      (position: { x: number; y: number }, selectedText: string) =>
        dispatch(uiActions.showFormatPopover(position, selectedText)),
      [dispatch]
    ),
    hideFormatPopover: useCallback(
      () => dispatch(uiActions.hideFormatPopover()),
      [dispatch]
    ),
    setSelectedText: useCallback(
      (text: string) => dispatch(uiActions.setSelectedText(text)),
      [dispatch]
    ),
  };

  // Combined selectors and actions
  const combined = {
    shouldAddToHistory: useCallback(
      (newContent: string) =>
        combinedSelectors.shouldAddToHistory(state, newContent),
      [state]
    ),
    workflowContext: combinedSelectors.getWorkflowContext(state),
    editorContext: combinedSelectors.getEditorContext(state),
  };

  return {
    workflow,
    editor,
    history,
    ui,
    combined,
  };
};
