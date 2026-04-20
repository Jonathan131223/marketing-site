import posthog from "posthog-js";

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

type UtmKey = (typeof UTM_KEYS)[number];
type Utms = Partial<Record<UtmKey, string>>;

const STORAGE_KEY = "ds_first_touch_utms";

let initialized = false;

export function initPostHog(): void {
  if (initialized || typeof window === "undefined") return;

  const key = import.meta.env.PUBLIC_POSTHOG_KEY;
  const host = import.meta.env.PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";

  if (!key || key.startsWith("phc_xxxx")) {
    if (import.meta.env.DEV) {
      console.warn("[PostHog] PUBLIC_POSTHOG_KEY missing — analytics disabled.");
    }
    return;
  }

  posthog.init(key, {
    api_host: host,
    person_profiles: "identified_only",
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: {
      dom_event_allowlist: ["click", "submit"],
      element_allowlist: ["a", "button", "input"],
    },
    loaded: () => {
      captureFirstTouchUtms();
    },
  });

  initialized = true;
}

function readUtmsFromUrl(): Utms {
  const params = new URLSearchParams(window.location.search);
  const utms: Utms = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) utms[key] = value;
  }
  return utms;
}

function captureFirstTouchUtms(): void {
  const fromUrl = readUtmsFromUrl();
  const hasNew = Object.keys(fromUrl).length > 0;

  if (hasNew) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...fromUrl, _ts: Date.now() }));
    } catch {
      // localStorage blocked — silent
    }
    posthog.register({
      first_touch_utm_source: fromUrl.utm_source,
      first_touch_utm_medium: fromUrl.utm_medium,
      first_touch_utm_campaign: fromUrl.utm_campaign,
      first_touch_utm_content: fromUrl.utm_content,
      first_touch_utm_term: fromUrl.utm_term,
    });
    return;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    const parsed = JSON.parse(stored) as Utms & { _ts?: number };
    posthog.register({
      first_touch_utm_source: parsed.utm_source,
      first_touch_utm_medium: parsed.utm_medium,
      first_touch_utm_campaign: parsed.utm_campaign,
      first_touch_utm_content: parsed.utm_content,
      first_touch_utm_term: parsed.utm_term,
    });
  } catch {
    // ignore
  }
}

export function getStoredUtms(): Utms {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    const parsed = JSON.parse(stored) as Utms & { _ts?: number };
    const { _ts, ...utms } = parsed;
    void _ts;
    return utms;
  } catch {
    return {};
  }
}

export function appendUtmsToUrl(url: string): string {
  const utms = getStoredUtms();
  if (Object.keys(utms).length === 0) return url;
  try {
    const u = new URL(url);
    for (const [key, value] of Object.entries(utms)) {
      if (value && !u.searchParams.has(key)) {
        u.searchParams.set(key, value);
      }
    }
    return u.toString();
  } catch {
    return url;
  }
}

export { posthog };
