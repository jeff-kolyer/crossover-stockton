import { test, expect } from '@playwright/test';

test('editorial pages, sources, and tracker routes remain usable', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Where should we spend our time?' }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Wanting to help is simpler than knowing how.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'The Ripon dilemma' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Three hopes as machines take on routine work' })).toBeVisible();
  await expect(page.locator('main')).toContainText('30–40M');
  await expect(page.locator('main')).toContainText('5.8M');
  await expect(page.locator('iframe[title="CBS News Sacramento report on Ripon cat-feeding restrictions"]')).toHaveAttribute('src', /x7_BDjM662k/);
  await expect(page.locator('.identity')).toContainText('crossover');
  await expect(page.locator('.identity svg')).toBeVisible();

  for (const [route, heading] of [
    ['/crossover', 'The mind can change what we see.'],
    ['/post-scarcity', 'Capacity gives us a choice.'],
    ['/stewardship', 'Care for the whole living system.'],
    ['/work', 'Follow what happens after we decide to help.'],
    ['/about', 'How Crossover works in Stockton.']
  ]) {
    await page.goto(route);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(heading);
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toContainText(heading);
  }
  await expect(page.locator('a[href="https://www.linkedin.com/in/jeff-kolyer"]')).toBeVisible();
  await expect(page.locator('.site-footer a[href="/about"]')).toBeVisible();

  await page.goto('/workspace.html#pathways');
  await expect(page.locator('#page')).toContainText('Tracked pathways');
  await expect(page.locator('.site-header')).toContainText('Home');
  await expect(page.locator('.site-header')).toContainText('The Work');
  await expect(page.locator('.site-header')).not.toContainText('← The Work');
  await expect(page.locator('#work-tabs a')).toHaveCount(3);
  await page.reload();
  await expect(page.locator('#page')).toContainText('Tracked pathways');
  await page.locator('#work-tabs a[href="#tasks"]').click();
  await expect(page).toHaveURL(/workspace\.html#tasks$/);
  await expect(page.locator('#page')).toContainText('Tasks');
  await page.locator('#work-tabs a[href="#evidence"]').click();
  await expect(page).toHaveURL(/workspace\.html#evidence$/);
  await expect(page.locator('#page')).toContainText('Evidence');
});

test('public navigation and layout fit each viewport', async ({ page }, testInfo) => {
  await page.goto('/');
  if (await page.locator('.menu-button').isVisible()) {
    await page.locator('.menu-button').click();
    await expect(page.locator('.menu-button')).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'About' })).toBeVisible();
    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'The Work' }).click();
  } else {
    await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'About' })).toBeHidden();
    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'The Work' }).click();
  }
  await expect(page).toHaveURL(/\/work$/);
  const dimensions = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  expect(dimensions.scroll, `Public site overflows at ${testInfo.project.name}`).toBeLessThanOrEqual(dimensions.width + 1);
});
