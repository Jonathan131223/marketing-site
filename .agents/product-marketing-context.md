# Product Marketing Context

*Last updated: 2026-04-15*

## Product Overview
**One-liner:** The AI agent that moves your users from signup to paid.
**What it does:** DigiStorms is an AI onboarding agent for SaaS. It analyzes your product from a URL, detects key activation milestones, and ships a 7-email onboarding sequence that fires based on real user behavior — not time-based drips. It tracks users through onboarding, stops emails when they upgrade, and adapts to trial length.
**Product category:** AI onboarding agent / user activation system. NOT an email marketing tool, lifecycle tool, or campaign builder.
**Product type:** SaaS (self-serve, PLG)
**Business model:** Freemium, usage-based tiers (priced per onboarded users):
- **Free** — up to 100 onboarded users
- **$19/mo** — up to 1,000 onboarded users
- **$59/mo** — up to 5,000 onboarded users
- **$149/mo** — up to 10,000 onboarded users
- **Enterprise** — >10,000 users, contact sales
- **Annual discount:** 20% off on all paid tiers

## Target Audience
**Target companies:** Early-stage SaaS, indie hackers, small SaaS teams. Low resources, no lifecycle system in place, technical or semi-technical.
**Decision-makers:** Founder (solo or small team). Occasionally a marketing hire at slightly more mature teams.
**Primary use case:** Turn free/trial signups into paying customers without building a lifecycle ops function.
**Jobs to be done:**
- Ship onboarding emails in minutes instead of weeks
- Convert free users to paid without hiring a lifecycle marketer
- Know what to send and when, without becoming an email expert
- See where users drop off in onboarding and fix it

**Use cases:**
- Post-signup activation emails ("you haven't done X yet")
- Trial-ending upgrade nudges
- Milestone celebrations that reinforce habit
- Re-engagement for stuck users

## Personas
| Persona | Cares about | Challenge | Value we promise |
|---------|-------------|-----------|------------------|
| Solo founder (primary) | Activation, conversion, speed | No time to build lifecycle, not an email expert | Onboarding sequence live in minutes, not weeks |
| Early marketing hire | Proving impact, reducing manual work | Stuck rebuilding the same flows each job | AI drafts it, they refine — 10x leverage |
| Indie hacker | Ship fast, keep costs low | Can't justify Customer.io pricing | Free tier covers first 100 users |

## Problems & Pain Points
**Core problem:** SaaS signups don't activate and don't convert to paid. The founder knows emails would help but has no time, no expertise, and no clean way to tie emails to in-product behavior.

**Why alternatives fall short:**
- Customer.io / Loops / Intercom / Userlist require you to design every sequence manually and maintain it
- They're time-based (send on day 1, 3, 7) — not behavior-based
- They assume you already know your onboarding milestones and have lifecycle expertise
- Pulsent (closest direct competitor) is enterprise sales-led, requires a demo, high pricing, weeks to implement
- "DIY with ConvertKit/Mailchimp" = weeks of setup and guessing
- Hiring a lifecycle consultant = /mo and you still have to manage them

**What it costs them:** Every signup that doesn't activate is wasted paid traffic + churn. A SaaS losing 50% of trials at activation is leaking revenue every single day.

**Emotional tension:** "My funnel is leaky and I don't have time to fix it." / "I know I should have onboarding emails but I don't know what to send." / "Customer.io is overkill and I can't afford a consultant."

## Competitive Landscape
**Direct:** Pulsent (YC-backed) — sales-led, enterprise-priced, weeks to implement, no self-serve, no SEO/indie presence. Falls short for founders who need it now and can't justify an enterprise contract.

**Secondary:** Customer.io, Loops, Userlist, Intercom, Encharge — general lifecycle tools. Falls short because they're tool + DIY, not agent + done-for-you. You still have to decide what to send and when.

**Indirect:** "DIY with ConvertKit/Mailchimp" (weeks of manual setup, no behavior triggers), "Hire a consultant" (expensive, slow), "Don't do it yet" (the most common — and most dangerous — alternative).

## Differentiation
**Key differentiators:**
- **AI agent, not a tool** — it figures out your onboarding flow automatically from your URL
- **Behavior-based, not time-based** — emails fire when users do things, not on schedule
- **Minutes to live, not weeks** — dramatic speed advantage over every alternative
- **Self-serve + free tier** — no demo, no sales call, no contract
- **Built by a lifecycle expert** — Jonathan's consulting background means the defaults are actually good

**How we do it differently:** We analyze your product, detect milestones (signup, milestone 1, milestone 2, upgrade), generate the sequence, and fire emails on lifecycle events via API. You don't design flows — the agent does.

**Why that's better:** Founders get a working activation system in minutes without becoming lifecycle experts. Emails are more relevant because they're triggered by behavior. The whole thing runs itself.

**Why customers choose us:** Speed + simplicity + self-serve + the "AI agent" framing. Pulsent makes them book a demo. Customer.io makes them learn a platform. We make them paste a URL.

## Objections

> ⚠️ **HYPOTHESIS — not validated.** Pre-launch, no customer interviews yet. The first 10 design-partner conversations should validate/replace this table. Until then, this is founder intuition, not VOC.

| Objection | Response |
|-----------|----------|
| "Why not just use Customer.io / Loops?" | Those are tools — you still design every sequence. DigiStorms is an agent that generates the sequence for you. Use us alongside them if you want; we handle the thinking, they handle the sending. |
| "Is AI-generated email going to sound off-brand or spammy?" | Every email is fully editable before it sends. The AI generates v1 — you approve, customize, or rewrite. Trained on 1,000+ real SaaS emails in our library. |
| "What if it sends the wrong email?" | Behavior-based triggers mean we only send when the action fires. Plus: hard stops when users upgrade, and you have full control to pause or edit. |
| "We're too early / not ready for lifecycle" | The earliest days are when activation matters most. Every signup you lose now compounds. Free tier covers your first 100 users. |
| "How is this different from Pulsent?" | Pulsent is sales-led enterprise. We're self-serve PLG. Minutes vs weeks. / vs enterprise pricing. |

**Anti-persona:**
- Mid-market/enterprise SaaS wanting SSO, SOC2 day-one, dedicated CSM, and 6-month rollouts — go use Pulsent
- Companies without a SaaS product (e-commerce, services, agencies)
- Teams with a mature lifecycle ops function already building their own sequences

## Switching Dynamics
**Push (frustrations with current state):**
- Signups aren't activating
- Manual email setup in Customer.io/Mailchimp is tedious and they haven't finished it
- Don't know what to send or when
- Can't justify consultant fees

**Pull (what attracts them to DigiStorms):**
- "AI agent" framing — feels like a co-pilot, not another tool to learn
- URL → sequence in minutes
- Behavior-based triggers (sounds smart, is smart)
- Free tier
- Built by a lifecycle expert, not a generic AI wrapper

**Habit (what keeps them stuck):**
- Existing ESP subscription they're paying for
- "I'll get around to it" procrastination
- Fear of breaking what little they have set up
- Nothing is overtly broken — just suboptimal

**Anxiety (worries about switching):**
- "Will the AI sound off-brand?"
- "Is this legit or a ChatGPT wrapper?"
- "What if it sends something wrong to my users?"
- "Do I need to rip out my current ESP?"
- "Am I locked in?"

## Customer Language

> ⚠️ **HYPOTHESIS — not VOC.** No customer interviews conducted yet (pre-launch). The quotes below are founder intuition based on lifecycle-consulting background. Priority: capture 10 verbatim quotes from X replies, DMs, waitlist signups, and first design-partner calls. Replace this section with real language ASAP — copy that uses founder intuition underperforms copy that uses verbatim customer words.

**How they describe the problem (verbatim — to validate with actual customer interviews):**
- "My signups don't activate"
- "Users sign up and ghost"
- "My funnel is leaky"
- "I don't have time for lifecycle"
- "I don't know what emails to send"
- "I'll get around to onboarding emails"

**How they describe us (aspirational — needs validation):**
- "It figures out my onboarding for me"
- "Sends emails when people actually do stuff"
- "Finally a lifecycle tool that doesn't need a consultant"

**Words to use:** onboarding, activation, behavior-based, AI agent, milestones, signup to paid, self-serve, minutes, free-to-paid, aha moment, first campaign live

**Words to avoid:** email marketing, drip campaign, lifecycle tool, enterprise, demo, sales rep, book a call, schedule a consultation, platform, comprehensive suite

**Glossary:**
| Term | Meaning |
|------|---------|
| Milestone | A key onboarding event (signup, milestone 1, milestone 2, upgrade) — the skeleton of the email sequence |
| Activation | A user reaching their "aha moment" — the action that indicates they got value |
| Behavior-based | Emails triggered by in-product events, not time delays |
| Agent | DigiStorms itself — frames the product as an AI teammate, not a tool |
| Lifecycle event | API call from the customer's product (user.signed_up, milestone.1_achieved, etc.) |

## Brand Voice
**Tone:** Direct, founder-to-founder, scrappy. No corporate fluff. Outcome-first. A little bit cheeky where appropriate.

**Style:** Conversational but sharp. Short sentences. Strong verbs. Outcomes before features. Numbers when relevant. No hedging.

**Personality:** Practical. Fast. Founder-aware. No-BS. Helpful. Slightly contrarian against the "lifecycle suite" incumbents.

## Proof Points
**Metrics (update as available):**
- SEO: 16.8k impressions / 83 clicks / 0.5% CTR / avg position 8 (3-month GSC) — momentum ramping late March/April
- X: 4.9M impressions / 3.1% engagement rate / 154.3K engagements / 1.4K verified followers (trailing year)
- LinkedIn: 26,284 impressions / 11,986 members reached (90d, growing)
- 1,000+ real SaaS lifecycle emails in library

**Customers:** Pre-launch. Drew Price testimonial live on homepage. Needs 20–50 design partners before GA launch.

**Testimonials:**
> "DigiStorms is a game-changer for startups and growth-stage teams that want to build their onboarding email sequence fast. I recommend everyone I know give it a spin and see for themselves."
> — Drew Price

**ICP note from testimonial:** Drew's language ("startups **and growth-stage teams**") is broader than the original ICP (indie/early-stage only). Watch whether growth-stage teams actually convert — if they do, ICP widens. If only early-stage converts, treat Drew's line as aspirational positioning rather than ICP truth.

**Value themes:**
| Theme | Proof |
|-------|-------|
| Speed (minutes vs weeks) | URL → sequence generated in minutes; no setup, no demo |
| Built by a lifecycle expert | Jonathan's background as a SaaS lifecycle consultant; 1,000+ emails in library |
| Behavior-based intelligence | API-driven event triggers; stops on upgrade; adapts to trial length |
| Self-serve / founder-friendly | Free tier, no demo, no contract, sub-mid-market pricing |

## Known Activation Friction

> Relevant for `onboarding-cro` and `launch-strategy`. These are the two product-specific setup steps between signup and first live email.

DigiStorms has **two required setup steps** between signup and first email send — both designed to be minute-scale:

**1. DNS configuration** (for sending domain)
- Why: email must send from customer's domain, not a generic DigiStorms domain
- How it's fast: **Entri integration** handles one-click DNS for supported registrars
- Target time: **~1 minute**
- Residual friction (edge cases): unsupported registrars, customers without DNS admin access

**2. Lifecycle event setup** (so emails fire on real behavior)
- Why: the "behavior-based, not time-based" differentiator requires customers to emit events (`user.signed_up`, `milestone.1_achieved`, etc.)
- How it's fast: **dynamic AI-coding-assistant prompt** — paste into Cursor/Claude Code/Copilot, generates the integration code for the customer's stack
- Target time: **~5 minutes**
- Residual friction (edge cases): non-technical founders without an AI coding setup; unusual stacks

**End-to-end target:** URL paste → sequence generated → DNS configured → events firing → live, in under **10 minutes**. This validates the "minutes to live" messaging claim.

**Open validation questions (to answer post-launch with funnel data):**
- Does end-to-end actually land under 10 min for typical users?
- What % of signups complete each step?
- Do the mitigations (Entri, dynamic prompt) hit their target speeds across common stacks?

## Goals
**Business goal:** Launch publicly, land first 100 paying customers via PLG, prove activation lift with design partner case studies.

**Conversion action:**
1. Free signup at app.digistorms.ai
2. Connect product (URL analysis)
3. Ship first behavior-based campaign (activation milestone)
4. Upgrade to Pro when hitting free tier limits

**Current metrics (pre-launch):**
- Traffic: SEO climbing, X dormant but historically strong, LinkedIn growing from small base
- Funnel conversion: N/A (not launched)
- Top priority: Launch → waitlist → 20-50 design partners → case studies → GA

---

*This file is the foundation for all other marketing skills in this repo. Update by running `/product-marketing-context` again. Other skills will read this before asking clarifying questions.*
