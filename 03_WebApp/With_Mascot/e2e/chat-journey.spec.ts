import { expect, test } from "@playwright/test";
import questions from "../data/questions.json";

/**
 * End-to-end coverage for the conversational assessment.
 *
 * Requires a build with the flag on, because `NEXT_PUBLIC_CHAT_ASSESSMENT` is
 * inlined at build time:
 *
 *     NEXT_PUBLIC_CHAT_ASSESSMENT=1 npm run build
 *     npx playwright test e2e/chat-journey.spec.ts
 *
 * The suite skips itself when the chat flow is not the one that shipped, so a
 * default build can run the whole e2e directory without false failures.
 */

const INTEREST = questions.interest.map((q) => q.id);
const CONTEXT_REQUIRED = questions.context.filter((q) => q.required);

async function openChat(page: import("@playwright/test").Page) {
  await page.goto("/interview");
  const consent = page.getByTestId("chat-consent");
  if ((await consent.count()) === 0) return false;
  await consent.click();
  return true;
}

test.describe("conversational assessment", () => {
  test("opens on the notice, then asks one question at a time", async ({ page }) => {
    await page.goto("/interview");
    test.skip((await page.getByTestId("chat-consent").count()) === 0, "chat flow not built");

    // The conversation starts here — no welcome step ahead of it.
    await expect(page.getByTestId("chat-start")).toHaveCount(0);

    // Consent states storage and the validation limit before any question.
    await expect(page.getByText(/stay in this browser/i)).toBeVisible();
    await expect(page.getByText(/not a validated test/i)).toBeVisible();
    await page.getByTestId("chat-consent").click();

    // Exactly one question's replies are on screen.
    await expect(page.getByTestId(`q-${INTEREST[0]}-3`)).toBeVisible();
    await expect(page.getByTestId(`q-${INTEREST[1]}-3`)).toHaveCount(0);
  });

  test("records an answer, echoes it, and moves on", async ({ page }) => {
    test.skip(!(await openChat(page)), "chat flow not built");

    await page.getByTestId(`q-${INTEREST[0]}-4`).click();
    await expect(page.getByTestId(`q-${INTEREST[1]}-3`)).toBeVisible();

    const stored = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("futureme.guest.v1") ?? "{}"),
    );
    expect(stored.interview.interest[INTEREST[0]]).toBe(4);
  });

  test("resumes where the learner stopped after a refresh", async ({ page }) => {
    test.skip(!(await openChat(page)), "chat flow not built");

    for (let i = 0; i < 5; i += 1) {
      await page.getByTestId(`q-${INTEREST[i]}-4`).click();
    }
    await page.reload();

    // Straight back into the questions, at the sixth one — no welcome screen.
    await expect(page.getByTestId(`q-${INTEREST[5]}-3`)).toBeVisible();
    await expect(page.getByTestId("chat-start")).toHaveCount(0);
  });

  test("goes back and changes an answer", async ({ page }) => {
    test.skip(!(await openChat(page)), "chat flow not built");

    await page.getByTestId(`q-${INTEREST[0]}-1`).click();
    await page.getByTestId(`q-${INTEREST[1]}-3`).click();
    await page.getByRole("button", { name: /back/i }).click();
    await page.getByRole("button", { name: /back/i }).click();

    await page.getByTestId(`q-${INTEREST[0]}-5`).click();
    const stored = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("futureme.guest.v1") ?? "{}"),
    );
    expect(stored.interview.interest[INTEREST[0]]).toBe(5);
  });

  test("switching language keeps every answer", async ({ page }) => {
    test.skip(!(await openChat(page)), "chat flow not built");

    for (let i = 0; i < 3; i += 1) {
      await page.getByTestId(`q-${INTEREST[i]}-4`).click();
    }
    // The language control is a radiogroup, not buttons — query it by its id.
    await page.getByTestId("lang-th").click();

    const stored = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("futureme.guest.v1") ?? "{}"),
    );
    expect(Object.keys(stored.interview.interest)).toHaveLength(3);
    await expect(page.getByTestId(`q-${INTEREST[3]}-3`)).toBeVisible();
  });

  test("review lists the answers and refuses to submit below the evidence gate", async ({
    page,
  }) => {
    test.skip(!(await openChat(page)), "chat flow not built");

    await page.getByTestId(`q-${INTEREST[0]}-4`).click();
    await page.getByRole("button", { name: /review my answers/i }).click();

    await expect(page.getByTestId(`review-${INTEREST[0]}`)).toBeVisible();
    // Too little evidence: the Buddy offers to finish, not to submit.
    await expect(page.getByTestId("chat-finish-missing")).toBeVisible();
    await expect(page.getByTestId("chat-submit")).toHaveCount(0);
  });

  test("a full run reaches the result and hands over to the mission", async ({ page }) => {
    test.skip(!(await openChat(page)), "chat flow not built");
    test.slow();

    for (const id of INTEREST) {
      await page.getByTestId(`q-${id}-4`).click();
    }
    for (const q of CONTEXT_REQUIRED) {
      const value = q.options?.[0].value;
      await page.getByTestId(`ctx-${q.id}-${value}`).click();
    }

    await page.getByRole("button", { name: /review my answers/i }).click();
    await page.getByTestId("chat-submit").click();

    // The result is a framework, not a receipt: it must say what the answers
    // lean toward, what that rests on, and where to go next.
    await expect(page.getByText(/what your answers lean toward/i)).toBeVisible();
    await expect(page.getByText(/what this rests on/i)).toBeVisible();
    await expect(page.getByText(/where to go from here/i)).toBeVisible();
    await expect(page.getByText(/what this cannot tell you/i)).toBeVisible();

    // Every RIASEC dimension is reported, not only the winners.
    await expect(page.getByRole("progressbar")).toHaveCount(6);

    // Step 1 is the mission, because no task has been tried yet.
    await expect(page.getByText(/no task tried yet/i)).toBeVisible();
    await page.getByTestId("interview-continue").click();
    await expect(page).toHaveURL(/\/mission/);
  });

  test("a thin profile is reported as a finding, not hidden", async ({ page }) => {
    test.skip(!(await openChat(page)), "chat flow not built");
    test.slow();

    // Same answer to everything: enough questions answered, no differentiation.
    for (const id of INTEREST) await page.getByTestId(`q-${id}-3`).click();
    for (const q of CONTEXT_REQUIRED) {
      await page.getByTestId(`ctx-${q.id}-${q.options?.[0].value}`).click();
    }
    await page.getByRole("button", { name: /review my answers/i }).click();
    await page.getByTestId("chat-submit").click();

    await expect(page.getByText(/not enough to suggest routes yet/i)).toBeVisible();
    // And it says what to do about it rather than stopping.
    await expect(page.getByTestId("result-fix")).toBeVisible();
  });

  test("deleting clears both the answers and the transcript", async ({ page }) => {
    test.skip(!(await openChat(page)), "chat flow not built");

    await page.getByTestId(`q-${INTEREST[0]}-4`).click();
    await page.getByRole("button", { name: /review my answers/i }).click();

    page.once("dialog", (d) => d.accept());
    await page.getByTestId("chat-delete").click();

    const storage = await page.evaluate(() => ({
      session: JSON.parse(localStorage.getItem("futureme.guest.v1") ?? "{}"),
      chat: localStorage.getItem("futureme.chat.v1"),
    }));
    expect(Object.keys(storage.session.interview?.interest ?? {})).toHaveLength(0);
    expect(storage.chat === null || !storage.chat.includes(INTEREST[0])).toBe(true);
  });

  test("a corrupt transcript is rebuilt without losing answers", async ({ page }) => {
    test.skip(!(await openChat(page)), "chat flow not built");

    await page.getByTestId(`q-${INTEREST[0]}-4`).click();
    await page.getByTestId(`q-${INTEREST[1]}-2`).click();

    await page.evaluate(() => localStorage.setItem("futureme.chat.v1", "{ not json"));
    await page.reload();

    // The answers survive; the conversation simply starts again from them.
    await expect(page.getByTestId(`q-${INTEREST[2]}-3`)).toBeVisible();
    const stored = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("futureme.guest.v1") ?? "{}"),
    );
    expect(stored.interview.interest[INTEREST[0]]).toBe(4);
    expect(stored.interview.interest[INTEREST[1]]).toBe(2);
  });

  test("is answerable with the keyboard alone", async ({ page }) => {
    test.skip(!(await openChat(page)), "chat flow not built");

    const group = page.getByRole("radiogroup").last();
    await group.getByRole("radio").first().focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");

    const stored = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("futureme.guest.v1") ?? "{}"),
    );
    expect(stored.interview.interest[INTEREST[0]]).toBe(3);
  });

  test("number keys answer without touching the pointer", async ({ page }) => {
    test.skip(!(await openChat(page)), "chat flow not built");

    // Thirty questions is thirty pointer trips otherwise.
    await page.keyboard.press("4");
    await expect(page.getByTestId(`q-${INTEREST[1]}-3`)).toBeVisible();
    await page.keyboard.press("1");
    await expect(page.getByTestId(`q-${INTEREST[2]}-3`)).toBeVisible();

    const stored = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("futureme.guest.v1") ?? "{}"),
    );
    expect(stored.interview.interest[INTEREST[0]]).toBe(4);
    expect(stored.interview.interest[INTEREST[1]]).toBe(1);
  });

  test("number keys do not fire while typing free text", async ({ page }) => {
    test.skip(!(await openChat(page)), "chat flow not built");

    for (const id of INTEREST) await page.getByTestId(`q-${id}-4`).click();
    for (const q of CONTEXT_REQUIRED) {
      await page.getByTestId(`ctx-${q.id}-${q.options?.[0].value}`).click();
    }

    const textbox = page.getByTestId("text-proud");
    await textbox.click();
    await textbox.fill("I fixed a bike in 3 hours");
    // The digit landed in the field rather than answering something.
    await expect(textbox).toHaveValue("I fixed a bike in 3 hours");
  });

  test("the next question is answerable immediately, with no forced pause", async ({ page }) => {
    test.skip(!(await openChat(page)), "chat flow not built");

    const started = Date.now();
    for (let i = 0; i < 5; i += 1) {
      await page.getByTestId(`q-${INTEREST[i]}-4`).click();
    }
    await expect(page.getByTestId(`q-${INTEREST[5]}-3`)).toBeVisible();
    // Five answers used to cost ~1.9s of typing indicator on their own.
    expect(Date.now() - started).toBeLessThan(2500);
  });

  test("fits a 390px screen without horizontal scrolling", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    test.skip(!(await openChat(page)), "chat flow not built");

    await page.getByTestId(`q-${INTEREST[0]}-4`).click();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(overflow).toBe(false);

    // Tap targets stay comfortably large on a phone.
    const box = await page.getByTestId(`q-${INTEREST[1]}-3`).boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(48);
  });
});
