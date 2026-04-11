import React from "react";

/**
 * Error boundary for the entire email generator React island.
 *
 * Background: because the email generator is mounted via Astro's
 * `client:only="react"`, there is NO server-rendered HTML fallback. If the
 * React tree throws anything during hydration or first render — a
 * corrupted localStorage entry, a stale bundle hash, a third-party script
 * injection, anything — the user sees a completely blank white page with
 * no explanation and no recovery path.
 *
 * This was observed in production on 2026-04-11 for a specific browser
 * session (cache-related, not reproducible in headless testing). Rather
 * than chasing ghosts, make the failure mode self-healing: catch the
 * error, clear persisted state, and offer a visible "reload" button so
 * the user is never stuck.
 *
 * The boundary also logs the error to console.error (always, not dev-gated)
 * so production Sentry / Datadog integrations in the future can surface
 * real-world crashes that never show up locally.
 */
interface State {
  error: Error | null;
}

export class EmailGeneratorErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error("[EmailGenerator] crashed during render:", error, info);
  }

  handleReset = (): void => {
    // Clear every digistorms-related localStorage key so the next load
    // starts from a clean slate. CRITICAL: the real keys use the
    // `digistorms_` underscore prefix (see src/store/persistence.ts). The
    // prior version of this method only matched `digistorms-` with a
    // hyphen — it ran successfully but silently cleared nothing, leaving
    // users stuck in a reload loop. Also clear sessionStorage as a
    // belt-and-suspenders measure.
    try {
      const toRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.startsWith("digistorms_") ||
            key.startsWith("digistorms-") ||
            key.startsWith("digi-marketing") ||
            key.includes("email-generator"))
        ) {
          toRemove.push(key);
        }
      }
      toRemove.forEach((k) => localStorage.removeItem(k));
    } catch {
      // ignore — reload will still happen below
    }
    try {
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  render(): React.ReactNode {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex flex-col items-center justify-center px-6 py-16">
          <div className="max-w-md text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-4">
              Something went wrong
            </h1>
            <p className="text-base text-slate-600 mb-8">
              The lifecycle email generator hit an unexpected error while
              loading. This is almost always a stale cache or an old saved
              draft. Clearing local data and reloading usually fixes it.
            </p>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#2563EB] text-white font-semibold hover:bg-[#1D4ED8] transition-colors"
            >
              Clear cache and reload
            </button>
            <p className="text-xs text-slate-400 mt-6">
              Still stuck? Email{" "}
              <a
                href="mailto:jonathan@digistorms.ai"
                className="underline hover:text-slate-600"
              >
                jonathan@digistorms.ai
              </a>{" "}
              and include the error details below.
            </p>

            {/*
              Error details are shown in production too (behind a details
              disclosure so they don't dominate the UI). This is the ONLY
              way to debug crashes on user browsers we cannot access —
              without this, every user-reported "blank page" or "something
              went wrong" becomes a guessing game. We include the message
              and the first few frames of the stack.
            */}
            <details className="mt-6 text-left">
              <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600">
                Show error details
              </summary>
              <pre className="mt-3 text-left text-xs text-red-600 bg-red-50 p-4 rounded-lg overflow-auto max-h-64 whitespace-pre-wrap break-words">
                {this.state.error.name}: {this.state.error.message}
                {this.state.error.stack
                  ? "\n\n" + this.state.error.stack.split("\n").slice(0, 8).join("\n")
                  : ""}
              </pre>
            </details>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
