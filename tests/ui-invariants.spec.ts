import { test, expect } from '@playwright/test';

test('workspace loads Pathways by default, displays all three counted tabs, and fits every viewport without overflow', async ({ page }, testInfo) => {
  await page.goto('/workspace.html');
  await expect(page).toHaveTitle('Pathways · Crossover Stockton');
  await expect(page.locator('.site-header')).toContainText('crossover');
  await expect(page.locator('.site-header')).toContainText('The Work');

  // Three counted tabs: Pathways (3), Tasks (7), Evidence (53)
  await expect(page.locator('#work-tabs a')).toHaveCount(3);
  await expect(page.locator('#work-tabs')).toContainText('3');
  await expect(page.locator('#work-tabs')).toContainText('7');
  await expect(page.locator('#work-tabs')).toContainText('53');

  // Simplified pathway list renders all 3 pathways
  await expect(page.locator('.simple-list .path-card')).toHaveCount(3);
  await expect(page.locator('.simple-list .path-card').first()).toBeVisible();

  const width = testInfo.project.use.viewport!.width;
  const size = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth
  }));
  expect(size.scroll, `Page overflows at ${width}px`).toBeLessThanOrEqual(size.viewport + 1);

  const navFit = await page.evaluate(() => {
    const nav = document.getElementById('work-tabs');
    if (!nav) return null;
    const items = Array.from(nav.querySelectorAll('a'));
    const clipped = items.some((el) => el.scrollWidth > el.clientWidth + 1);
    return { scroll: nav.scrollWidth, client: nav.clientWidth, clipped };
  });
  expect(navFit).not.toBeNull();
  expect(navFit!.scroll, `Work tabs overflow at ${width}px`).toBeLessThanOrEqual(navFit!.client + 1);
  expect(navFit!.clipped, `Work tab clipped at ${width}px`).toBe(false);
});

test('Evidence -> record panel Back & Close preserve scroll and opener focus', async ({ page }) => {
  await page.goto('/workspace.html#evidence');
  await expect(page).toHaveURL(/workspace\.html#evidence$/);
  await expect(page).toHaveTitle('Evidence · Crossover Stockton');
  await expect(page.locator('#record-results')).toContainText('53 records');

  await page.evaluate(() => window.scrollTo(0, 320));
  const savedScroll = await page.evaluate(() => window.scrollY);
  expect(savedScroll).toBeGreaterThan(100);

  const firstRecordLink = page.locator('#record-results a[href^="#evidence/r/"]').first();
  await firstRecordLink.evaluate((el) => (el as HTMLElement).focus({ preventScroll: true }));
  await firstRecordLink.click();
  await expect(page.locator('#panel')).toBeVisible();
  await expect(page.locator('#panel [data-action="back"]')).toBeVisible();
  await expect(page.locator('#panel [data-action="close"]')).toBeVisible();

  await page.locator('#panel [data-action="back"]').click();
  await expect(page.locator('#panel')).toBeHidden();
  expect(Math.abs((await page.evaluate(() => window.scrollY)) - savedScroll)).toBeLessThanOrEqual(5);

  await firstRecordLink.evaluate((el) => (el as HTMLElement).focus({ preventScroll: true }));
  await firstRecordLink.click();
  await expect(page.locator('#panel')).toBeVisible();
  await page.locator('#panel [data-action="close"]').click();
  await expect(page.locator('#panel')).toBeHidden();
  await expect(page).toHaveTitle('Evidence · Crossover Stockton');
  await expect(firstRecordLink).toBeFocused();
  expect(Math.abs((await page.evaluate(() => window.scrollY)) - savedScroll)).toBeLessThanOrEqual(5);
});

test('pathway -> linked record traversal, direct evidence links, and Tasks search work cleanly', async ({ page }) => {
  await page.goto('/workspace.html#pathways');

  // Open PW-01 and follow linked evidence FLD-2026-002
  await page.locator('a[href="#pathways/p/PW-01"]').first().click();
  await expect(page).toHaveURL(/workspace\.html#pathways\/p\/PW-01$/);
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
  await page.goto('/workspace.html#evidence/r/SHEL-2024-001');
  await expect(page.locator('#panel')).toBeVisible();
  await expect(page.locator('#panel [data-action="back"]')).toBeVisible();
  await expect(page.locator('#panel [data-action="close"]')).toBeVisible();
  await expect(page.locator('#panel')).toContainText('2024 animal intake and outcome report');
  await page.locator('#panel [data-action="back"]').click();
  await expect(page.locator('#panel')).toBeHidden();
  await expect(page).toHaveURL(/workspace\.html#evidence$/);
  await expect(page.locator('#record-results')).toContainText('53 records');

  await page.goto('/workspace.html#evidence/r/SHEL-2024-001');
  await page.locator('#panel [data-action="close"]').click();
  await expect(page.locator('#panel')).toBeHidden();
  await expect(page).toHaveURL(/workspace\.html#evidence$/);
  await expect(page.locator('#record-results')).toContainText('53 records');

  // Tasks tab and search filter
  await page.locator('#work-tabs a[href="#tasks"]').click();
  await expect(page).toHaveURL(/workspace\.html#tasks$/);
  await expect(page.locator('#task-results')).toContainText('7 tasks');
  await page.locator('#task-q').fill('CBS');
  await expect(page.locator('#task-results')).toContainText('1 task');
  await expect(page.locator('#task-results')).toContainText('CBS');
});
