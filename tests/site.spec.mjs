import { test, expect } from '@playwright/test';
import { checkPage } from './browser-checks.mjs';

test('links, tool navigation, images, media and responsive layout', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  // No analytics traffic from automated tests; fonts use the site's system fallback.
  await page.route(/google-analytics|googletagmanager|fonts\.google/, route => route.abort());
  await page.goto('/');
  await checkPage(page);
  await expect.poll(() => page.locator('video').first().evaluate(el => el.readyState)).toBeGreaterThanOrEqual(1);
  await expect.poll(() => page.locator('video').first().evaluate(el => el.duration)).toBeGreaterThan(0);
  expect(errors).toEqual([]);
  await page.screenshot({ path: `test-results/${test.info().project.name}.png`, fullPage: true });
});

test('deep links reveal their target tool', async ({ page }) => {
  await page.goto('/#runtimebrief-demo');
  await expect(page.locator('#runtimebrief-demo')).toBeVisible();
  await page.getByRole('tab', { name: /04 \/ Equip/ }).click();
  await page.goto('/#t-recordings');
  await expect(page.locator('#t-demo')).toBeVisible();
});

test('without JavaScript every tool remains available', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:8944/');
  for (const panel of await page.locator('.tool-panel').all()) await expect(panel).toBeVisible();
  await context.close();
});

test('switching away from the demo pauses playback', async ({ page }) => {
  await page.goto('/#t-recordings');
  const video = page.locator('video').first();
  await video.evaluate(el => el.play());
  await expect(video).toHaveJSProperty('paused', false);
  await page.getByRole('tab', { name: /02 \/ Report/ }).click();
  await expect(video).toHaveJSProperty('paused', true);
});
