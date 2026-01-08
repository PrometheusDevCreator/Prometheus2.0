import { defineConfig, devices } from '@playwright/test'

/**
 * Prometheus E2E Test Configuration
 * Aligned with PLAYWRIGHT_CONFIG.md baseline: 1890 x 940
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'test-results/playwright-report' }],
    ['json', { outputFile: 'test-results/playwright-results.json' }]
  ],
  outputDir: 'test-results/playwright-artifacts',

  use: {
    /* Prometheus baseline viewport per PLAYWRIGHT_CONFIG.md */
    viewport: { width: 1890, height: 940 },
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Dev server configuration */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
