import { test, expect } from '@playwright/test';

test('pathway tracker loads Help Today in live mode and fits the viewport', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page).toHaveTitle('CROSSOVER STOCKTON — Pathway Tracker');
  await expect(page.locator('header')).toContainText('CROSSOVER');
  await expect(page.locator('#chapter-btn')).toHaveCount(0);
  if (testInfo.project.use.viewport!.width >= 1024) {
    await expect(page.locator('#left-sidebar')).toContainText('Stockton, CA');
  } else {
    await expect(page.locator('#mobile-sidebar')).toContainText('Stockton, CA');
  }
  await expect(page.locator('#stat-established')).toHaveText('0');
  await expect(page.locator('#stat-enabling')).toHaveText('1');
  await expect(page.locator('#stat-blocked')).toHaveText('0');
  await expect(page.locator('#view-help')).toBeVisible();

  const width = testInfo.project.use.viewport!.width;
  const size = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth
  }));
  expect(size.scroll, `Page overflows at ${width}px`).toBeLessThanOrEqual(size.viewport + 1);

  if (width >= 375 && width < 1024) {
    const barFit = await page.evaluate(() => {
      const bar = document.getElementById('mobile-shortcut-bar');
      return bar ? { scroll: bar.scrollWidth, client: bar.clientWidth } : null;
    });
    expect(barFit).not.toBeNull();
    expect(barFit!.scroll, `Shortcut bar clips at ${width}px`).toBeLessThanOrEqual(barFit!.client + 1);
  }

  if ([1440, 375, 280].includes(width)) {
    await page.screenshot({ path: `test-results/screenshots/pathway-help-${width}.png`, fullPage: true });
  }
});

test('all four workspace views use authoritative records in live mode without preview controls', async ({ page }, testInfo) => {
  await page.goto('/');
  const isMobile = testInfo.project.use.viewport!.width < 1024;

  const switchView = async (view: 'help' | 'board' | 'tasks' | 'evidence') => {
    const selector = isMobile ? `[data-mob-tab="${view}"]` : `#left-sidebar [data-view-btn="${view}"]`;
    await page.locator(selector).click();
    await expect(page.locator(`#view-${view}`)).toBeVisible();
  };

  await switchView('board');
  await expect(page.locator('#pw-pill-exploring')).toHaveText('2');
  await expect(page.locator('#pw-pill-enabling')).toHaveText('1');
  await expect(page.locator('#pw-pill-blocked')).toHaveText('0');
  await expect(page.locator('#view-board')).toContainText('Direct kibble & clean water drop-off for street dogs');

  await switchView('tasks');
  await expect(page.locator('#view-tasks')).toContainText('WORK-2026-005');
  await expect(page.locator('#view-tasks')).toContainText('WORK-2026-002');
  await expect(page.locator('#view-tasks')).toContainText('WORK-2026-001');

  await switchView('evidence');
  await expect(page.locator('#view-evidence')).toContainText('SHEL-2024-001');
  await expect(page.locator('#view-evidence')).toContainText('CPRA-2026-001-RECEIPT');

  await switchView('help');
  await expect(page.locator('#help-preview-toggle')).toHaveCount(0);
  await expect(page.locator('#stat-established')).toHaveText('0');
  await expect(page.locator('#view-help')).toContainText('No established pathways today.');
});

test('pathway drawer, task detail drawer, and about drawer open and close cleanly without create buttons', async ({ page }, testInfo) => {
  await page.goto('/');

  // Verify create controls are hidden
  await expect(page.locator('header').getByRole('button', { name: /New/ })).toHaveCount(0);
  await expect(page.locator('#quick-task-input')).toHaveCount(0);

  // Open pathway drawer from board using shortcut pill
  await page.locator('button:visible', { hasText: /En:|Enabling/ }).first().click();
  await page.locator('#view-board').getByRole('button', { name: 'Reset' }).click();
  await expect(page.locator('#view-board')).toBeVisible();
  await page.locator('#view-board :text("Volunteer at Stockton Animal Services"):visible').first().click();
  await expect(page.locator('#pathway-drawer')).toBeVisible();
  await expect(page.locator('#pathway-drawer')).toContainText('WORK-2026-005');
  await expect(page.locator('#pathway-drawer')).toContainText('FLD-2026-002');
  await page.keyboard.press('Escape');
  await expect(page.locator('#pathway-drawer')).toBeHidden();

  // Open task detail drawer by clicking a task in Tasks & Checklists
  const isMobile = testInfo.project.use.viewport!.width < 1024;
  const tasksNav = isMobile ? '[data-mob-tab="tasks"]' : '#left-sidebar [data-view-btn="tasks"]';
  await page.locator(tasksNav).click();
  await expect(page.locator('#view-tasks')).toBeVisible();
  await page.locator('#view-tasks :text("WORK-2026-005"):visible').first().click();
  await expect(page.locator('#task-drawer')).toBeVisible();
  await expect(page.locator('#task-drawer')).toContainText('Objective & Instructions');
  await expect(page.locator('#task-drawer')).toContainText('Basis & Supporting Records');
  await page.keyboard.press('Escape');
  await expect(page.locator('#task-drawer')).toBeHidden();

  // Open About & Methodology drawer from mobile menu (mobile) or left sidebar (desktop)
  await expect(page.locator('header').getByRole('button', { name: 'About and Methodology' })).toHaveCount(0);
  await expect(page.locator('nav[aria-label="Mobile Navigation"] button:has-text("About")')).toHaveCount(0);
  if (isMobile) {
    await page.locator('header button[aria-label="Toggle navigation"]').click();
    await page.locator('#mobile-sidebar button:has-text("About")').click();
  } else {
    await page.locator('#left-sidebar button:has-text("About")').click();
  }
  await expect(page.locator('#about-drawer')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#about-drawer')).toBeHidden();

  // Toggle dark/light theme from header sun/moon button
  const themeBtn = page.locator('#theme-toggle-btn');
  await expect(themeBtn).toBeVisible();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await themeBtn.click();
  await expect(page.locator('html')).not.toHaveClass(/dark/);
  await themeBtn.click();
  await expect(page.locator('html')).toHaveClass(/dark/);
});
