import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', testMatch: '*.spec.mjs',
  use: { baseURL: 'http://127.0.0.1:8944', trace: 'retain-on-failure' },
  webServer: { command: 'python3 -m http.server 8944 --bind 127.0.0.1', url: 'http://127.0.0.1:8944', reuseExistingServer: !process.env.CI },
  projects: [
    { name: 'desktop-chromium', use: { browserName: 'chromium', viewport: { width: 1440, height: 900 } } },
    { name: 'mobile-small', use: { browserName: 'chromium', viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true } },
    { name: 'mobile-webkit', use: { browserName: 'webkit', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
});
