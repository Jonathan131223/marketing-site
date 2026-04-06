import {
  AppState,
  BriefData,
  EmailTemplate,
  UseCase,
  UseCaseCategory,
  FlowStep,
} from "./types";

// Storage keys
const STORAGE_KEYS = {
  WORKFLOW_STATE: "digistorms_workflow_state",
  BRIEF_DATA: "digistorms_brief_data",
  SELECTED_EMAIL: "digistorms_selected_email",
  FORM_PROGRESS: "digistorms_form_progress",
  EDITOR_STATE: "digistorms_editor_state",
  HISTORY_STATE: "digistorms_history_state",
  TEMPLATE_TWEAKS: "digistorms_template_tweaks",
} as const;

// Persistence utilities
export class StatePersistence {
  // Save workflow state (including complete email with subject/preview)
  static saveWorkflowState(state: {
    currentStep: FlowStep;
    selectedCategory: UseCaseCategory;
    selectedUseCase: UseCase | null;
    briefData: BriefData | null;
    selectedEmail: EmailTemplate | null;
  }) {
    try {
      // Ensure selectedEmail includes subject and preview if present
      const stateToStore = {
        ...state,
        selectedEmail: state.selectedEmail
          ? {
              ...state.selectedEmail,
              subject: state.selectedEmail.subject || "",
              preview: state.selectedEmail.preview || "",
            }
          : null,
      };
      localStorage.setItem(
        STORAGE_KEYS.WORKFLOW_STATE,
        JSON.stringify(stateToStore),
      );
    } catch (error) {
      console.warn("Failed to save workflow state:", error);
    }
  }

  // Load workflow state
  static loadWorkflowState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WORKFLOW_STATE);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn("Failed to load workflow state:", error);
      return null;
    }
  }

  // Save brief data separately for better granularity
  static saveBriefData(briefData: BriefData | null) {
    try {
      if (briefData) {
        localStorage.setItem(
          STORAGE_KEYS.BRIEF_DATA,
          JSON.stringify(briefData),
        );
      } else {
        localStorage.removeItem(STORAGE_KEYS.BRIEF_DATA);
      }
    } catch (error) {
      console.warn("Failed to save brief data:", error);
    }
  }

  // Load brief data
  static loadBriefData(): BriefData | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BRIEF_DATA);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn("Failed to load brief data:", error);
      return null;
    }
  }

  // Save selected email (including subject and preview from API)
  static saveSelectedEmail(email: EmailTemplate | null) {
    try {
      if (email) {
        // Ensure we store the complete email object including API-fetched subject/preview
        const emailToStore = {
          ...email,
          subject: email.subject || "",
          preview: email.preview || "",
        };
        localStorage.setItem(
          STORAGE_KEYS.SELECTED_EMAIL,
          JSON.stringify(emailToStore),
        );
      } else {
        localStorage.removeItem(STORAGE_KEYS.SELECTED_EMAIL);
      }
    } catch (error) {
      console.warn("Failed to save selected email:", error);
      // If storage quota exceeded, try to clean up and retry
      if (
        error instanceof DOMException &&
        error.name === "QuotaExceededError"
      ) {
        this.cleanupStorage();
        try {
          if (email) {
            const emailToStore = {
              ...email,
              subject: email.subject || "",
              preview: email.preview || "",
            };
            localStorage.setItem(
              STORAGE_KEYS.SELECTED_EMAIL,
              JSON.stringify(emailToStore),
            );
          }
        } catch (retryError) {
          console.error("Failed to save after cleanup:", retryError);
        }
      }
    }
  }

  // Load selected email
  static loadSelectedEmail(): EmailTemplate | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SELECTED_EMAIL);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn("Failed to load selected email:", error);
      return null;
    }
  }

  // Save template tweaks
  static saveTemplateTweaks(tweaks: any) {
    try {
      if (tweaks) {
        localStorage.setItem(
          STORAGE_KEYS.TEMPLATE_TWEAKS,
          JSON.stringify(tweaks),
        );
      } else {
        localStorage.removeItem(STORAGE_KEYS.TEMPLATE_TWEAKS);
      }
    } catch (error) {
      console.warn("Failed to save template tweaks:", error);
    }
  }

  // Load template tweaks
  static loadTemplateTweaks() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TEMPLATE_TWEAKS);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn("Failed to load template tweaks:", error);
      return null;
    }
  }

  // Save form progress (for BriefForm)
  static saveFormProgress(progress: Record<string, any>) {
    try {
      localStorage.setItem(
        STORAGE_KEYS.FORM_PROGRESS,
        JSON.stringify(progress),
      );
    } catch (error) {
      console.warn("Failed to save form progress:", error);
    }
  }

  // Load form progress
  static loadFormProgress(): Record<string, any> | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FORM_PROGRESS);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn("Failed to load form progress:", error);
      return null;
    }
  }

  // Save editor state
  static saveEditorState(state: {
    iframeHeight: number;
    lastSyncedContent: string;
    pendingOperations: Array<{
      id: string;
      type: string;
      timestamp: number;
      content?: string;
    }>;
  }) {
    try {
      localStorage.setItem(STORAGE_KEYS.EDITOR_STATE, JSON.stringify(state));
    } catch (error) {
      console.warn("Failed to save editor state:", error);
    }
  }

  // Load editor state
  static loadEditorState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EDITOR_STATE);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn("Failed to load editor state:", error);
      return null;
    }
  }

  // Save history state
  static saveHistoryState(state: {
    entries: Array<{
      content: string;
      timestamp: number;
      operation: string;
    }>;
    currentIndex: number;
  }) {
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY_STATE, JSON.stringify(state));
    } catch (error) {
      console.warn("Failed to save history state:", error);
    }
  }

  // Load history state
  static loadHistoryState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HISTORY_STATE);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn("Failed to load history state:", error);
      return null;
    }
  }

  // Clear all persisted state
  static clearAll() {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.warn("Failed to clear persisted state:", error);
    }
  }

  // Check if there's any persisted state
  static hasPersistedState(): boolean {
    try {
      return Object.values(STORAGE_KEYS).some(
        (key) => localStorage.getItem(key) !== null,
      );
    } catch (error) {
      console.warn("Failed to check persisted state:", error);
      return false;
    }
  }

  // Get state restoration info for debugging
  static getStateInfo() {
    try {
      const info: Record<string, any> = {};
      Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
        const value = localStorage.getItem(storageKey);
        info[key] = value ? "present" : "absent";
      });
      return info;
    } catch (error) {
      console.warn("Failed to get state info:", error);
      return {};
    }
  }

  // Cleanup storage to free up space
  static cleanupStorage(): void {
    try {
      console.log("Cleaning up localStorage to free space");

      // Remove old history entries (keep only last 10)
      const historyData = localStorage.getItem(STORAGE_KEYS.HISTORY_STATE);
      if (historyData) {
        try {
          const history = JSON.parse(historyData);
          if (
            history.entries &&
            Array.isArray(history.entries) &&
            history.entries.length > 10
          ) {
            const trimmedHistory = {
              ...history,
              entries: history.entries.slice(-10), // Keep only last 10 entries
            };
            localStorage.setItem(
              STORAGE_KEYS.HISTORY_STATE,
              JSON.stringify(trimmedHistory),
            );
            console.log(
              `Trimmed history from ${history.entries.length} to ${trimmedHistory.entries.length} entries`,
            );
          }
        } catch (e) {
          // If history is corrupted, remove it
          localStorage.removeItem(STORAGE_KEYS.HISTORY_STATE);
          console.log("Removed corrupted history data");
        }
      }

      // Remove any temporary or large data
      const keysToCheck = Object.values(STORAGE_KEYS);
      keysToCheck.forEach((key) => {
        try {
          const data = localStorage.getItem(key);
          if (data && data.length > 1000000) {
            // If larger than 1MB
            console.log(
              `Removing large data for key: ${key} (${data.length} bytes)`,
            );
            localStorage.removeItem(key);
          }
        } catch (e) {
          console.warn(`Failed to check key ${key}:`, e);
        }
      });

      console.log("Storage cleanup completed");
    } catch (error) {
      console.error("Failed to cleanup storage:", error);
    }
  }
}
