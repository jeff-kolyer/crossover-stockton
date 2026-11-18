import { test, expect } from '@playwright/test';

test('pathway tracker loads Help Today in live mode and fits the viewport', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page).toHaveTitle('CROSSOVER STOCKTON — Pathway Tracker');
  await expect(page.locator('#stat-established')).toHaveText('0');
  await expect(page.locator('#stat-enabling')).toHaveText('2');
  await expect(page.locator('#stat-blocked')).toHaveText('2');
  await expect(page.locator('#view-help')).toBeVisible();

  const width = testInfo.project.use.viewport!.width;
  const size = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth
  }));
  expect(size.scroll, `Page overflows at ${width}px`).toBeLessThanOrEqual(size.viewport + 1);

  if ([1440, 375, 280].includes(width)) {
    await page.screenshot({ path: `test-results/screenshots/pathway-help-${width}.png`, fullPage: true });
  }
});

test('all four workspace views are reachable in live mode without preview controls', async ({ page }, testInfo) => {
  await page.goto('/');
  const isMobile = testInfo.project.use.viewport!.width < 1024;

  const switchView = async (view: 'help' | 'board' | 'tasks' | 'evidence') => {
    const selector = isMobile ? `[data-mob-tab="${view}"]` : `#left-sidebar [data-view-btn="${view}"]`;
    await page.locator(selector).click();
    await expect(page.locator(`#view-${view}`)).toBeVisible();
  };

  await switchView('board');
  await expect(page.locator('#pw-pill-enabling')).toHaveText('2');
  await expect(page.locator('#pw-pill-blocked')).toHaveText('2');

  await switchView('tasks');
  await expect(page.locator('#view-tasks')).toContainText('PW-01');

  await switchView('evidence');
  await expect(page.locator('#view-evidence')).toContainText('EV-01');

  await switchView('help');
  await expect(page.locator('#help-preview-toggle')).toHaveCount(0);
  await expect(page.locator('#stat-established')).toHaveText('0');
  await expect(page.locator('#view-help')).toContainText('No established pathways today.');
});

test('pathway drawer, about drawer, and new pathway modal open and close cleanly', async ({ page }) => {
  await page.goto('/');

  // Open pathway drawer from board
  await page.locator('#top-count-blocked-btn').click();
  await expect(page.locator('#view-board')).toBeVisible();
  await page.locator('#view-board :text("Same-week intake dog walking & Doggie Day Out"):visible').first().click();
  await expect(page.locator('#pathway-drawer')).toBeVisible();
  await expect(page.locator('#pathway-drawer')).toContainText('Same-week intake dog walking & Doggie Day Out');
  await page.keyboard.press('Escape');
  await expect(page.locator('#pathway-drawer')).toBeHidden();

  // Open About & Methodology drawer
  await page.getByRole('button', { name: 'About and Methodology' }).click();
  await expect(page.locator('#about-drawer')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#about-drawer')).toBeHidden();

  // Open New Pathway modal
  await page.locator('header').getByRole('button', { name: /New/ }).click();
  await expect(page.locator('#new-pathway-modal')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#new-pathway-modal')).toBeHidden();
});
