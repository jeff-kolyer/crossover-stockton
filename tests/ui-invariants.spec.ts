import { test, expect } from '@playwright/test';

test('pathway tracker loads Help Today by default, switches to Pathways with plain eyebrow, responsive layout, and saved choice', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Help Today · Crossover Stockton');
  await expect(page.locator('#page')).toContainText('No verified pathways today');
  await expect(page.locator('header')).toContainText('Crossover');
  await expect(page.locator('#chapter')).toBeVisible();
  await expect(page.locator('#chapter')).toContainText('Stockton, CA');
  await expect(page.locator('#find')).toBeVisible();
  await expect(page.locator('#menu')).toBeVisible();
  const menuBeforeBrand = await page.evaluate(() => {
    const m = document.querySelector('#menu svg')?.getBoundingClientRect();
    const b = document.querySelector('a.brand')?.getBoundingClientRect();
    return Boolean(m && b && m.right <= b.left);
  });
  expect(menuBeforeBrand).toBe(true);

  // Navigate to Pathways and verify eyebrow, description, and default layout
  await page.locator('#main-nav a[href="/pathways"]').click();
  await expect(page).toHaveURL(/\/pathways$/);
  await expect(page).toHaveTitle('Pathways · Crossover Stockton');

  // Plain SEE CLEARLY. ACT LOCALLY. eyebrow and updated description
  await expect(page.locator('.focus-line')).toHaveText('SEE CLEARLY. ACT LOCALLY.');
  await expect(page.locator('#workspace-title')).toHaveText('Pathway tracker');
  await expect(page.locator('.hero')).toContainText('How Crossover develops pathways to meet needs in Stockton.');

  // Four counted tabs
  await expect(page.locator('#main-nav')).toContainText('0');
  await expect(page.locator('#main-nav')).toContainText('3');
  await expect(page.locator('#main-nav')).toContainText('7');
  await expect(page.locator('#main-nav')).toContainText('53');

  // Normal page has no page-bar Back/Close strip
  await expect(page.locator('#page-bar')).toHaveCount(0);

  const width = testInfo.project.use.viewport!.width;
  if (width <= 700) {
    await expect(page.locator('.path-list .list-card').first()).toBeVisible();
  } else {
    await expect(page.locator('.board-col:visible')).toHaveCount(4);
  }

  // Switch layout to Cards, reload, and verify saved layout choice persists
  if (width <= 700) {
    await page.locator('[data-overlay="views"]').click();
    await expect(page.locator('#panel')).toBeVisible();
    await page.locator('#panel [data-view="cards"]').click();
  } else {
    await page.locator('.view-switch [data-view="cards"]').click();
  }
  await expect(page.locator('.card-grid .card').first()).toBeVisible();
  await page.reload();
  await expect(page.locator('.card-grid .card').first()).toBeVisible();

  const size = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth
  }));
  expect(size.scroll, `Page overflows at ${width}px`).toBeLessThanOrEqual(size.viewport + 1);

  const navFit = await page.evaluate(() => {
    const nav = document.getElementById('main-nav');
    if (!nav) return null;
    const items = Array.from(nav.querySelectorAll('.nav-item'));
    const clipped = items.some((el) => el.scrollWidth > el.clientWidth + 1);
    return { scroll: nav.scrollWidth, client: nav.clientWidth, clipped };
  });
  expect(navFit).not.toBeNull();
  expect(navFit!.scroll, `Main nav overflows at ${width}px`).toBeLessThanOrEqual(navFit!.client + 1);
  expect(navFit!.clipped, `Main nav item clipped at ${width}px`).toBe(false);
});

test('Evidence -> Menu -> About Back & Close preserve scroll and opener focus, and Help Today shows verified empty state', async ({ page }) => {
  await page.goto('/');

  // Help Today empty state
  await page.locator('#main-nav a[href="/help"]').click();
  await expect(page).toHaveURL(/\/(help)?$/);
  await expect(page).toHaveTitle('Help Today · Crossover Stockton');
  await expect(page.locator('#page')).toContainText('No verified pathways today');
  await expect(page.locator('#page-bar')).toHaveCount(0);

  // Navigate to Evidence and scroll down
  await page.locator('#main-nav a[href="/evidence"]').click();
  await expect(page).toHaveURL(/\/evidence$/);
  await expect(page).toHaveTitle('Evidence · Crossover Stockton');
  await expect(page.locator('#record-results')).toContainText('53 records');
  await page.evaluate(() => window.scrollTo(0, 320));
  const savedScroll = await page.evaluate(() => window.scrollY);
  expect(savedScroll).toBeGreaterThan(100);

  // Open Menu -> About, then Back twice returns to Menu and then Evidence at same scroll
  await page.locator('#menu').evaluate((el) => (el as HTMLElement).focus({ preventScroll: true }));
  await page.locator('#menu').click();
  await expect(page.locator('#panel-title')).toHaveText('Menu');
  await expect(page.locator('#panel')).toContainText('Connect on LinkedIn');
  await expect(page.locator('#panel a[href="https://www.linkedin.com/in/jeff-kolyer"]')).toBeVisible();
  await expect(page.locator('#panel [data-action="back"]')).toBeVisible();
  await expect(page.locator('#panel [data-action="close"]')).toBeVisible();
  await page.locator('#panel a[href$="/about"]').click();
  await expect(page.locator('.site-footer')).not.toContainText('Source repository');
  await expect(page.locator('#panel-title')).toHaveText('About & methodology');
  await expect(page.locator('#panel')).toContainText('This is Crossover’s working board for Stockton.');
  await expect(page.locator('#panel')).toContainText('Source repository');
  await expect(page.locator('#panel a[href="https://www.linkedin.com/in/jeff-kolyer"]')).toBeVisible();

  await page.locator('#panel [data-action="back"]').click();
  await expect(page.locator('#panel-title')).toHaveText('Menu');
  await page.locator('#panel [data-action="back"]').click();
  await expect(page.locator('#panel')).toBeHidden();
  expect(Math.abs((await page.evaluate(() => window.scrollY)) - savedScroll)).toBeLessThanOrEqual(5);

  // Repeat Evidence -> Menu -> About and click Close (x): returns straight to Evidence with focus on #menu
  await page.locator('#menu').evaluate((el) => (el as HTMLElement).focus({ preventScroll: true }));
  await page.locator('#menu').click();
  await page.locator('#panel a[href$="/about"]').click();
  await expect(page.locator('#panel-title')).toHaveText('About & methodology');
  await page.locator('#panel [data-action="close"]').click();
  await expect(page.locator('#panel')).toBeHidden();
  await expect(page).toHaveTitle('Evidence · Crossover Stockton');
  await expect(page.locator('#menu')).toBeFocused();
  expect(Math.abs((await page.evaluate(() => window.scrollY)) - savedScroll)).toBeLessThanOrEqual(5);
});

test('pathway -> linked record traversal, direct links, older chapter URL, and new pathway creation work cleanly', async ({ page }, testInfo) => {
  const width = testInfo.project.use.viewport!.width;
  await page.goto('/pathways');

  // Open PW-01 and follow linked evidence FLD-2026-002
  await page.locator('a[href="/pathways/p/PW-01"]').first().click();
  await expect(page).toHaveURL(/\/pathways\/p\/PW-01$/);
  await expect(page.locator('#panel-title')).toHaveText('Volunteer at Stockton Animal Services');
  await page.locator('#panel a[href$="/r/FLD-2026-002"]').click();
  await expect(page.locator('#panel')).toContainText('FLD-2026-002');
  await page.locator('#panel [data-action="back"]').click();
  await expect(page.locator('#panel-title')).toHaveText('Volunteer at Stockton Animal Services');
  await page.locator('#panel a[href$="/r/FLD-2026-002"]').click();
  await page.locator('#panel [data-action="close"]').click();
  await expect(page.locator('#panel')).toBeHidden();
  await expect(page).toHaveTitle('Pathways · Crossover Stockton');

  // Direct evidence link in fresh navigation: Back and Close both return to Evidence
  await page.goto('/evidence/r/SHEL-2024-001');
  await expect(page.locator('#panel')).toBeVisible();
  await expect(page.locator('#panel [data-action="back"]')).toBeVisible();
  await expect(page.locator('#panel [data-action="close"]')).toBeVisible();
  await expect(page.locator('#panel')).toContainText('2024 animal intake and outcome report');
  await page.locator('#panel [data-action="back"]').click();
  await expect(page.locator('#panel')).toBeHidden();
  await expect(page).toHaveURL(/\/evidence$/);
  await expect(page.locator('#record-results')).toContainText('53 records');

  await page.goto('/evidence/r/SHEL-2024-001');
  await page.locator('#panel [data-action="close"]').click();
  await expect(page.locator('#panel')).toBeHidden();
  await expect(page).toHaveURL(/\/evidence$/);
  await expect(page.locator('#record-results')).toContainText('53 records');

  // Chapter dialog (#chapter / /pathways/chapter) shows location only without Appearance or About
  await page.goto('/pathways/chapter');
  await expect(page.locator('#panel-title')).toHaveText('Stockton, California');
  await expect(page.locator('#panel')).not.toContainText('Appearance');
  await expect(page.locator('#panel')).not.toContainText('About Crossover & methodology');
  await page.locator('#panel [data-action="close"]').click();

  // Older #pathways/chapter/about URL still works
  await page.goto('/#pathways/chapter/about');
  await expect(page.locator('#panel-title')).toHaveText('About & methodology');
  await page.locator('#panel [data-action="close"]').click();

  // Menu drawer toggles dark/light theme
  await page.locator('#menu').click();
  await expect(page.locator('#panel-title')).toHaveText('Menu');
  await page.locator('#panel [data-theme-choice="dark"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.locator('#panel [data-theme-choice="light"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.locator('#panel [data-action="close"]').click();

  // Create a new pathway directly on the board without a topic/project field
  await page.locator('[data-overlay="new"]').click();
  await expect(page.locator('#panel-title')).toHaveText('New pathway');
  await page.locator('#candidate-form input[name="title"]').fill('Deliver groceries to a homebound neighbor');
  await page.locator('#candidate-form input[name="org"]').fill('South Stockton');
  await page.locator('#candidate-form textarea[name="condition"]').fill('Confirm delivery window and dietary preferences.');
  await page.locator('#candidate-form button[type="submit"]').click();
  await expect(page.locator('#panel-title')).toHaveText('Deliver groceries to a homebound neighbor');
  await page.locator('#panel [data-action="close"]').click();
  await expect(page.locator('#page')).toContainText('Deliver groceries to a homebound neighbor');
  if (width > 700) {
    await expect(page.locator('.board-col').first()).toContainText('Deliver groceries to a homebound neighbor');
  }
});
