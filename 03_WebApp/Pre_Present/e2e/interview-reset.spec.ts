import { expect, test } from "@playwright/test";
import questions from "../data/questions.json";

const first = questions.interest[0];
const second = questions.interest[1];
const third = questions.interest[2];

/** Answer the question on screen and wait for the next one to arrive. */
async function answer(page: import("@playwright/test").Page, reply: string, nextId: string) {
  await page.getByTestId("assessment-reply").fill(reply);
  await page.getByTestId("assessment-send").click();
  await expect(page.getByTestId("interview-current-question")).toHaveAttribute(
    "data-question-id",
    nextId,
  );
}

test("the reset control is hidden until there is something to discard", async ({ page }) => {
  await page.goto("/interview");

  await expect(page.getByTestId("assessment-reset")).toHaveCount(0);

  await answer(page, "I love it", second.id);
  await expect(page.getByTestId("assessment-reset")).toBeVisible();
});

test("resetting asks first, and cancelling keeps every answer", async ({ page }) => {
  await page.goto("/interview");
  await answer(page, "I love it", second.id);
  await answer(page, "I dislike it", third.id);
  await expect(page.getByTestId("interview-message-user")).toHaveCount(2);

  await page.getByTestId("assessment-reset").click();

  // The prompt has to say what is about to be lost, before it is lost.
  const confirm = page.getByTestId("assessment-reset-confirm");
  await expect(confirm).toBeVisible();
  await expect(confirm).toHaveAttribute("role", "alertdialog");
  await expect(confirm).toContainText("cannot be undone");
  await expect(page.getByTestId("assessment-reset-confirm-yes")).toBeFocused();

  await page.getByTestId("assessment-reset-cancel").click();

  await expect(confirm).toHaveCount(0);
  await expect(page.getByTestId("interview-message-user")).toHaveCount(2);
  await expect(page.getByTestId("interview-current-question")).toHaveAttribute(
    "data-question-id",
    third.id,
  );
  // Focus returns to the control that opened the prompt, not to the page top.
  await expect(page.getByTestId("assessment-reset")).toBeFocused();
});

test("Escape backs out of the confirmation without discarding anything", async ({ page }) => {
  await page.goto("/interview");
  await answer(page, "I love it", second.id);

  await page.getByTestId("assessment-reset").click();
  await expect(page.getByTestId("assessment-reset-confirm")).toBeVisible();

  await page.keyboard.press("Escape");

  await expect(page.getByTestId("assessment-reset-confirm")).toHaveCount(0);
  await expect(page.getByTestId("interview-message-user")).toHaveCount(1);
  await expect(page.getByTestId("assessment-reset")).toBeFocused();
});

test("confirming clears the answers and returns to the first question", async ({ page }) => {
  await page.goto("/interview");
  await answer(page, "I love it", second.id);
  await answer(page, "I dislike it", third.id);

  await page.getByTestId("assessment-reset").click();
  await page.getByTestId("assessment-reset-confirm-yes").click();

  await expect(page.getByTestId("interview-current-question")).toHaveAttribute(
    "data-question-id",
    first.id,
  );
  await expect(page.getByTestId("interview-question-bubble")).toContainText(first.text.en);
  await expect(page.getByTestId("interview-message-user")).toHaveCount(0);
  await expect(page.getByTestId("assessment-reset-confirm")).toHaveCount(0);
  // Nothing left to discard, so the control stands down again.
  await expect(page.getByTestId("assessment-reset")).toHaveCount(0);
});

test("the cleared state survives a refresh rather than coming back", async ({ page }) => {
  await page.goto("/interview");
  await answer(page, "I love it", second.id);
  await answer(page, "I dislike it", third.id);

  await page.getByTestId("assessment-reset").click();
  await page.getByTestId("assessment-reset-confirm-yes").click();
  await expect(page.getByTestId("interview-message-user")).toHaveCount(0);

  await page.reload();

  await expect(page.getByTestId("interview-current-question")).toHaveAttribute(
    "data-question-id",
    first.id,
  );
  await expect(page.getByTestId("interview-message-user")).toHaveCount(0);

  const stored = await page.evaluate(() =>
    JSON.parse(window.localStorage.getItem("futureme.guest.v1") ?? "{}"),
  );
  expect(stored.interview.interest).toEqual({});
  expect(stored.interview.context).toEqual({});
});

test("the reset is announced rather than happening silently", async ({ page }) => {
  await page.goto("/interview");
  await answer(page, "I love it", second.id);

  await page.getByTestId("assessment-reset").click();
  await page.getByTestId("assessment-reset-confirm-yes").click();

  await expect(page.getByRole("status").filter({ hasText: "answers were cleared" })).toHaveCount(1);
});

test("the control is written in Thai when the learner reads Thai", async ({ page }) => {
  await page.goto("/interview");
  await page.getByRole("radio", { name: "ไทย" }).click();
  await answer(page, "ชอบ", second.id);

  await expect(page.getByTestId("assessment-reset")).toHaveText("เริ่มตอบใหม่");
  await page.getByTestId("assessment-reset").click();
  await expect(page.getByTestId("assessment-reset-confirm")).toContainText("กู้คืนไม่ได้");
  await expect(page.getByTestId("assessment-reset-confirm-yes")).toHaveText("ใช่ ลบคำตอบของฉัน");
});
