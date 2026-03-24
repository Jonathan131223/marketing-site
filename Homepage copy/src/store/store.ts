import { AppState, AppAction, Store, Middleware } from "./types";
import { rootReducer, initialState } from "./reducers";
import { StatePersistence } from "./persistence";

// Simple Redux-like store implementation
export const createStore = (
  reducer: (state: AppState, action: AppAction) => AppState,
  preloadedState: AppState = initialState,
  middleware: Middleware[] = []
): Store => {
  let state = preloadedState;
  let listeners: Array<() => void> = [];

  const getState = (): AppState => state;

  const subscribe = (listener: () => void): (() => void) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  };

  const dispatch = (action: AppAction): void => {
    // Create enhanced dispatch with middleware
    let enhancedDispatch = (action: AppAction) => {
      const prevState = state;
      state = reducer(state, action);

      // Only notify listeners if state actually changed
      if (state !== prevState) {
        listeners.forEach((listener) => listener());
      }
    };

    // Apply middleware in reverse order
    middleware
      .slice()
      .reverse()
      .forEach((mw) => {
        enhancedDispatch = mw({ getState, dispatch, subscribe })(
          enhancedDispatch
        );
      });

    enhancedDispatch(action);
  };

  return {
    getState,
    dispatch,
    subscribe,
  };
};

// Persistence middleware to save workflow state after reducer updates
export const persistenceMiddleware: Middleware =
  (store) => (next) => (action) => {
    next(action);

    // After reducer has updated state, persist workflow state for certain actions
    const state = store.getState();
    const workflowActions = [
      "WORKFLOW_SET_STEP",
      "WORKFLOW_SET_CATEGORY",
      "WORKFLOW_SET_USE_CASE",
      "WORKFLOW_SET_BRIEF_DATA",
      "WORKFLOW_SET_SELECTED_EMAIL",
    ];

    if (workflowActions.includes(action.type)) {
      // Save the updated workflow state from the store (after reducer has run)
      StatePersistence.saveWorkflowState({
        currentStep: state.workflow.currentStep,
        selectedCategory: state.workflow.selectedCategory,
        selectedUseCase: state.workflow.selectedUseCase,
        briefData: state.workflow.briefData,
        selectedEmail: state.workflow.selectedEmail,
      });
    }
  };

// Logging middleware for development
export const loggingMiddleware: Middleware = (store) => (next) => (action) => {
  if (process.env.NODE_ENV === "development") {
    console.group(`🎯 Action: ${action.type}`);
    console.log("Previous State:", store.getState());
    console.log("Action:", action);
  }

  next(action);

  if (process.env.NODE_ENV === "development") {
    console.log("Next State:", store.getState());
    console.groupEnd();
  }
};

// Async middleware for handling side effects
export const asyncMiddleware: Middleware = (store) => (next) => (action) => {
  // Handle async operations based on action types
  switch (action.type) {
    case "HISTORY_UNDO":
    case "HISTORY_REDO":
      // Auto-reset applying flag after operation
      // Use 150ms - fast enough for responsive undo/redo clicking
      next(action);
      setTimeout(() => {
        store.dispatch({ type: "HISTORY_SET_APPLYING", payload: false });
      }, 150);
      break;

    case "EDITOR_STATE_CHANGE":
      next(action);
      // Auto-transition back to IDLE after UPDATING
      if (action.payload === "UPDATING") {
        setTimeout(() => {
          store.dispatch({ type: "EDITOR_STATE_CHANGE", payload: "IDLE" });
        }, 50);
      }
      break;

    default:
      next(action);
  }
};

// Error boundary middleware
export const errorMiddleware: Middleware = (store) => (next) => (action) => {
  try {
    next(action);
  } catch (error) {
    console.error("Store dispatch error:", error);
    // Could dispatch error action here for error handling
  }
};

// Create the main store instance
export const store = createStore(rootReducer, initialState, [
  persistenceMiddleware,
  loggingMiddleware,
  asyncMiddleware,
  errorMiddleware,
]);
