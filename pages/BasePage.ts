import { Page, Locator, expect } from '@playwright/test';

/**
 * Base Page Object providing common functionality for all pages
 * Implements common patterns for reliable test automation
 */
export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a URL with retry logic for network latency
   */
  async navigateTo(path: string, options?: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' }): Promise<void> {
    await this.page.goto(path, {
      waitUntil: options?.waitUntil ?? 'domcontentloaded',
      timeout: 30_000,
    });
  }

  /**
   * Wait for page to be fully loaded (handles dynamic content)
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    // Additional wait for any dynamic content
    await this.page.waitForTimeout(500);
  }

  /**
   * Safe click with auto-wait and retry
   */
  async safeClick(locator: Locator, options?: { timeout?: number }): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout: options?.timeout ?? 10_000 });
    await locator.click({ timeout: options?.timeout ?? 10_000 });
  }

  /**
   * Wait for element to be visible with custom timeout
   */
  async waitForVisible(locator: Locator, timeout: number = 10_000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Check if element is visible (non-throwing)
   */
  async isVisible(locator: Locator, timeout: number = 5_000): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get current URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Take screenshot with descriptive name
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true,
    });
  }
}
