import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  reporter: 'list',
  retries: 0,
  use: { baseURL: 'http://127.0.0.1:5174' },
  webServer: {
    command: 'npm run dev -- --port 5174 --strictPort',
    url: 'http://127.0.0.1:5174',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    { name: 'desktop-1440', use: { browserName: 'chromium', viewport: { width: 1440, height: 900 } } },
    { name: 'desktop-1280', use: { browserName: 'chromium', viewport: { width: 1280, height: 800 } } },
    { name: 'tablet-1024', use: { browserName: 'chromium', viewport: { width: 1024, height: 768 } } },
    { name: 'tablet-768', use: { browserName: 'chromium', viewport: { width: 768, height: 1024 } } },
    { name: 'mobile-523', use: { browserName: 'chromium', viewport: { width: 523, height: 1166 } } },
    { name: 'mobile-412', use: { browserName: 'chromium', viewport: { width: 412, height: 924 } } },
    { name: 'mobile-390', use: { browserName: 'chromium', viewport: { width: 390, height: 844 } } },
    { name: 'mobile-375', use: { browserName: 'chromium', viewport: { width: 375, height: 812 } } },
    { name: 'mobile-280', use: { browserName: 'chromium', viewport: { width: 280, height: 653 } } },
  ],
});
