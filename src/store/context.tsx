import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { AppState, AppAction } from './types';
import { store } from './store';

// Store Context
const StoreContext = createContext<{
  state: AppState;
  dispatch: (action: AppAction) => void;
} | null>(null);

// Store Provider Component
export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(store.getState());

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setState(store.getState());
    });

    return unsubscribe;
  }, []);

  return (
    <StoreContext.Provider value={{ state, dispatch: store.dispatch }}>
      {children}
    </StoreContext.Provider>
  );
};

// Hook to access store
export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

// Specific hooks for different state slices
export const useWorkflowState = () => {
  const { state } = useStore();
  return state.workflow;
};

export const useEditorState = () => {
  const { state } = useStore();
  return state.editor;
};

export const useHistoryState = () => {
  const { state } = useStore();
  return state.history;
};

export const useUIState = () => {
  const { state } = useStore();
  return state.ui;
};

// Hook for dispatch
export const useAppDispatch = () => {
  const { dispatch } = useStore();
  return dispatch;
};
