import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
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
