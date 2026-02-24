import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Xbox Support Portal E2E tests
 * Optimized for CI/CD pipeline environments
 */
export default defineConfig({
  // Test directory
  testDir: './tests',

  // Maximum time one test can run
  timeout: 60_000,

  // Maximum time for expect assertions
  expect: {
    timeout: 10_000,
  },

  // Run tests in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Limit parallel workers on CI to avoid resource issues
  workers: process.env.CI ? 2 : undefined,

  // Reporter configuration
  reporter: process.env.CI
    ? [
        ['html', { outputFolder: 'playwright-report' }],
        ['junit', { outputFile: 'test-results/junit.xml' }],
        ['list'],
      ]
    : [['html'], ['list']],

  // Shared settings for all projects
  use: {
    // Base URL for the Xbox Support Portal
    baseURL: 'https://support.xbox.com',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Capture screenshot on failure
    screenshot: 'only-on-failure',

    // Record video on failure
    video: 'on-first-retry',

    // Default navigation timeout
    navigationTimeout: 30_000,

    // Default action timeout
    actionTimeout: 15_000,

    // Viewport size
    viewport: { width: 1920, height: 1080 },

    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,

    // Locale
    locale: 'en-US',

    // Timezone
    timezoneId: 'America/Los_Angeles',
  },

  // Configure projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Run headless in CI
        headless: !!process.env.CI,
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        headless: !!process.env.CI,
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        headless: !!process.env.CI,
      },
    },
    // Mobile viewport testing
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        headless: !!process.env.CI,
      },
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 12'],
        headless: !!process.env.CI,
      },
    },
  ],

  // Output folder for test artifacts
  outputDir: 'test-results',
});
