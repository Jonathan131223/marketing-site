import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
});

// jsdom does not implement window.matchMedia, which Radix, sonner, and other
// UI primitives call during mount. Stub it once so every test file inherits
// the same contract — avoids per-file copy-paste and isolation drift.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  configurable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});

// Astro injects PUBLIC_* env vars via import.meta.env; provide a default
// so components that read PUBLIC_APP_BASE_URL work under jsdom.
if (typeof import.meta.env === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (import.meta as any).env = {};
}
if (!import.meta.env.PUBLIC_APP_BASE_URL) {
  import.meta.env.PUBLIC_APP_BASE_URL = "https://app.digistorms.ai";
}
