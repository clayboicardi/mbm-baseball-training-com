# Myles Content Roadmap — Creative Workstreams (specs)

Source material: `docs/content/myles-coaching-source.md` (derived from ~10 min of real
coaching audio). These are the top-3 creative workstreams beyond the voice guide /
methodology / pull-quotes already built. Ranked by leverage.

Shared gates (apply to all three): see the source kit's ⚠️ Gates — **minors named**
(consent for any public audio/naming), **direct quotes need Myles sign-off**, and
**scope = pitching** (don't let pitching-specific proof bleed into hitting/fielding claims).

---

## Spec 1 — Pitch-Design Content Engine (5 SEO posts) — HIGHEST LEVERAGE

**Goal:** Turn 10 min of audio into 5 evergreen pages that rank for real search intent and
prove first-hand expertise (E-E-A-T). Compounding organic traffic → booked free lessons.

**Why #1:** Lowest cost-per-asset (source already exists), and the only option here that
*compounds* — pages keep earning traffic. Directly reinforces the "Experience" signal the
old anonymous site lacked.

**Deliverable:** 5 articles, one per pitch (fastball, two-seam, changeup, cutter, knuckle
curve), each targeting a long-tail query (e.g. "knuckle curve grip for youth", "two-seam
grip for more run", "cutter vs slider for kids").

**Per-post structure (~400–700 words):**
- H1 = the pitch.
- The cue, in his voice (from `pitching.json`).
- What it does + when to throw it.
- How Myles teaches it (grip / arm action / intent).
- The common flaw he fixes (e.g. double-clutch, aiming it).
- CTA → free first lesson.

**Repo/stack shape:**
- `src/content/pitches/*.md` via Astro **content collections** (one-time infra: `src/content.config.ts`).
- Renderer `src/pages/pitching/[slug].astro` + an index at `src/pages/pitching/index.astro`.
- Recommended URL cluster: `/pitching/cutter`, `/pitching/knuckle-curve`, … (topical SEO).
- Add a nav/footer link; Astro sitemap auto-includes the new routes.
- Promotes the §2 methodology component into a real `/pitching` hub (see its wiring note).

**Gates/deps:** confirm cues w/ Myles; one-time content-collection setup; decide URL structure.

**Effort:** M — ~1–2 h infra once, then ~30–45 min/post drafting from the source kit.

**Success metric:** 5 indexed pages; impressions/clicks on pitch-grip long-tails; assisted bookings.

---

## Spec 2 — Proper Testimonial Harvest — CLOSES THE SOCIAL-PROOF GAP

**Goal:** Convert the real client families the audio *surfaced* (Axel, Theo, Max + parents)
into written testimonials with results, then feed the `Review` / `AggregateRating` schema
already built into `Proof.astro`.

**Why #2:** The site's biggest credibility gap is genuine social proof. The audio is
*expertise*-proof, not social proof — but it's effectively a warm lead list. Highest
trust-per-effort once collected; unlocks the AggregateRating rich result.

**Deliverable:** 3–6 written testimonials (name or initial + age + specific result), parent
consent captured, wired into the testimonials data → live, valid Review JSON-LD.

**Process:**
1. Myles asks the 3 families (he owns the relationship — not us).
2. Short structured prompt: "What changed? One specific result?" (keeps them concrete.)
3. Capture **written consent**, especially for minors.
4. Add to the testimonials data source `Proof.astro` reads.
5. Validate Review/AggregateRating in Google Rich Results Test.

**Gates/deps:** Myles outreach + response time; written parent consent; honest attribution
(no fabrication). The GameChanger stat (96 for / 72 against, 19 games) can anchor **one**
results story **only if** those are his players and he'll attribute it.

**Effort:** S to build / M on the calendar (gated on family responses).

**Success metric:** ≥3 verifiable testimonials live; AggregateRating eligible in Rich Results.

---

## Spec 3 — "5-Pitch Arsenal" Lead Magnet — FUNNEL CAPTURE

**Goal:** Capture leads who aren't ready to book — a branded opt-in one-pager
("Coach Myles's 5-Pitch Arsenal: grips & cues") in exchange for email/phone → nurture
toward the free first lesson.

**Why #3:** Monetizes the top-of-funnel traffic Spec 1 drives, and leans on the existing
free-first-lesson hook. Ranked below 1–2 because its value *depends on* traffic (Spec 1)
and proof (Spec 2) existing first.

**Deliverable:** 1–2 page branded PDF + a capture form + a CTA block/section.

**Structure:** the 5 pitches, his cue per pitch, one mechanics tip each, brand styling,
single CTA (book free lesson). Reuses `pitching.json` — no new content needed.

**Repo/stack:** PDF in `public/`; capture via **Tally** (already in the stack —
`site.json booking.tallyEliteEmbed`); a CTA block linking/gating the download.

**Gates/deps:** Myles confirms cues + OK to publish a downloadable; decide delivery
(instant download vs email-gated); brand assets (already have them).

**Effort:** S–M — PDF design + form wiring.

**Success metric:** opt-in conversion rate; opt-ins → booked free lessons.

---

### Leverage ranking rationale
1 (content engine) compounds and is cheapest per asset → top. 2 (testimonials) closes the
single biggest trust gap and uses warm leads, but is calendar-gated on families. 3 (lead
magnet) is real but *downstream* — it needs 1's traffic and 2's proof to be worth most.

---

## CONTENT LOCK UPDATE (2026-06-05 — Myles confirmed)

- **Spec 1 (pitch posts) — DO NOT PUBLISH YET.** Myles confirmed the per-pitch cues from the
  source audio were individualized to one specific pitcher, NOT his universal teaching:
  "different pitchers master different styles, use different techniques, and receive different
  coaching." The 5 posts are written prescriptively, so they stay `draft: true` until Myles
  gives a generalizable per-pitch approach OR we reframe them as explicitly illustrative /
  case-study content. Infra is live; publishing is gated on this.
- **Pitching philosophy (now live in `pitching.json` + the homepage section):** mental game
  FIRST (sports psychology) → mechanics/technique built on that foundation → tailored to each
  pitcher. Lead with this, not the arsenal.
- **Spec 2 (testimonials):** Myles is actively collecting from families ("working on it" as of
  2026-06-05). Still needed per family: the quote + written parent consent to use the kid's
  first name + age.
