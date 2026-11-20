import { test, expect } from '@playwright/test';

test('pathway tracker loads Pathways workspace and fits the viewport without clipping nav counts', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Pathways · Crossover Stockton');
  await expect(page.locator('header')).toContainText('Crossover');
  await expect(page.locator('#chapter')).toContainText('Stockton, CA');
  await expect(page.locator('#main-nav')).toContainText('0');
  await expect(page.locator('#main-nav')).toContainText('3');
  await expect(page.locator('#main-nav')).toContainText('7');
  await expect(page.locator('#main-nav')).toContainText('53');
  await expect(page.locator('#workspace-title')).toHaveText('Pathway tracker');

  const width = testInfo.project.use.viewport!.width;
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

  if ([1440, 375, 280].includes(width)) {
    await page.screenshot({ path: `test-results/screenshots/pathway-help-${width}.png`, fullPage: true });
  }
});

test('all four workspace views use authoritative records, switch layouts, and enforce Help Today verification rules', async ({ page }, testInfo) => {
  await page.goto('/');
  const width = testInfo.project.use.viewport!.width;

  // Pathways section (default)
  await expect(page.locator('#track-title')).toHaveText('Tracked pathways');
  await expect(page.locator('#page')).toContainText('Food and water for street dogs');

  // Switch pathway layout to Board and verify phone vs desktop stage columns
  if (width <= 700) {
    await page.locator('[data-overlay="views"]').click();
    await expect(page.locator('#panel')).toBeVisible();
    await page.locator('#panel [data-view="board"]').click();
    await expect(page.locator('#board-stage')).toBeVisible();
    await expect(page.locator('.board-col:visible')).toHaveCount(1);
  } else {
    await page.locator('.view-switch [data-view="board"]').click();
    await expect(page.locator('.board-col:visible')).toHaveCount(4);
  }

  // Help today section
  await page.locator('#main-nav a[href="#help"]').click();
  await expect(page).toHaveTitle('Help today · Crossover Stockton');
  await expect(page.locator('#page')).toContainText('No verified pathways yet');
  await expect(page.locator('#page')).toContainText('3 pathways are being tracked');

  // Tasks section
  await page.locator('#main-nav a[href="#tasks"]').click();
  await expect(page).toHaveTitle('Tasks · Crossover Stockton');
  await expect(page.locator('#task-results')).toContainText('7 tasks');
  await expect(page.locator('#task-results')).toContainText('Follow up with Stockton Animal Services on volunteering');

  // Evidence section
  await page.locator('#main-nav a[href="#evidence"]').click();
  await expect(page).toHaveTitle('Evidence · Crossover Stockton');
  await expect(page.locator('#record-results')).toContainText('53 records');
  await expect(page.locator('#record-results')).toContainText('2024 animal intake and outcome report');
});

test('pathway detail, linked task and evidence traversal, Back/Escape focus restoration, global search, and theme toggle work cleanly', async ({ page }) => {
  await page.goto('/');

  // Open PW-01 pathway detail panel
  const pwCard = page.locator('a[href="#pathways/p/PW-01"]').first();
  await pwCard.click();
  await expect(page.locator('#panel')).toBeVisible();
  await expect(page.locator('#panel-title')).toHaveText('Volunteer at Stockton Animal Services');
  await expect(page.locator('#panel')).toContainText('Follow up with Stockton Animal Services on volunteering');

  // Follow linked task WORK-2026-005
  await page.locator('#panel a[href$="/t/WORK-2026-005"]').click();
  await expect(page.locator('#panel-title')).toContainText('Follow up with Stockton Animal Services on volunteering');

  // Follow supporting evidence FLD-2026-002
  await page.locator('#panel a[href$="/r/FLD-2026-002"]').click();
  await expect(page.locator('#panel')).toContainText('FLD-2026-002');
  await expect(page.locator('#panel')).toContainText('Limits of this evidence');

  // Return via Back button twice, then Escape to close panel and restore focus
  await page.locator('#panel [data-action="back"]').click();
  await expect(page.locator('#panel-title')).toContainText('Follow up with Stockton Animal Services on volunteering');
  await page.locator('#panel [data-action="back"]').click();
  await expect(page.locator('#panel-title')).toHaveText('Volunteer at Stockton Animal Services');
  await page.keyboard.press('Escape');
  await expect(page.locator('#panel')).toBeHidden();

  // Search by stable record ID SHEL-2024-001 and inspect source and limitations
  await page.locator('#find').click();
  await expect(page.locator('#panel')).toBeVisible();
  await page.locator('#global-q').fill('SHEL-2024-001');
  await page.locator('#search-hits a[href$="/r/SHEL-2024-001"]').click();
  await expect(page.locator('#panel')).toContainText('2024 animal intake and outcome report');
  await expect(page.locator('#panel')).toContainText('Limits of this evidence');
  await expect(page.locator('#panel a.source-btn')).toHaveAttribute('href', /2024%20-%20Kennel%20Stats\.pdf/);
  await page.locator('#panel [data-action="close"]').click();
  await expect(page.locator('#panel')).toBeHidden();

  // Open Stockton, CA chapter dialog, toggle dark/light theme, and open About & methodology
  await page.locator('#chapter').click();
  await expect(page.locator('#panel-title')).toHaveText('Stockton, California');
  await page.locator('#panel [data-theme-choice="dark"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.locator('#panel [data-theme-choice="light"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.locator('#panel a[href$="/about"]').click();
  await expect(page.locator('#panel-title')).toHaveText('About & methodology');
  await expect(page.locator('#panel')).toContainText('Quintin Soloviev');
  await page.locator('#panel [data-action="close"]').click();
  await expect(page.locator('#panel')).toBeHidden();
});
