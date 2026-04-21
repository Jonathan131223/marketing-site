# Content voice: anti-AI-slop rules

Apply to every blog post, landing page, email, social caption, and OG card.
When the Level-1 content pipeline runs, this file is the writing brief.

The goal: founder-to-founder, scrappy, direct. Reads like a human wrote it
in one sitting, not like a model generated it in 30 seconds.

## Hard rules (never break)

1. **Em dashes: 3 per article, max.** The single strongest AI tell. Use
   commas, periods, parentheses, or colons instead. Every time you reach
   for `—`, ask "could a period split this cleanly?" and usually the
   answer is yes.

2. **Never "it's not X, it's Y" constructions.** Classic AI sentence
   shape. Rewrite as a single declarative: not "it's not a pitch, it's a
   handshake," just "it's a handshake" or "welcome emails handshake, they
   don't pitch."

3. **No "whether you're a X, Y, or Z" intros.** Lazy shape. Name the one
   actual audience.

4. **No "In today's [fast-paced / digital / ever-evolving] world."**
   Ever. Just delete the whole phrase, start the sentence with the verb.

5. **No "let's delve into," "dive deep," "unpack," "unveil,"
   "navigate the landscape of."** Open with the substance.

6. **No filler intensifiers.** Strike on sight: "truly," "literally,"
   "absolutely," "definitely," "certainly," "really," "very," "basically,"
   "essentially," "ultimately," "fundamentally," "simply," "genuinely,"
   "actually" (most of the time).

7. **No AI verb tells.** Replace: "leverage" → use. "utilize" → use.
   "facilitate" → help. "optimize" → improve. "streamline" → simplify.
   "enhance" → improve. "foster" → build. "empower" → let / help.

8. **No AI adjective tells.** Replace: "robust" → strong / reliable.
   "comprehensive" → full / thorough. "seamless" → smooth / easy.
   "nuanced" → subtle. "holistic" → complete. "cutting-edge" → new.
   "innovative" → new / original. "pivotal" → key. "paramount" → critical.

9. **No AI transitions.** Strike: "furthermore," "moreover,"
   "that being said," "it is worth noting that," "at its core,"
   "in essence," "this begs the question."

10. **No AI concluders.** Strike: "in conclusion," "to sum up,"
    "all things considered," "at the end of the day."
    End the post on a specific, concrete sentence.

## Soft rules (follow most of the time)

- **Short sentences beat long ones.** Aim for 8-18 words average.
  Every sentence >25 words should be questioned.
- **Start paragraphs with a verb or a number when you can.** Not "It
  is important to consider that..." but "Consider that..." or "Three
  things matter here:"
- **Numbers beat adjectives.** "12,000 impressions/month" beats
  "significant traffic." "3.4x conversion lift" beats "great results."
- **Contractions on.** "It's," "don't," "you're." Formal contractions-off
  reads as LinkedIn-post-mode, which reads as AI-mode.
- **One idea per paragraph.** If you find yourself using "also" or
  "additionally" to link sentences in the same paragraph, you probably
  have two paragraphs.
- **Cut the wind-up.** Most AI-written first sentences are wind-up
  ("When it comes to SaaS email marketing, many founders struggle
  with..."). Delete the wind-up. Start on the punch.

## DigiStorms-specific style (from DESIGN.md)

- **Direct, founder-to-founder, scrappy.** No corporate fluff.
- **Outcome-first.** Lead with what it does for the reader, not what
  the product is.
- **A little bit cheeky** where it fits. Not snarky, not mean, just
  confident.
- **Slightly contrarian** against the "lifecycle suite" incumbents.
- **Practical, fast, no-BS.** Every section should be actionable or it
  gets cut.

**Words to use:** onboarding, activation, behavior-based, AI agent,
milestones, signup to paid, self-serve, minutes, free-to-paid, aha
moment, first campaign live.

**Words to avoid:** email marketing (we say lifecycle email), drip
campaign, enterprise, demo, sales rep, book a call, schedule a
consultation, platform, comprehensive suite.

## Self-check (run before shipping)

```bash
npm run content:voice-check <path-to-markdown>
```

The check flags:
- Em dashes > 3
- "not X, it's Y" sentences
- Banned phrases (the 10 hard rules)
- Filler intensifier count

It does NOT auto-rewrite. It flags, you fix. Rewriting by rule is how we
got AI slop in the first place.

## For the content pipeline

When writing a new article, include this file contents as part of the
system prompt. The pipeline should:

1. Generate a first draft
2. Run the voice-check
3. If any hard rule is violated, regenerate the offending sentence with
   the rule attached
4. Repeat until clean
5. Open the PR

Expect 2-3 regeneration rounds per article. It's the right cost for
not sounding like a bot.
