import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./index.css";
import "@fontsource/instrument-sans/400.css";
import "@fontsource/instrument-sans/500.css";
import "@fontsource/instrument-sans/600.css";
import "@fontsource/instrument-sans/700.css";
import "@fontsource/kalam/300.css";
import "@fontsource/kalam/400.css";
import "@fontsource/kalam/700.css";

const TRACKING_QUERY_KEYS = new Set([
  "_gl",
  "_ga",
  "gclid",
  "fbclid",
  "msclkid",
  "ttclid",
]);

function cleanTrackingQueryParams(): void {
  const url = new URL(window.location.href);
  let changed = false;

  for (const key of [...url.searchParams.keys()]) {
    if (TRACKING_QUERY_KEYS.has(key) || key.startsWith("_ga_")) {
      url.searchParams.delete(key);
      changed = true;
    }
  }

  if (!changed) return;

  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState(window.history.state, "", nextUrl);
}

cleanTrackingQueryParams();

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
