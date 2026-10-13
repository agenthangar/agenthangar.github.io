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
  await expect(page.locator('#contact a[href^="mailto:"]')).toHaveCount(2);
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

test('contact section lists both emails and stays compact', async ({ page }) => {
  await page.route(/google-analytics|googletagmanager|fonts\.google/, route => route.abort());
  await page.goto('/');
  const contact = page.locator('#contact');
  const emails = contact.locator('a[href^="mailto:"]');
  await expect(emails).toHaveCount(2);
  for (const [i, address] of ['chris@agenthangar.ai', 'mayank@agenthangar.ai'].entries()) {
    await expect(emails.nth(i)).toHaveAttribute('href', `mailto:${address}`);
    await expect(emails.nth(i)).toHaveText(address);
    const box = await emails.nth(i).boundingBox();
    expect(box.height, `${address} tap target`).toBeGreaterThanOrEqual(44);
  }
  // Contact sits outside the tool tabs, so it stays visible whichever tool is selected.
  await page.getByRole('tab', { name: /02 \/ Report/ }).click();
  await expect(contact).toBeVisible();
  // A small closing section: well under half a screen tall at every viewport.
  const { height } = await contact.boundingBox();
  expect(height).toBeLessThan(page.viewportSize().height * 0.45);
  const nav = page.locator('.site-nav a[href="#contact"]');
  if (await nav.isVisible()) {
    await nav.click();
    await expect(contact.locator('h2')).toBeInViewport();
  }
  const width = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  expect(width[0]).toBeLessThanOrEqual(width[1] + 1);
  await contact.screenshot({ path: `test-results/contact-${test.info().project.name}.png` });
});
