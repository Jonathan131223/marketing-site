import { useState, useCallback, useRef, useEffect } from 'react';
import { EmailTemplate } from '@/types/emailGenerator';

interface HistoryEntry {
  content: string;
  timestamp: number;
  operation: 'inline-edit' | 'block-move' | 'block-duplicate' | 'block-delete' | 'stormy-edit';
}

export const useEmailHistory = (initialEmail: EmailTemplate | null) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const isApplyingHistoryRef = useRef(false);
  const operationTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize history when we get a valid email
  if (initialEmail && history.length === 0) {
    setHistory([{
      content: initialEmail.content,
      timestamp: Date.now(),
      operation: 'inline-edit'
    }]);
    setCurrentIndex(0);
  }

  const addToHistory = useCallback((content: string, operation: HistoryEntry['operation']) => {
    // Prevent adding to history if we're applying a history change
    if (isApplyingHistoryRef.current) return;

    // Only add if content actually changed
    const lastEntry = history[currentIndex];
    if (lastEntry && lastEntry.content === content) return;

    setHistory(prev => {
      // Remove any future history if we're not at the end
      const newHistory = prev.slice(0, currentIndex + 1);

      // Add new entry
      newHistory.push({
        content,
        timestamp: Date.now(),
        operation
      });

      // Keep only latest 15 entries
      if (newHistory.length > 15) {
        newHistory.shift();
        return newHistory;
      }

      return newHistory;
    });

    setCurrentIndex(prev => {
      const newIndex = prev + 1;
      return newIndex >= 15 ? 14 : newIndex;
    });
  }, [history, currentIndex]);

  const undo = useCallback(() => {
    // Prevent operations if already applying history
    if (isApplyingHistoryRef.current) return null;

    // Prevent rapid operations
    if (operationTimeoutRef.current) {
      clearTimeout(operationTimeoutRef.current);
    }

    if (currentIndex > 0) {
      isApplyingHistoryRef.current = true;
      setCurrentIndex(prev => prev - 1);

      // Reset flag with atomic operation
      operationTimeoutRef.current = setTimeout(() => {
        isApplyingHistoryRef.current = false;
      }, 300);

      return history[currentIndex - 1].content;
    }
    return null;
  }, [currentIndex, history]);

  const redo = useCallback(() => {
    // Prevent operations if already applying history
    if (isApplyingHistoryRef.current) return null;

    // Prevent rapid operations
    if (operationTimeoutRef.current) {
      clearTimeout(operationTimeoutRef.current);
    }

    if (currentIndex < history.length - 1) {
      isApplyingHistoryRef.current = true;
      setCurrentIndex(prev => prev + 1);

      // Reset flag with atomic operation
      operationTimeoutRef.current = setTimeout(() => {
        isApplyingHistoryRef.current = false;
      }, 300);

      return history[currentIndex + 1].content;
    }
    return null;
  }, [currentIndex, history]);

  const canUndo = currentIndex > 0 && history.length > 0;
  const canRedo = currentIndex < history.length - 1 && history.length > 0;

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (operationTimeoutRef.current) {
        clearTimeout(operationTimeoutRef.current);
      }
    };
  }, []);

  return {
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    isApplyingHistory: isApplyingHistoryRef.current
  };
};
