// Utility for persisting and processing authentication intents across redirects
// This lets us resume the editor or auto-run a requested action after login/signup

export type AuthIntentAction =
  | "resumeOnly"
  | "saveDraft"
  | "copyHtml"
  | "copyText"
  | "exportEmail"
  | "sendTestEmail";

export interface AuthIntentPayload {
  // For sendTestEmail, optional email address
  testEmail?: string;
}

export interface AuthIntent {
  action: AuthIntentAction;
  targetRoute:
    | "/portal"
    | "/portal/generate"
    | "/portal/customize"
    | "/portal/templates"
    | "/portal/brief";
  source: "home" | "brief" | "gallery" | "editor" | "unknown";
  payload?: AuthIntentPayload;
  timestamp: number;
}

const AUTH_INTENT_KEY = "ds_auth_intent";
export const AUTH_INTENT_EVENT = "ds_auth_intent_perform";

export function setAuthIntent(intent: AuthIntent) {
  try {
    localStorage.setItem(AUTH_INTENT_KEY, JSON.stringify(intent));
  } catch {}
}

export function getAuthIntent(): AuthIntent | null {
  try {
    const raw = localStorage.getItem(AUTH_INTENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthIntent;
  } catch {
    return null;
  }
}

export function clearAuthIntent() {
  try {
    localStorage.removeItem(AUTH_INTENT_KEY);
  } catch {}
}

// Dispatch a browser event for panels to perform the intended action
export function dispatchAuthIntentEvent(intent: AuthIntent) {
  const evt = new CustomEvent(AUTH_INTENT_EVENT, {
    detail: { action: intent.action, payload: intent.payload },
  });
  window.dispatchEvent(evt);
}
