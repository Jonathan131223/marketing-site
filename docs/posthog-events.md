# PostHog Event Spec

Single source of truth for every event we capture across the **marketing site** (`digistorms.ai`) and the **app** (`app.digistorms.ai`).

Both sides report to the same PostHog project so we can build end-to-end funnels (X click → paid customer) in one query.

---

## Project setup

| Setting | Value |
|---|---|
| PostHog project | DigiStorms (project `86548`, EU region) |
| Region | EU (`https://eu.i.posthog.com`) |
| Project key (public) | `phc_OP8UdNfwUYwkKXleylyvpXnw4X1qGL3FaLegMkYWH1A` |
| Person profiles | `identified_only` (no profile until `posthog.identify()` is called) |

---

## Conventions

- **Event names**: `<object>_<action>` snake_case — e.g. `url_submitted`, `signup_completed`, `email_sent`
- **Property names**: snake_case — e.g. `cta_label`, `page_section`, `milestone_index`
- **Identify on signup**: as soon as a user signs up, the app calls `posthog.identify(user_id, { email, signup_source, ... })`. Anonymous events captured before that get linked via PostHog's auto-aliasing.
- **First-touch UTMs**: the marketing site captures UTMs on first visit, persists them in `localStorage` under `ds_first_touch_utms`, registers them as `first_touch_utm_*` super-properties, and forwards them via query params on every redirect to the app. The app should read them off the URL on first signup and identify the user with them.

---

## Marketing site events (already instrumented)

Implemented in `src/lib/analytics.ts`. Add new events there, never inline `posthog.capture()` calls.

| Event | Trigger | Properties |
|---|---|---|
| `$pageview` | Auto (PostHog) | URL, referrer, screen size |
| `$pageleave` | Auto (PostHog) | Duration |
| `$autocapture` | Auto (clicks on `<a>`, `<button>`, `<input>`) | element, text, href |
| `url_submitted` | Hero or final-CTA form submit | `page_section` (hero \| final-cta), `raw_url`, `normalized_url`, `is_valid` |
| `cta_clicked` | Nav CTAs (Sign up, Login, Talk to founder) | `cta_label`, `cta_destination`, `page_section` |
| `demo_video_played` | When demo video starts (helper exists, not yet wired — needs video to ship first) | `video_id`, `position_seconds` |
| `demo_video_completed` | When demo video finishes | `video_id` |
| `pricing_viewed` | (helper exists, wire on `/pricing` page) | `plan_focus` |
| `faq_expanded` | (helper exists, wire on FAQ accordion) | `question` |
| `outbound_link_clicked` | (helper exists, wire as needed) | `destination`, `link_text` |

Every event automatically includes `first_touch_utm_*` super-properties when UTMs are stored.

---

## App-side events (TO IMPLEMENT in `app.digistorms.ai`)

These are the steps between "user signs up" and "user pays $19/mo." They're the activation funnel — without them, we can't validate the "minutes to live" claim or measure free-to-paid conversion.

### Step 1: `signup_completed`

**Fires when:** A new user account is created.

**Required properties:**
- `signup_method` — `"email"` \| `"google"` \| `"github"` (whatever auth methods exist)
- `referral_source` — first-touch UTM source if available, else `"direct"`
- `email` — the user's email (PostHog person property — set via `$set`)

**Critical: call `posthog.identify()` here:**
```js
posthog.identify(userId, {
  email: user.email,
  signup_source: utmSource || "direct",
  first_touch_utm_source: urlParams.get("utm_source"),
  first_touch_utm_medium: urlParams.get("utm_medium"),
  first_touch_utm_campaign: urlParams.get("utm_campaign"),
  first_touch_utm_content: urlParams.get("utm_content"),
  signup_at: new Date().toISOString(),
});
posthog.capture("signup_completed", { signup_method: "email" });
```

This links the anonymous browsing session on the marketing site to the now-identified user. Without it, our funnels break.

### Step 2: `url_analyzed`

**Fires when:** The product analysis completes successfully (URL → milestones detected).

**Required properties:**
- `analyzed_url` — the URL the user analyzed
- `milestones_detected` — number (typically 4)
- `analysis_duration_ms` — how long the analysis took

### Step 3: `sequence_generated`

**Fires when:** AI finishes drafting the email sequence.

**Required properties:**
- `email_count` — number of emails in the sequence (typically 7)
- `generation_duration_ms`

### Step 4: `dns_configured`

**Fires when:** The user completes DNS setup for their sending domain (Entri or manual).

**Required properties:**
- `method` — `"entri"` \| `"manual"`
- `duration_seconds` — time from signup to DNS done

### Step 5: `lifecycle_event_received` (per-event)

**Fires when:** The customer's app sends its first lifecycle event (e.g., `user.signed_up`) to the DigiStorms API.

**Required properties:**
- `event_type` — the event name (`user.signed_up`, `milestone.1_achieved`, etc.)
- `is_first_event` — boolean — true if this is the first event ever for this customer

### Step 6: `email_sent`

**Fires when:** DigiStorms actually sends an email on behalf of the customer.

**Required properties:**
- `email_type` — `"welcome"` \| `"milestone_nudge"` \| `"trial_ending"` \| etc.
- `triggered_by_event` — the lifecycle event that triggered it
- `is_first_email` — boolean — true if this is the customer's first-ever sent email

### Step 7: `upgrade_completed`

**Fires when:** A user moves from Free to a paid plan.

**Required properties:**
- `from_plan` — `"free"` \| `"pro_19"` \| etc.
- `to_plan` — `"pro_19"` \| `"pro_59"` \| `"pro_149"`
- `mrr_added` — number (USD)
- `time_from_signup_seconds` — how long they were on free before upgrading

---

## Funnels to build in PostHog UI

After app-side events are wired, build these funnels:

### Funnel 1: Marketing → Activation

```
$pageview (homepage)
  → url_submitted
  → signup_completed
  → url_analyzed
  → sequence_generated
  → dns_configured
  → lifecycle_event_received (is_first_event=true)
  → email_sent (is_first_email=true)
```

This is the "minutes to live" funnel. Median time from signup → first email sent should be < 10 min for the messaging to hold.

### Funnel 2: Free → Paid

```
signup_completed
  → email_sent (is_first_email=true)
  → upgrade_completed
```

### Funnel 3: Channel attribution

Group by `first_touch_utm_source` and `first_touch_utm_campaign`:
- Visits → signups → upgrades by source
- Reveals which X / Reddit / DM campaigns convert to paid (not just signups)

---

## UTM convention reference

For external campaign links (X posts, Reddit, DMs, emails):

| Source | URL suffix |
|---|---|
| X beta video | `?utm_source=x&utm_medium=social&utm_campaign=beta_launch&utm_content=video_post` |
| X warm-list DMs | `?utm_source=x&utm_medium=dm&utm_campaign=beta_launch&utm_content=warmlist` |
| X warmup posts | `?utm_source=x&utm_medium=social&utm_campaign=beta_warmup&utm_content=post_[1-4]` |
| Reddit r/SaaS | `?utm_source=reddit&utm_medium=social&utm_campaign=beta_launch&utm_content=rsaas` |
| Reddit r/SideProject | `?utm_source=reddit&utm_medium=social&utm_campaign=beta_launch&utm_content=rsideproject` |
| Reddit r/indiehackers | `?utm_source=reddit&utm_medium=social&utm_campaign=beta_launch&utm_content=rindiehackers` |
| Calendly link in DMs | `?utm_source=x&utm_medium=dm&utm_campaign=beta_launch&utm_content=calendly` |
| Welcome email to dashboard | `?utm_source=email&utm_medium=transactional&utm_campaign=beta_onboarding` |

For Apr 29 public launch: same structure, swap `utm_campaign=public_launch`.
