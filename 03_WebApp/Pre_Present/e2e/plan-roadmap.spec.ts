import { expect, test, type Page } from "@playwright/test";
import { completeInterview, completeMission } from "./helpers/journey";

/**
 * The plan reached the way a learner reaches it, rather than by seeding storage:
 * the roadmap is drawn from whichever route the engine actually selected, and a
 * hand-written session would not prove that path still works.
 */
async function reachPlan(page: Page) {
  await completeInterview(page);
  await page.getByTestId("interview-continue").click();
  await completeMission(page);

  await expect(page).toHaveURL(/\/routes/);
  await page.locator('[data-testid^="select-"]').first().click();
  await page.locator('[data-testid^="plan-"]').first().click();
  await expect(page).toHaveURL(/\/plan/);
  await expect(page.getByTestId("plan-heading")).toBeVisible();
}

test("the plan is drawn as a roadmap with one numbered stop per week", async ({ page }) => {
  await reachPlan(page);

  const roadmap = page.getByTestId("plan-roadmap");
  await expect(roadmap).toBeVisible();

  const stops = page.locator('[data-testid^="roadmap-stop-"]');
  await expect(stops).toHaveCount(4);

  // The stops carry the plan's order, not the layout's.
  for (let week = 1; week <= 4; week += 1) {
    await expect(page.getByTestId(`roadmap-stop-${week}`)).toBeVisible();
  }
  await expect(roadmap).toContainText("WEEK 1");
  await expect(roadmap).toContainText("WEEK 4");
});

test("a stop turns complete only when every task in it is ticked", async ({ page }) => {
  await reachPlan(page);

  const stop = page.getByTestId("roadmap-stop-1");
  await expect(stop).toHaveAttribute("data-complete", "false");

  const tasks = stop.locator('input[type="checkbox"]');
  const count = await tasks.count();
  expect(count).toBeGreaterThan(1);

  // All but one: still incomplete, because a partly done week is not done.
  for (let i = 0; i < count - 1; i += 1) await tasks.nth(i).check();
  await expect(stop).toHaveAttribute("data-complete", "false");

  await tasks.nth(count - 1).check();
  await expect(stop).toHaveAttribute("data-complete", "true");
  await expect(stop).toContainText("All tasks ticked");

  // Unticking one takes it back, rather than latching on first completion.
  await tasks.nth(0).uncheck();
  await expect(stop).toHaveAttribute("data-complete", "false");
});

test("ticking a task still saves across a reload", async ({ page }) => {
  await reachPlan(page);

  const stop = page.getByTestId("roadmap-stop-1");
  const first = stop.locator('input[type="checkbox"]').first();
  await first.check();

  await page.reload();

  await expect(page.getByTestId("roadmap-stop-1").locator('input[type="checkbox"]').first())
    .toBeChecked();
});

test("the overall progress bar still tracks the ticked tasks", async ({ page }) => {
  await reachPlan(page);

  const bar = page.getByRole("progressbar");
  await expect(bar).toHaveAttribute("aria-valuenow", "0");

  await page.getByTestId("roadmap-stop-1").locator('input[type="checkbox"]').first().check();

  await expect(bar).not.toHaveAttribute("aria-valuenow", "0");
});

test("the roadmap fits a phone without scrolling sideways", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await reachPlan(page);

  await expect(page.getByTestId("plan-roadmap")).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test("the roadmap reads in Thai", async ({ page }) => {
  await reachPlan(page);
  await page.getByRole("radio", { name: "ไทย" }).click();

  await expect(page.getByTestId("plan-roadmap")).toContainText("สัปดาห์ที่ 1");
  await expect(page.getByTestId("plan-roadmap")).toContainText("สัปดาห์ที่ 4");
});
