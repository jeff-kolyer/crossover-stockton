import { test, expect } from '@playwright/test';

const sections = ['overview', 'ground-truth', 'evidence-room', 'initiatives', 'care-resources', 'methodology'];

test('page fits the viewport and preserves the header actions', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.locator('#tab-overview')).toBeVisible();

  const width = testInfo.project.use.viewport!.width;
  const dimensions = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }));
  expect(dimensions.scroll, `Document overflows at ${width}px: ${JSON.stringify(dimensions)}`).toBeLessThanOrEqual(dimensions.viewport + 1);

  const brand = page.locator('header button').first();
  await expect(brand).toContainText('STOCKTON');
  await expect(brand).toContainText('STREETWATCH');
  const brandBox = await brand.boundingBox();
  expect(brandBox).not.toBeNull();
  expect(brandBox!.x).toBeGreaterThanOrEqual(-1);
  expect(brandBox!.x + brandBox!.width).toBeLessThanOrEqual(width + 1);
  const locationBox = await brand.getByText('STOCKTON').boundingBox();
  expect(locationBox).not.toBeNull();
  expect(locationBox!.x + locationBox!.width).toBeLessThanOrEqual(width + 1);
  await expect(page.getByRole('button', { name: /Checked: 17/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Waiting: 1/i })).toBeVisible();

  if (width < 768) {
    const report = page.locator('header button').filter({ hasText: /Report/ });
    await expect(report).toBeVisible();
    const box = await report.boundingBox();
    expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1);
  }

  await page.screenshot({ path: `test-results/screenshots/overview-${width}.png`, fullPage: true });
});

test('all navigation sections are reachable', async ({ page }, testInfo) => {
  await page.goto('/');
  const mobile = testInfo.project.use.viewport!.width < 768;
  for (const section of sections) {
    const tab = page.locator(`#${mobile ? 'mnav' : 'nav'}-${section}`);
    await tab.scrollIntoViewIfNeeded();
    await expect(tab).toBeInViewport();
    await tab.click();
    await expect(page.locator(`#tab-${section}`)).toBeVisible();
  }
});

test('baseline indicators and source labels remain present', async ({ page }) => {
  await page.goto('/');
  const overview = page.locator('#tab-overview');
  for (const value of ['3,106', 'DATA GAP', '3–10', '7,183']) {
    await expect(overview.getByText(value, { exact: false }).first()).toBeVisible();
  }
  for (const label of ['CITY 2024 REPORT', 'SOURCE: GROUP REPORT', 'RECEIPT RECORD']) {
    await expect(overview.getByRole('link', { name: new RegExp(label) })).toBeVisible();
  }
});

test('Evidence Room renders the 54-record index', async ({ page }, testInfo) => {
  await page.goto('/?tab=evidence-room');
  await expect(page.locator('#tab-evidence-room')).toBeVisible();
  await expect(page.getByText('Master File Index (54)')).toBeVisible();
  await expect(page.locator('#evidence-list-container').getByRole('button').first()).toBeVisible();
  await page.screenshot({ path: `test-results/screenshots/evidence-room-${testInfo.project.use.viewport!.width}.png`, fullPage: true });
});
