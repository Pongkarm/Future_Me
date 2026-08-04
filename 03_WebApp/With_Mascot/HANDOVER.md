# Handover — 2 August 2026

Where the work stopped, what state it is in, and what to pick up next.

**Everything below is verified, not asserted.** The numbers are from the last
run before writing this.

---

## 1. Verified state

```
npm run verify                                    PASS
  sync-mascot --check · typecheck · lint · 304 unit tests · build

npx playwright test e2e/journey.spec.ts           PASS  20/20   (flag off)

NEXT_PUBLIC_CHAT_ASSESSMENT=1 npm run build
npx playwright test e2e/chat-journey.spec.ts      PASS  15/15   (flag on)
```

Baseline when this work began was 244 unit tests. It is now **304**, and none of
the original tests were changed to make new work pass.

The dev server is stopped. `.env.local` is present and holds
`NEXT_PUBLIC_CHAT_ASSESSMENT=1`, so `npm run dev` resumes straight into the
conversational flow. Delete that file to get the original step-based one back.

---

## 2. Where things are

| Path | What it is |
|---|---|
| `03_WebApp/Pre_Present/` | The original app. **Untouched all session.** |
| `03_WebApp/With_Mascot/` | The working copy. All changes are here. |
| `03_WebApp/With_Mascot/backup_questionnaire_before_chat_redesign/` | Frozen copy of the questionnaire before the redesign, with restore instructions |
| `03_WebApp/With_Mascot/conversational_questionnaire/` | The chat assessment: components, hooks, lib, types, 8 design docs |
| `04_Design/FutureMe_Mascot_Lab/` | The Buddy character: `index.html` lab, source, 23 exported SVGs, spec |

---

## 3. What was built, in order

### a. Buddy mascot system — `04_Design/FutureMe_Mascot_Lab/`
Character drawn as layered SVG from the reference renders: 5 emotions, 9 poses,
4 turnaround views, light/dark, motion controls. `mascot.js` + `mascot.css` are
the portable unit; `tools/export-assets.js` writes 23 standalone SVGs.

### b. Buddy in the app
`lib/mascot/`, `components/mascot/FutureMeMascot.tsx`, `public/mascot/*.svg`.
`scripts/sync-mascot.mjs --check` runs inside `npm run verify` and fails the
build if the app's copy drifts from the design lab.

### c. Conversational questionnaire — behind `NEXT_PUBLIC_CHAT_ASSESSMENT`
One question per chat message, quick replies, back/edit, review, resume after
refresh, TH/EN, light/dark, keyboard-only. Pure reducer in
`conversation-machine.ts`; the UI is thin on top of it.

### d. Landing page and two form lengths
Landing leads with the Buddy and offers **quick (18)** or **full (30)**. The
three explanatory cards and the honest-limitations card moved to
`/how-it-works`.

### e. Result framework
`ConversationResult.tsx` — the six-dimension profile, what the result rests on,
the thin-evidence case, a four-step path forward, and the limits.

---

## 4. Decisions worth knowing before touching this

**The short form is 18 items, not 15.** 15 does not divide by six, so three
RIASEC dimensions would get three items and three would get two. Dimension
scores are *means*, so the two-item dimensions would be noisier — and since the
engine picks top dimensions and gates on the spread between them, a dimension
could reach the top on two lucky answers. `tests/unit/forms.test.ts` fails if
the balance breaks. Changing it to 15 is one number in `lib/forms.ts` and that
test going red.

**The completeness gate is a ratio, not a count.** `MIN_INTEREST_RATIO = 0.75`
applied to the form actually taken (`minAnswersFor`). Before this, a short form
could never clear a gate derived from the 30-item bank — the learner would
answer everything and still be told there was not enough evidence.

**Answers are stored raw.** `applyDirection` runs inside the engine. Storing a
reflected value would double-apply it the day a reverse-keyed item is added, and
the bank has none today, so the bug would ship silently.

**The Buddy never characterises the learner before the result.**
`tests/unit/buddy-script.test.ts` blocks RIASEC dimension names, career nouns
and evaluative praise from every pre-result line, in both languages.

**Item order is never regrouped.** The bank is interleaved on purpose
(`meta.itemOrderRationale`, citing O*NET on response bias). The short form is
the full form with items removed, not a resequenced questionnaire.

---

## 5. Bugs found and fixed this session

Recorded because each one was invisible until something specific caught it.

| Bug | How it surfaced | Fix |
|---|---|---|
| Delete-my-data left the chat transcript in storage | Noticed while resetting; flagged in the migration doc and then forgotten in Phase F | `/privacy` now clears both keys and names both |
| Tailwind purged every class used only in the new folder | User bubbles rendered left-aligned; class present, no CSS behind it | Added the folder to `content` in `tailwind.config.ts` |
| `ackKeyFor` returned the same line every time | A rotation test caught it the moment ack frequency changed to 1-in-4 | Rotate on acknowledgements spoken, not step index |
| A 25 % dimension labelled "STRONGEST" | Visible in the result screenshot | `topDimensions` is a ranking, not a claim; badge now respects `FLAT_PROFILE_SPREAD` |
| Two Next servers fighting over `.next` | `ENOENT … pages/_document.js` | Kill both ports before deleting `.next` |
| SVG `transform` attribute replaced by CSS `transform` | Mascot limbs flew off-canvas | Placement and animation on separate groups |

---

## 6. Running it

```bash
cd 03_WebApp/With_Mascot

# original step-based flow
npm run dev

# conversational flow
echo 'NEXT_PUBLIC_CHAT_ASSESSMENT=1' > .env.local
npm run dev                       # http://localhost:3000
```

The Buddy design lab needs no server — open
`04_Design/FutureMe_Mascot_Lab/index.html`.

**Two traps when testing:**

1. `playwright.config.ts` runs `npm run start`, not `dev`. **Build first**, or
   the suite tests a stale bundle.
2. `NEXT_PUBLIC_*` is inlined at build time, so one build ships one flow. The
   chat e2e needs a flag-on build; it skips itself otherwise.
3. Kill anything on ports 3000 and 3100 before `rm -rf .next`.

---

## 7. Not done

- **Phase 5 of the integration plan** — no rollout flag decision, no production
  deploy path. The feature flag exists; whether it defaults on is unmade.
- **`/how-it-works` has no e2e** — covered only by the build.
- **Switching form length mid-assessment** gives no warning that the question
  count changes while existing answers stay.
- **The transcript grows unbounded** — ~38 bubbles after 30 questions. "Review
  my answers" covers the need to look back, but collapsing old exchanges was
  discussed and not built.
- **The result does not name the recommended routes.** Deliberate: `/routes`
  shows them with full evidence, and naming them before the mission is done
  would read as a conclusion while the evidence is still "limited".
- **No follow-up questions** (`affectsResult: false`). The types support them;
  no such item exists yet.

---

## 8. Suggested next steps

1. Decide the short form's number — keep 18, or accept the imbalance for 15.
2. Decide whether the chat flow becomes the default, and add e2e for
   `/how-it-works`.
3. Warn on mid-assessment form switching.
4. Real-device pass on the chat flow — it has only been checked at 390 px in
   Chromium, never on hardware.
5. If the mascot moves to Rive or 3D, `04_Design/FutureMe_Mascot_Lab/docs/production-plan.md`
   has the conditions and the migration path.
