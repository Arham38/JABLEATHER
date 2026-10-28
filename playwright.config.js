import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration for JAB LEATHER.
 * Tests desktop and mobile viewports with local dev servers.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: false, // Run flows reliably in sequence
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: [
    {
      command: 'npm --prefix server start',
      port: 5000,
      reuseExistingServer: true,
      timeout: 15000,
    },
    {
      command: 'npm --prefix client dev',
      port: 5173,
      reuseExistingServer: true,
      timeout: 15000,
    },
  ],
});
