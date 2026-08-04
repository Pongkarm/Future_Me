# Accessibility checklist

A chat transcript is a harder accessibility problem than a form: content arrives
over time, and the naive implementation re-announces everything on every render.

Every box must be ticked before the flag is turned on by default.

---

## 1. The live region

- [ ] Transcript container is `role="log"` `aria-live="polite"` `aria-relevant="additions"`
- [ ] **Only appended messages are announced.** Re-rendering the list (theme
      change, language switch, window resize) announces nothing.
- [ ] The mascot is rendered **outside** the live region. An animated SVG inside
      it re-triggers announcements on every frame that touches the DOM.
- [ ] The typing indicator is `aria-hidden` — announcing "typing" three times a
      question is noise, not information.
- [ ] Each message has a visually hidden speaker label ("Buddy said", "You
      answered") so the transcript is followable without visual grouping.

## 2. Quick replies

- [ ] `role="radiogroup"` with `aria-labelledby` pointing at the question message
- [ ] Radio semantics on each option, `aria-checked` reflecting selection
- [ ] Roving tabindex — the group is one tab stop
- [ ] Arrow Left/Right/Up/Down move; Home/End jump; arrows **clamp, not wrap**
      (matching the existing `LikertScale`, where wrapping meant pressing Left on
      "strongly dislike" selected "strongly like")
- [ ] Answering moves focus to the next question's group
- [ ] Superseded groups are removed from the tab order, not just visually dimmed
- [ ] Every option's meaning is readable without opening help text

## 3. Never colour alone

- [ ] Selected state carries **three** signals: a ring, a filled dot, and the
      answer echoed as text in the transcript
- [ ] The growing dot from the existing scale is preserved as the non-colour
      size signal
- [ ] Verified in greyscale
- [ ] Verified with a deuteranopia simulation
- [ ] The mascot face is decorative in every quick reply — `alt=""` **and**
      `aria-hidden`, so a reader that honours one still has the other

## 4. Progress

- [ ] Progress is text, not only a bar: "Interests · 12 of 30"
- [ ] Bar has `role="progressbar"` with `aria-valuenow/min/max` and a label
- [ ] Progress changes are **not** in the live region — they would interrupt the
      question being read
- [ ] Stage changes are announced once, as a message

## 5. Keyboard

- [ ] The whole assessment is completable with keyboard alone
- [ ] Focus is visible on every interactive element, using the existing
      `:focus-visible` ring from `globals.css`
- [ ] Back, Restart, Delete and Review are reachable without passing through
      every prior message
- [ ] Focus is never trapped in the scroll container
- [ ] Auto-scroll never steals focus

## 6. Reduced motion

Under `prefers-reduced-motion: reduce`:

- [ ] Typing indicator skipped entirely — the message appears at once
- [ ] Message entrance animation removed
- [ ] Auto-scroll jumps rather than smooth-scrolls
- [ ] Mascot idle motion stops (already handled by `mascot.css`)
- [ ] **Answering is not slower.** The existing `advanceDelay()` returns 0 under
      reduced motion; the chat must match. Reduced motion must not mean reduced
      speed.

## 7. Contrast

- [ ] Buddy bubble text ≥ 4.5:1 on `surface2`, both themes
- [ ] Learner bubble text ≥ 4.5:1 on `mint/10`, both themes
- [ ] Quick reply borders ≥ 3:1 against the background
- [ ] Focus ring ≥ 3:1 against both the control and the background
- [ ] Measured, not asserted — `globals.css` documents which tokens are safe for
      text and which are gradient-only (`indigo` is **not** a text colour;
      `indigoText` exists for that)

## 8. Screen reader passes

- [ ] VoiceOver + Safari: full run, answers land correctly
- [ ] NVDA + Firefox: full run
- [ ] Transcript readable from the top after completion
- [ ] Language switch mid-assessment: `<html lang>` updates and the reader
      changes voice

## 9. Validation and errors

- [ ] A required unanswered question is announced with what is missing, not just
      "invalid"
- [ ] Error messages are text, near the control, and in the live region
- [ ] Storage failure is announced once, not on every save attempt

## 10. Zoom and reflow

- [ ] 200 % zoom: no horizontal scrolling, nothing clipped
- [ ] 320 px viewport: quick replies stack, targets stay ≥ 48 px
- [ ] Text spacing overrides (WCAG 1.4.12) do not break bubbles

## 11. What the existing flow already gets right — keep it

- Focus moves into the new question's radiogroup after each transition, with a
  fallback to the question heading for steps that have no group.
- Arrow keys clamp at the ends.
- `motion-safe:` variants throughout, plus the global `!important`
  reduced-motion rule in `globals.css`.
- The interest scale never uses colour alone.

## 12. Known gap being fixed

The current step flow has **no `aria-live` announcement** on step change — it
relies on moving focus. That works for a form. A transcript needs a real live
region, which is why §1 is the longest section here.
