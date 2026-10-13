import assert from 'node:assert/strict';

// Shared by Playwright in CI and Codex's browser adapter for local verification.
export async function checkPage(page) {
  const layout = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
    missingImages: [...document.images].filter(img => !img.complete || img.naturalWidth === 0).map(img => img.src),
  }));
  assert.ok(layout.content <= layout.viewport + 1, `Horizontal overflow: ${JSON.stringify(layout)}`);
  assert.equal(layout.missingImages.length, 0, `Missing images: ${layout.missingImages.join(", ")}`);
  assert.equal(await page.locator('h1').count(), 1);
  const tabs = page.locator('[data-tool]');
  const count = await tabs.count();
  assert.ok(count > 1, 'Multiple tools must remain featured');
  for (let i = 0; i < count; i++) {
    const tab = tabs.nth(i);
    await tab.click();
    const id = await tab.getAttribute('aria-controls');
    assert.equal(await tab.getAttribute('aria-selected'), 'true');
    assert.equal(await page.locator(`#${id}`).isVisible(), true);
    assert.equal(await page.locator('.tool-panel:not([hidden])').count(), 1);
    const width = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    assert.ok(width[0] <= width[1] + 1, `Panel ${id} overflows`);
  }
  await tabs.nth(0).click();
  await tabs.nth(0).press('ArrowRight');
  assert.equal(await tabs.nth(1).getAttribute('aria-selected'), 'true');
  await tabs.nth(1).press('Home');
  assert.equal(await tabs.nth(0).getAttribute('aria-selected'), 'true');
  const intro = await page.locator('.t-intro').evaluate(el => {
    const [heading, copy] = [...el.children].map(child => child.getBoundingClientRect());
    return { sameRow: Math.abs(heading.left - copy.left) > 10, topDifference: Math.abs(heading.top - copy.top), left: heading.left,
      flowLeft: document.querySelector('.desktop-flow').getBoundingClientRect().left,
      recordingLeft: document.querySelector('#t-recordings').getBoundingClientRect().left };
  });
  if (intro.sameRow) assert.ok(intro.topDifference <= 1, 'Intro columns must align at the top');
  assert.ok(Math.abs(intro.left - intro.flowLeft) <= 1, 'Workflow must share the intro left edge');
  assert.ok(Math.abs(intro.left - intro.recordingLeft) <= 1, 'Recording must share the intro left edge');
  const videos = page.locator('video');
  assert.ok(await videos.count() > 0);
  for (let i = 0; i < await videos.count(); i++) {
    const video = videos.nth(i);
    const state = await video.evaluate(el => ({error: el.error?.message ?? null, controls: el.controls, label: el.getAttribute('aria-label'), source: el.querySelector('source')?.getAttribute('src')}));
    assert.equal(state.error, null, state.source);
    assert.ok(state.controls && state.label && state.source, 'Video must have controls, label, and source');
  }
}
