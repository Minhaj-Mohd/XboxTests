import { Page, expect } from '@playwright/test';

/**
 * Helper utility functions for Xbox tests
 */

/**
 * Wait for network to be idle
 */
export async function waitForNetworkIdle(page: Page, timeout: number = 5_000): Promise<void> {
  try {
    await page.waitForLoadState('networkidle', { timeout });
  } catch {
    // Network might not become idle, continue
  }
}

/**
 * Retry an action with exponential backoff
 */
export async function retryAction<T>(
  action: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await action();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Generate random string for test data
 */
export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Format date for test reporting
 */
export function formatTestDate(): string {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

/**
 * Take screenshot with timestamp
 */
export async function takeTimestampedScreenshot(
  page: Page,
  name: string
): Promise<void> {
  const timestamp = formatTestDate();
  await page.screenshot({
    path: `test-results/screenshots/${name}-${timestamp}.png`,
    fullPage: true,
  });
}

/**
 * Log test step for debugging
 */
export function logTestStep(stepName: string, details?: Record<string, unknown>): void {
  console.log(`[TEST STEP] ${stepName}`, details ? JSON.stringify(details, null, 2) : '');
}

/**
 * Verify element has specific CSS property
 */
export async function verifyElementStyle(
  page: Page,
  selector: string,
  property: string,
  expectedValue: string
): Promise<void> {
  const element = page.locator(selector);
  const actualValue = await element.evaluate(
    (el, prop) => window.getComputedStyle(el).getPropertyValue(prop),
    property
  );
  expect(actualValue).toBe(expectedValue);
}

/**
 * Check if running in CI environment
 */
export function isCI(): boolean {
  return !!process.env.CI;
}

/**
 * Get appropriate timeout based on environment
 */
export function getTimeout(baseTimeout: number): number {
  // Increase timeouts in CI due to potential resource constraints
  return isCI() ? baseTimeout * 1.5 : baseTimeout;
}
