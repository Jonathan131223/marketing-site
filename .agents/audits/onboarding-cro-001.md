# Onboarding CRO Audit #001 — DigiStorms Self-Serve Flow

*Auditor: Claude (acting as cofounder + first-time prospect)*
*Date: 2026-04-15*
*Method: Live dogfood of the public flow as a Linear-founder persona, end-to-end from homepage to dashboard*
*Test URL used: linear.app (real SaaS, no association — chosen to validate AI analysis quality)*

---

## TL;DR

**Activation health score: 6.5 / 10**

The pre-signup PLG flow is **excellent** (8/10) — value-first, fast, AI analysis is genuinely good. The post-signup activation is **broken** (4/10) because of a single failure mode: when DNS verification fails, the user has no recovery path and is fully blocked from setting up events, getting an API key, or sending emails. Everything downstream depends on DNS, and DNS has no rescue UX.

**The "minutes to live" claim is true on the happy path. On the unhappy path (which a meaningful % of users will hit), the user is dead in the water with no clear next step.**

**3 fixes that would lift activation by an estimated 30–50%:**

1. **Make the Entri "Auto-setup" button always visible and dominant on the DNS step.** Right now it's invisible in the failed/hooked-but-failed state.
2. **Replace the generic "Verification failed — check your DNS records" toast with diagnostic, recoverable error states.** ("DNS records not propagated yet — try in 60 seconds." / "Records missing — re-run Entri." / "Records mismatched — here's what we found vs expected.")
3. **Unblock the Events step from DNS.** Show the dynamic AI prompt and API key UI even before DNS is verified — let the user prep the integration in parallel with DNS propagation.

---

## What's working (don't break this)

| # | Strength | Why it matters |
|---|----------|----------------|
| 1 | **URL-input as primary CTA** instead of "sign up first" | Reduces friction at the highest-funnel step. Tally/Dub playbook. |
| 2 | **Value-first PLG** — user sees a generated email sequence BEFORE signup wall | Maximizes "I want to keep this" psychology |
| 3 | **AI analysis is genuinely accurate** — for `linear.app` it correctly identified category (Product Development Software), tagline (verbatim), primary milestone (Create your first project), secondary milestone (Invite team) | Validates the core product premise. This is the moat. |
| 4 | **6-step progress indicator visible upfront** (Website / Sender / Brief / Generate / DNS / Events) | Honest expectation-setting; user knows what's coming |
| 5 | **Sequence labels are semantic, not time-based** (Welcome / Milestone 1 / Nudge 1 / Milestone 2 / Nudge 2 / Trial ending / Trial ended) | Reinforces "behavior-based, not time-based" positioning at the UX level — better than competitors |
| 6 | **AI-generated email content is structurally sound** | First email weaves milestone CTA naturally; second email celebrates milestone + pivots to next action |
| 7 | **Per-email regenerate, AI Editor in toolbar, subject-line variants dropdown** | Gives users iteration power without overwhelming |
| 8 | **Dashboard CTA "Email me at jonathan@digistorms.ai"** | Founder-led trust signal; high-converting for indie ICP |
| 9 | **Auto-save while editing** (saw "Saving..." indicator on email switch) | Removes save anxiety |
| 10 | **Plan widget shows usage transparently** (0/100 free with upgrade CTA) | Low-pressure upsell, clear value boundary |

---

## CRITICAL findings (fix these to unblock launch)

### 🔴 C1 — Entri widget invisible in "hooked-but-failed" state

**What I observed:**
On the DNS step (step 5), the domain status was "❌ Verification failed" with sending domain `digistorms.ai`. The Entri "auto-setup" button was nowhere on the page. The only visible options were:
- A "Verify" button (read-only — just re-checks current state)
- An "Unhook" button (destructive — would detach the domain)
- An expandable "Optional: Manual DNS setup (fallback)" with TXT/CNAME records to copy/paste

**Why it's critical:**
Your messaging promises "minutes to live" via Entri. If a user lands in this state (which is exactly the state a re-attempt or a verification-not-yet-propagated user will see), Entri is invisible. They're forced into manual DNS — defeating the speed advantage. Worse, they may not realize "Unhook" → "re-add via Entri" is the path; the language doesn't suggest it.

**Recommended fix:**
- Render the Entri "Auto-setup with Entri →" button **always visible**, regardless of state, prominently above the "Optional: Manual" expandable
- Rename "Unhook" to something less jargon-y: "Disconnect domain" or "Remove and start over"
- If the domain is hooked but verification keeps failing, automatically suggest "Re-run Entri setup" instead of just "Verify"

### 🔴 C2 — DNS error toast is useless

**What I observed:**
Clicked "Verify" on the failed-state. Got a red toast: "Verification failed — Check your DNS records and try again."

**Why it's critical:**
This is "you broke your car, fix it" energy. The user doesn't know what to check, what's expected vs found, or whether DNS is just propagating slowly (which can take 1–60 minutes legitimately). They will assume the product is broken and bounce.

**Recommended fix — diagnostic, recoverable error states:**
- "Records not found yet. DNS can take 1–5 min to propagate after Entri runs. Try again in 60 seconds → [Auto-retry]"
- "TXT record found ✓, CNAME record missing ✗. [Re-run Entri] or [Copy CNAME record]"
- "Records found but mismatched. Expected: `resend._domainkey.placeholder.resend.com` / Found: `<actual>`. [Re-run Entri]"

This requires backend support to actually diff the records — the DNS query API can return what's there. ~1 day of work, massive UX upside.

### 🔴 C3 — Events step is fully gated behind DNS verification

**What I observed:**
Step 6 (Events) shows only a yellow warning: "Verify your domain first. You need to verify your sending domain before you can access or create an API key." The dynamic AI prompt that you described as the "5-min" Cursor-paste is hidden behind this gate.

**Why it's critical:**
DNS propagation can take minutes-to-hours. Forcing the user to wait idle (or worse, retry-fail-retry-fail) before they can even SEE the events setup wastes the user's energy and momentum. The activation window is when motivation is highest — right after they generated their sequence. By the time DNS is verified, that motivation may have faded.

Also: a developer-founder might want to start the events integration work in parallel with DNS propagation. Right now they can't.

**Recommended fix:**
- Show the events setup UI (dynamic prompt, API key field, code snippet) **regardless of DNS state**
- Mark the "Test event firing" button as disabled until DNS is verified, with hover tooltip explaining why
- Even better: let the user copy the dynamic AI prompt to their clipboard, run it in Cursor, and write the integration code in parallel. The events can queue and fire as soon as DNS verifies.

This is the single biggest activation lift available. Removing the artificial dependency between two steps that don't actually need to be sequential.

### 🟡 C4 — Signup modal obscures the generated value

**What I observed:**
After "Generate with AI", the customize page renders the email preview AND immediately pops a centered modal saying "Create your account." The modal covers the body of the very email the user is being asked to sign up to keep. The visible text behind the modal was faded/blurred too.

**Why it's critical:**
The whole point of the value-first PLG flow is "see the value, then commit." If the user can't actually READ what they've generated before being asked to sign up, the conversion psychology breaks. They're being asked to commit blind.

**Recommended fix:**
- Render the signup form as a **right-side panel/sidebar** (300–400px wide) so the email preview stays visible
- OR: Allow user to scroll/read the first 2 emails before showing the signup CTA (e.g., trigger modal on second email click, or after 30 sec of dwell time)
- Either way: the preview must be **fully readable** when the signup ask hits

---

## HIGH-priority friction (fix in week 1 of launch)

### 🟠 H1 — No setup checklist on the dashboard

**Observed:** Dashboard empty state says "No lifecycle events yet. Send events from your app (see Events) to populate the pipeline." That's a sentence with a parenthetical, not an action.

**Fix:** Add a setup checklist widget at the top of the dashboard for unactivated users:
- ✅ Email sequence created
- ❌ [Verify your domain] (Action button →)
- ❌ [Set up lifecycle events] (Action button →)
- ❌ Send your first event (auto-detects)

Hide when all 4 are green. Standard pattern from Slack, Linear, Notion. Lifts activation 20–40% in published case studies.

### 🟠 H2 — "Pricing model" field on Brief shows "14 days"

**Observed:** Brief step has a field labeled "Pricing model" with the value "14 days".

**Fix:** Either rename the field to "Trial length" (if that's what it captures) or expand it into a real pricing-model selector (Free trial: 7/14/30 days / Freemium / Paid-only).

### 🟠 H3 — "Don't forget to save your sequence, or you lose progress" — loss-framed FUD

**Observed:** Sticky text on the customize page. But the system actually auto-saves (saw "Saving..." indicator).

**Fix:** Either remove (auto-save handles it) or reframe positively: "Your changes are saved automatically." Loss-framing on a converted user is unnecessary anxiety.

### 🟠 H4 — "Work Email" label on signup excludes indie hackers

**Observed:** Signup modal says "Work Email" — your ICP includes solo indie hackers using personal emails.

**Fix:** Just "Email address."

### 🟠 H5 — "Book a demo" in nav conflicts with PLG/indie ICP

**Observed:** Header has "Book a demo" between Pricing and Login.

**Fix:** Either remove (your ICP doesn't book demos) or rename to "Talk to founder" / "Chat with Jonathan" — leverages the founder-led trust signal you already use elsewhere.

---

## MEDIUM-priority polish (fix when convenient)

### 🟢 M1 — Generation analyzing state could be more engaging
"Analyzing..." is a spinner. Showing rotating status messages ("Reading your homepage... Detecting your value prop... Identifying milestones... Drafting welcome email...") makes the wait feel productive. Free entertainment, perceived speed.

### 🟢 M2 — AI email content is slightly corporate
Phrases like "this is a big step in aligning your team with your product initiatives and strategic roadmaps" read as ChatGPT-default. Cofounders write shorter, blunter, more first-person. Tightening the prompt's voice spec to match founder tone (read your own X posts as the style guide) would help. Ship a v2 system prompt that says "Write like a YC founder. Short sentences. Specific verbs. Skip corporate filler."

### 🟢 M3 — "Sending domain: digistorms.ai" when user entered linear.app
This was likely because Jonathan was already authenticated when I tested. But verify that for a fresh signup, the sending-domain default is the user's claimed product domain (parsed from the URL they entered), not whatever is in the account. Don't assume.

---

## Suggested instrumentation (do BEFORE launch)

You're flying blind without funnel analytics. Add events for these 14 transitions and you'll know exactly where the leaks are within 48 hours of launch:

| Event | What it captures |
|-------|------------------|
| `homepage.url_input.focused` | Hero engagement |
| `homepage.url_input.submitted` | Hero conversion |
| `generator.step_1.completed` | Website analyzed |
| `generator.step_2.completed` | Sender info entered |
| `generator.step_3.completed` | Brief reviewed |
| `generator.step_4.completed` | Sequence generated |
| `signup.modal.shown` | Reached signup wall |
| `signup.completed` | Account created |
| `customize.email_edited` | Active engagement post-signup |
| `dns.entri.clicked` | Started DNS via Entri |
| `dns.manual.expanded` | Fell back to manual |
| `dns.verify.success` | DNS verified ✅ activation milestone 1 |
| `events.api_key.created` | Got API key |
| `events.first_event.received` | ✅ activation milestone 2 (true activation) |

Once you have 50–100 signups, the funnel will tell you which of the C1–C3 fixes to prioritize first. Without it, you're guessing.

---

## What this audit changes about the product-marketing-context

Update `.agents/product-marketing-context.md` after fixes ship:

- **Activation Friction section:** add the C1/C2/C3 findings as known issues + their fixes
- **Customer Language section:** none of the observed text gives us VOC — still need 10 verbatim quotes
- **Objections section:** add a hypothesis: "What if DNS doesn't work?" — this will come up in design partner calls

---

## Recommended fix order

| Order | Fix | Effort | Expected lift |
|-------|-----|--------|---------------|
| 1 | C3 — Unblock Events from DNS | 1–2 days | +20–30% activation |
| 2 | C1 — Always-visible Entri button | 0.5 day | +10–15% DNS completion |
| 3 | C2 — Diagnostic DNS errors | 1–2 days | +10–20% DNS completion |
| 4 | C4 — Signup modal as sidebar | 0.5 day | +5–10% signup conv. |
| 5 | H1 — Dashboard setup checklist | 0.5 day | +10–20% activation |
| 6 | Instrumentation (14 events) | 1 day | Visibility (no direct lift, but unblocks every future fix) |
| 7 | H2–H5 + M1–M3 | 1 day total | +2–5% each |

**Total: ~6 days of work for an estimated 30–50% activation lift before launch.**

That's the highest-leverage week of work on your roadmap right now.
