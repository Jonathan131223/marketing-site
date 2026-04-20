# PostHog Handoff Checklist

What you (Jonathan) need to do, in order. Time estimates are realistic.

---

## 1. Add env vars to Vercel (5 min) — REQUIRED before next deploy

The marketing site reads `PUBLIC_POSTHOG_KEY` and `PUBLIC_POSTHOG_HOST` from env. They're in `.env.local` for local dev, but Vercel needs them set explicitly:

1. Vercel → digi-marketing project → Settings → Environment Variables
2. Add **two** vars to **Production, Preview, AND Development**:

   | Key | Value |
   |---|---|
   | `PUBLIC_POSTHOG_KEY` | `phc_OP8UdNfwUYwkKXleylyvpXnw4X1qGL3FaLegMkYWH1A` |
   | `PUBLIC_POSTHOG_HOST` | `https://eu.i.posthog.com` |

3. Trigger a redeploy (or wait for the next push)

Without this, PostHog will silently no-op in production. The init code logs `[PostHog] PUBLIC_POSTHOG_KEY missing — analytics disabled.` to console in dev — same will happen in prod.

---

## 2. Rename the PostHog project (10 sec)

You're using project 86548 ("Default project"). Rename it for sanity:
- PostHog → top-left project switcher → click "Default project" → ⋯ menu → Rename → `DigiStorms`

---

## 3. Build the dashboards (15 min) — recommended before Wed launch

Three dashboards to build in PostHog UI. All under PostHog → Dashboards → New dashboard.

### Dashboard A: "Launch performance"
For watching launch day live.

**Insights to add:**

1. **Pageviews by source** — bar chart, last 24h, breakdown by `first_touch_utm_source`
2. **URL submits by source** — bar chart, event = `url_submitted`, last 24h, breakdown by `first_touch_utm_source`
3. **CTA clicks** — bar chart, event = `cta_clicked`, last 24h, breakdown by `cta_label`
4. **Top campaigns** — table, event = `$pageview`, breakdown by `first_touch_utm_campaign`, sorted by count
5. **Live event stream** — Activity tab on the right (built-in)

### Dashboard B: "Marketing → Activation funnel"
For tracking how leaky the funnel is.

**Funnel insight (build once `signup_completed` is wired in the app):**
```
1. $pageview           (homepage)
2. url_submitted
3. signup_completed    (app event)
4. url_analyzed        (app event)
5. sequence_generated  (app event)
6. dns_configured      (app event)
7. lifecycle_event_received (where is_first_event = true)
8. email_sent          (where is_first_email = true)
```
Time window: 7 days. This is the "minutes to live" funnel.

### Dashboard C: "Channel attribution"
For deciding where to spend more time/money.

**Insights:**

1. **Signups by source** — funnel visit → signup, breakdown by `first_touch_utm_source`
2. **Paid conversions by source** — funnel visit → upgrade_completed, breakdown by `first_touch_utm_source`
3. **MRR by source** — sum of `mrr_added` from `upgrade_completed`, breakdown by `first_touch_utm_source`
4. **Time-to-paid by source** — average of `time_from_signup_seconds` from `upgrade_completed`, breakdown by `first_touch_utm_source`

---

## 4. Verify in production after deploy (5 min)

1. Open `digistorms.ai` in incognito with a UTM: `digistorms.ai/?utm_source=verify_prod`
2. Open PostHog → Activity (live event stream)
3. Within ~10 seconds you should see:
   - `$pageview` event with `first_touch_utm_source = verify_prod`
4. Click a CTA (e.g., Talk to founder) — should fire `cta_clicked` with `cta_label = "Talk to founder"`
5. Submit a URL on the homepage — should fire `url_submitted`

If you see the events: ✅ live in production.

If not: check Vercel env vars (step 1), then check browser console for `[PostHog]` warnings.

---

## 5. App-side events (post-launch, ~1-2 hours)

The full activation funnel needs events fired from `app.digistorms.ai`. The spec is in `docs/posthog-events.md`. Most important call to add first:

**On signup, in the app:**
```js
import posthog from 'posthog-js';

// Initialize once, app-wide (use the SAME key as marketing site)
posthog.init('phc_OP8UdNfwUYwkKXleylyvpXnw4X1qGL3FaLegMkYWH1A', {
  api_host: 'https://eu.i.posthog.com',
});

// On successful signup:
const urlParams = new URLSearchParams(window.location.search);
posthog.identify(user.id, {
  email: user.email,
  signup_at: new Date().toISOString(),
  first_touch_utm_source: urlParams.get('utm_source'),
  first_touch_utm_medium: urlParams.get('utm_medium'),
  first_touch_utm_campaign: urlParams.get('utm_campaign'),
  first_touch_utm_content: urlParams.get('utm_content'),
});
posthog.capture('signup_completed', { signup_method: 'email' });
```

This single change unlocks the full marketing → paid funnel.

The other events (`url_analyzed`, `sequence_generated`, `dns_configured`, etc.) are spec'd in `docs/posthog-events.md`. Implement as you ship each step of the user flow.

---

## 6. Optional: enable session replay

In PostHog → Project settings → Session replay → toggle on. Free tier covers a generous number of recordings. Watching real users on launch day is the single most useful thing you can do — beats any dashboard.

If you turn it on, also add to `src/lib/posthog.ts` init config:
```ts
session_recording: {
  maskAllInputs: true,    // don't record what users type into the URL field
  maskTextSelector: ".sensitive",
},
```
(Not strictly needed for you yet — your URL field doesn't capture sensitive data — but good hygiene.)
