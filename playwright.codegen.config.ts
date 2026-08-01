import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './codegen',
  testMatch: '**/*.ts',
  fullyParallel: false,
  workers: 1,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL ?? 'https://example.com',
    headless: false,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    viewport: { width: 1536, height: 730 },
    launchOptions: {
      slowMo: 500,
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
