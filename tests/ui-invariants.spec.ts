import { test, expect } from '@playwright/test';

const pages = ['home', 'articles', 'doing', 'ai', 'explorer', 'about'];

test('editorial home uses the gold square mark and fits the viewport', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Crossover Stockton · Clear attention. Practical local action.');
  await expect(page.getByRole('heading', { name: 'Crossing over from noise and disconnection to what is real right where we live.' })).toBeVisible();
  await expect(page.locator('.hero-art img')).toHaveAttribute('src', '/images/home/stockton-skyline-commons.jpg');
  await expect(page.locator('.metric-open strong')).toHaveCSS('color', 'rgb(29, 78, 216)');
  await expect(page.locator('.brand-mark svg')).toBeVisible();
  await expect(page.locator('.brand-mark svg path')).toHaveCount(2);
  await expect(page.locator('.footer-brand-mark svg')).toBeVisible();
  await expect(page.locator('.brand-mark')).toHaveCSS('background-color', 'rgb(29, 78, 216)');
  await expect(page.locator('.footer-brand-mark')).toHaveCSS('background-color', 'rgb(29, 78, 216)');
  const width = testInfo.project.use.viewport!.width;
  const size = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth }));
  expect(size.scroll, `Page overflows at ${width}px`).toBeLessThanOrEqual(size.viewport + 1);
  if ([1440, 375, 280].includes(width)) {
    await page.screenshot({ path: `test-results/screenshots/editorial-home-${width}.png`, fullPage: true });
  }
});

test('all editorial sections are reachable', async ({ page }, testInfo) => {
  await page.goto('/');
  for (const section of pages) {
    const link = testInfo.project.use.viewport!.width <= 950
      ? section === 'explorer' ? page.locator('.header-records') : page.locator(`.mobile-nav [data-page-link="${section}"]`)
      : page.locator(`.desktop-nav [data-page-link="${section}"]`);
    await link.click();
    await expect(page.locator('#site-main')).not.toBeEmpty();
    await expect(link).toHaveAttribute('aria-current', 'page');
  }
});

test('articles match the gold demo with key takeaways, single-purpose maps, and linked sources', async ({ page }, testInfo) => {
  await page.goto('/?page=articles');
  await expect(page.getByRole('heading', { name: "What We've Examined & Written" })).toBeVisible();
  await expect(page.locator('.article-index-card')).toHaveCount(4);
  await page.locator('[data-article-link="art-stats-2024-update"]').first().click();
  await expect(page.getByRole('heading', { name: /A Look at the Stray Dogs Gap Through Statistics/ })).toBeVisible();
  await expect(page.locator('.key-takeaways li')).toHaveCount(3);
  await expect(page.locator('.article-map-card')).toBeVisible();
  await expect(page.locator('.source-list li')).toHaveCount(4);
  await page.locator('[data-open-map="field-call-density"]').first().click();
  await expect(page.locator('#fullscreen-map-modal')).toBeVisible();
  await page.locator('[data-close-map]').click();
  await expect(page.locator('#fullscreen-map-modal')).toBeHidden();
  const source = page.locator('.source-list [data-record-link="SHEL-2024-001"]');
  await source.click();
  await expect(page.locator('#record-dialog')).toBeVisible();
  await expect(page.locator('#record-dialog')).toContainText('2024 animal intake and outcome report');
  await page.locator('#record-dialog [data-close-dialog]').first().click();
  await expect(page.locator('#record-dialog')).not.toBeVisible();
  const width = testInfo.project.use.viewport!.width;
  if ([1440, 375, 280].includes(width)) await page.screenshot({ path: `test-results/screenshots/editorial-article-${width}.png`, fullPage: true });
  await page.locator('[data-page-link="articles"]').filter({ hasText: 'Back to All Articles' }).click();
  await page.locator('[data-article-link="art-reporting-handoffs"]').first().click();
  await expect(page.getByRole('heading', { name: /Reporting and Rescue Handoffs/ })).toBeVisible();
  await expect(page.locator('.article-map-card')).toBeVisible();
  await expect(page.locator('.source-list li')).toHaveCount(4);
  if ([1440, 375, 280].includes(width)) await page.screenshot({ path: `test-results/screenshots/editorial-handoffs-${width}.png`, fullPage: true });
});

test('doing page follows the work-card layout and documented stages', async ({ page }, testInfo) => {
  await page.goto('/?page=doing');
  await expect(page.locator('.doing-steps > div')).toHaveCount(3);
  await expect(page.locator('#work-list .doing-card')).toHaveCount(16);
  await expect(page.locator('.doing-card').first()).toContainText("St. Mary's");
  const width = testInfo.project.use.viewport!.width;
  if ([1440, 375, 280].includes(width)) await page.screenshot({ path: `test-results/screenshots/editorial-doing-${width}.png`, fullPage: true });
  await page.getByRole('button', { name: /^Active \(/ }).click();
  await expect(page.locator('#work-list .doing-card')).toHaveCount(1);
  await expect(page.locator('#work-list')).toContainText('Review Animal Services field-call records');
  await page.getByRole('button', { name: /^Completed \(/ }).click();
  await expect(page.locator('#work-list .doing-card')).toHaveCount(5);
  await page.getByRole('button', { name: /^Planned \(/ }).click();
  await expect(page.locator('#work-list .doing-card')).toHaveCount(1);
  await page.getByRole('button', { name: /^Open \(/ }).click();
  await expect(page.locator('#work-list .doing-card')).toHaveCount(9);
  await page.locator('#work-list [data-record-link="WORK-2026-002"]').click();
  await expect(page.locator('#record-dialog')).toContainText('pet access and street needs');
});

test('AI ideas explain friction and applied roles without the old generic block', async ({ page }, testInfo) => {
  await page.goto('/?page=ai');
  await expect(page.getByRole('heading', { name: "Where we're applying AI" })).toBeVisible();
  await expect(page.locator('.ai-card')).toHaveCount(4);
  await expect(page.locator('.ai-card').first()).toContainText('Friction:');
  await expect(page.locator('.ai-card').first()).toContainText('Applied role:');
  await expect(page.getByText('Our test for an idea')).toHaveCount(0);
  const width = testInfo.project.use.viewport!.width;
  if ([1440, 375, 280].includes(width)) await page.screenshot({ path: `test-results/screenshots/editorial-ai-${width}.png`, fullPage: true });
});

test('About is rendered from the About article with the roots image', async ({ page }, testInfo) => {
  await page.goto('/?page=about');
  await expect(page.getByRole('heading', { name: 'Crossing Over from Egoic Noise to Simple Reality' })).toBeVisible();
  await expect(page.locator('.about-figure img')).toHaveAttribute('src', '/images/about/growing.jpg');
  await expect(page.locator('.about-prose')).toContainText('We set ourselves against no person.');
  await expect(page.locator('.about-grounding > div')).toHaveCount(3);
  await expect(page.locator('.about-founder-photo')).toHaveAttribute('src', '/images/about/about-the-founder.jpg');
  await expect(page.locator('.about-linkedin-link')).toHaveAttribute('href', 'https://www.linkedin.com/in/jeff-kolyer');
  const width = testInfo.project.use.viewport!.width;
  if ([1440, 375, 280].includes(width)) await page.screenshot({ path: `test-results/screenshots/editorial-about-${width}.png`, fullPage: true });
});

test('information explorer uses the split-pane dossier desk and full source catalog', async ({ page }, testInfo) => {
  await page.goto('/?page=explorer');
  await expect(page.locator('#result-count')).toHaveText('Showing 65 of 65 records');
  await expect(page.locator('#explorer-dossier-panel')).toBeVisible();
  await page.locator('#record-kind').selectOption('Article');
  await expect(page.locator('#record-list .record-row')).toHaveCount(4);
  await page.locator('#record-kind').selectOption('all');
  await page.getByRole('button', { name: /^Open Issue \(/ }).click();
  await expect(page.locator('#record-status')).toHaveValue('open issue');
  await expect(page.locator('#record-list .record-row')).toHaveCount(12);
  await page.locator('#record-list [data-select-record="WORK-2026-001"]').click();
  await expect(page.locator('#explorer-dossier-panel')).toContainText('Review Animal Services field-call records');
  await page.getByRole('tab', { name: /3\. Custody/ }).click();
  await expect(page.locator('#explorer-dossier-panel')).toContainText('Archival Chain of Custody');
  await page.getByRole('button', { name: /^All \(/ }).click();
  await page.getByRole('button', { name: /^Identified Gap \(/ }).click();
  await expect(page.locator('#record-list .record-row')).toHaveCount(3);
  await page.getByRole('button', { name: /^All \(/ }).click();
  await page.locator('#record-search').fill('microchip');
  await expect(page.locator('#record-list .record-row').first()).toBeVisible();
  await expect(page.locator('#result-count')).not.toHaveText('Showing 61 of 61 records');
  await page.locator('#record-search').fill('');
  await page.locator('#record-status').selectOption('open issue');
  await expect(page.locator('#record-list .record-row')).toHaveCount(12);
  await page.locator('#record-status').selectOption('all');
  await expect(page.locator('#record-list .record-row')).toHaveCount(65);
  const width = testInfo.project.use.viewport!.width;
  if ([1440, 375, 280].includes(width)) await page.screenshot({ path: `test-results/screenshots/editorial-explorer-${width}.png`, fullPage: true });
});

test('home work card opens modal with link to view in info explorer', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.work-card .card-id')).toHaveText(['WORK-2026-001', 'WORK-2026-002', 'WORK-2026-008']);
  await page.locator('[data-record-link="WORK-2026-008"]').first().click();
  await expect(page.locator('#record-dialog')).toBeVisible();
  await expect(page.locator('#record-dialog')).toContainText('Check what the Hard Luck veterinary-services expansion delivers');
  await page.locator('#record-dialog [data-explorer-record="WORK-2026-008"]').click();
  await expect(page.getByRole('heading', { name: 'Info Explorer' })).toBeVisible();
  await expect(page.locator('#explorer-dossier-panel')).toContainText('WORK-2026-008');
});

test('legacy evidence-room link opens the information explorer', async ({ page }) => {
  await page.goto('/?tab=evidence-room&record=SHEL-2024-001');
  await expect(page.getByRole('heading', { name: 'Info Explorer' })).toBeVisible();
  await expect(page.locator('#explorer-dossier-panel')).toContainText('2024 animal intake and outcome report');
});

test('mobile hamburger menu sits to the right of Records and opens navigation', async ({ page }, testInfo) => {
  await page.goto('/');
  const width = testInfo.project.use.viewport!.width;
  if (width > 950) {
    await expect(page.locator('#mobile-menu-btn')).toBeHidden();
    return;
  }
  const recordsBox = await page.locator('.header-records').boundingBox();
  const menuBtnBox = await page.locator('#mobile-menu-btn').boundingBox();
  expect(recordsBox).not.toBeNull();
  expect(menuBtnBox).not.toBeNull();
  expect(menuBtnBox!.x).toBeGreaterThan(recordsBox!.x + recordsBox!.width - 1);
  expect(Math.abs(recordsBox!.height - menuBtnBox!.height)).toBeLessThanOrEqual(1);
  await page.locator('#mobile-menu-btn').click();
  await expect(page.locator('#mobile-menu-panel')).toBeVisible();
  await expect(page.locator('#mobile-menu-panel a')).toHaveCount(6);
  if ([375, 280].includes(width)) {
    await page.screenshot({ path: `test-results/screenshots/editorial-mobile-menu-${width}.png` });
  }
  await page.locator('#mobile-menu-panel [data-page-link="about"]').click();
  await expect(page.locator('#mobile-menu-panel')).toBeHidden();
  await expect(page.getByRole('heading', { name: 'Crossing Over from Egoic Noise to Simple Reality' })).toBeVisible();
});
