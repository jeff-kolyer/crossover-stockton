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

  const brand = page.locator('#brand-home');
  await expect(brand).toContainText('CROSSOVER');
  if (width >= 360) {
    await expect(brand).toContainText('STOCKTON, CA');
    await expect(brand.getByText('Stray Dog Ecology & Veterinary Access Audit')).toBeVisible();
  }
  await expect(brand.locator('img')).toHaveAttribute('src', '/images/crossover-c.svg');
  expect(await brand.locator('img').evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  const brandBox = await brand.boundingBox();
  expect(brandBox).not.toBeNull();
  expect(brandBox!.x).toBeGreaterThanOrEqual(-1);
  expect(brandBox!.x + brandBox!.width).toBeLessThanOrEqual(width + 1);
  const status = page.locator('#investigation-status');
  await expect(status.getByText('ACTIVE INVESTIGATION')).toBeVisible();
  const pulse = status.locator('#status-pulse');
  await expect(pulse).toBeVisible();
  expect(await pulse.evaluate((element) => getComputedStyle(element).animationName)).not.toBe('none');
  for (const label of ['Checked: 17', 'Open: 6', 'Waiting: 1']) {
    await expect(status.getByRole('button', { name: label })).toBeVisible();
  }
  await expect(status.getByRole('button', { name: 'Open: 6' }).locator('strong')).toHaveClass(/text-sky-400/);
  if (width >= 1280) {
    const navBox = await page.locator('nav[aria-label="Main Investigation Sections"]').boundingBox();
    expect(navBox).not.toBeNull();
    expect(Math.abs((brandBox!.y + brandBox!.height / 2) - (navBox!.y + navBox!.height / 2))).toBeLessThan(12);
    expect(navBox!.x + navBox!.width).toBeLessThanOrEqual(width + 1);
  }

  await expect(page.locator('header button[onclick*="scrollToTipForm"]')).toHaveCount(0);

  await page.screenshot({ path: `test-results/screenshots/overview-${width}.png`, fullPage: true });
  await page.screenshot({ path: `test-results/screenshots/header-${width}.png`, clip: { x: 0, y: 0, width, height: width < 1024 ? 280 : 190 } });
  if (width === 412) {
    await page.locator('#brand-home').hover();
    await page.screenshot({ path: 'test-results/screenshots/header-hover-412.png', clip: { x: 0, y: 0, width, height: 140 } });
  }
});

test('retired model links return to the overview', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#tab-solutions, #model-switcher-btn, #ethos-drawer')).toHaveCount(0);
  await page.goto('/?tab=solutions');
  await expect(page.locator('#tab-overview')).toBeVisible();
});

test('footer uses the Crossover Stockton identity', async ({ page }, testInfo) => {
  await page.goto('/');
  const footer = page.locator('footer');
  await expect(footer.getByText('CROSSOVER', { exact: true })).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(footer.getByText('// STOCKTON, CA', { exact: true })).toHaveCSS('color', 'rgb(251, 191, 36)');
  await expect(footer.getByText('Stray Dog Ecology & Veterinary Access Audit')).toBeVisible();
  const width = testInfo.project.use.viewport!.width;
  if ([412, 280].includes(width)) await footer.screenshot({ path: `test-results/screenshots/footer-${width}.png` });
});

test('all navigation sections are reachable', async ({ page }, testInfo) => {
  await page.goto('/');
  const mobile = testInfo.project.use.viewport!.width < 1280;
  for (const section of sections) {
    const tab = page.locator(`#${mobile ? 'mnav' : 'nav'}-${section}`);
    await tab.scrollIntoViewIfNeeded();
    await expect(tab).toBeInViewport();
    await tab.click();
    await expect(page.locator(`#tab-${section}`)).toBeVisible();
    await expect(tab).toHaveClass(/active/);
    if (mobile) await expect(tab).toHaveCSS('color', 'rgb(248, 250, 252)');
  }
});

test('care resource filters show their selected state', async ({ page }, testInfo) => {
  await page.goto('/?tab=care-resources');
  const filters = page.locator('.res-filter-btn');
  const labels = ['All Services', 'Spay/Neuter', 'Vaccines', 'Found Pet', 'Scheduled'];
  for (const label of labels) {
    const selected = filters.filter({ hasText: label });
    await selected.click();
    await expect(selected).toHaveAttribute('aria-pressed', 'true');
    await expect(selected).toHaveCSS('background-color', 'rgb(15, 23, 42)');
    await expect(page.locator('.res-filter-btn[aria-pressed="true"]')).toHaveCount(1);
    await expect(page.locator('#resources-grid > *').first()).toBeVisible();
  }
  const width = testInfo.project.use.viewport!.width;
  if ([1440, 375, 280].includes(width)) {
    await filters.filter({ hasText: 'Scheduled' }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/screenshots/care-filters-${width}.png` });
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

test('top counts open matching record filters', async ({ page }) => {
  await page.goto('/');
  const status = page.locator('#investigation-status');
  for (const [label, count] of [['Checked: 17', 17], ['Open: 6', 6], ['Waiting: 1', 1]] as const) {
    await status.getByRole('button', { name: label }).click();
    await expect(page.locator('#tab-evidence-room')).toBeVisible();
    await expect(page.locator('#evidence-list-container').getByRole('button')).toHaveCount(count);
    if (label === 'Open: 6') await expect(page.locator('#evidence-list-container .bg-sky-100').first()).toBeVisible();
  }
});

test('Ground Truth lists linked records', async ({ page }, testInfo) => {
  await page.goto('/?tab=ground-truth');
  const groundTruth = page.locator('#tab-ground-truth');
  const rows = groundTruth.locator('#gt-records-tbody tr');
  await expect(rows).toHaveCount(54);
  for (const [label, count] of [['Checked (17)', 17], ['Reported (21)', 21], ['Firsthand (8)', 8], ['Open work (6)', 6], ['Waiting (1)', 1], ['All (54)', 54]] as const) {
    const filter = groundTruth.getByRole('button', { name: label, exact: true });
    await filter.click();
    await expect(filter).toHaveClass(/bg-slate-900/);
    await expect(rows).toHaveCount(count);
    if (label === 'Open work (6)') await expect(rows.first().locator('.bg-sky-100')).toBeVisible();
  }
  if ([1440, 390].includes(testInfo.project.use.viewport!.width)) {
    await groundTruth.getByRole('heading', { name: /Primary Records & Work Items/ }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/screenshots/ground-truth-records-${testInfo.project.use.viewport!.width}.png` });
  }
  await rows.first().click();
  await expect(page.locator('#tab-evidence-room')).toBeVisible();
});
