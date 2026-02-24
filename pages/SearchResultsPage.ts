import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for Xbox Support Search Results Page
 * URL: https://support.xbox.com/en-US/search?phrase=...
 */
export class SearchResultsPage extends BasePage {
  // Page elements
  readonly searchResultsHeading: Locator;
  readonly searchBox: Locator;
  readonly clearButton: Locator;
  readonly searchButton: Locator;

  // Virtual Agent section
  readonly virtualAgentSummary: Locator;
  readonly openChatButton: Locator;

  // Results section
  readonly resultsTab: Locator;
  readonly resultsCountStatus: Locator;
  readonly searchResultCards: Locator;
  readonly loadMoreButton: Locator;

  // Feedback section
  readonly giveFeedbackButton: Locator;

  constructor(page: Page) {
    super(page);

    // Page elements
    this.searchResultsHeading = page.getByRole('heading', { name: 'Search results', level: 1 });
    this.searchBox = page.getByRole('searchbox', { name: 'Hi, how can we help?' });
    this.clearButton = page.getByRole('button', { name: 'Clear' });
    this.searchButton = page.getByRole('button', { name: 'Search' }).last();

    // Virtual Agent section
    this.virtualAgentSummary = page.getByRole('heading', { name: /Support Virtual Agent Summary/i });
    this.openChatButton = page.getByRole('button', { name: 'Open chat' });

    // Results section - Updated for more reliable selection
    this.resultsTab = page.getByRole('tab').filter({ hasText: /Xbox support/i });
    this.resultsCountStatus = page.getByText(/\d+\s+Xbox support search results found/);
    this.searchResultCards = page.locator('h2 a').filter({ hasText: /./ });
    this.loadMoreButton = page.getByRole('button', { name: /Load more/i });

    // Feedback section
    this.giveFeedbackButton = page.getByRole('button', { name: 'Give feedback' });
  }

  /**
   * Verify search results page is loaded correctly
   */
  async verifyPageLoaded(): Promise<void> {
    await expect(this.searchResultsHeading).toBeVisible({ timeout: 15_000 });
    await expect(this.searchBox).toBeVisible();
    expect(this.getCurrentUrl()).toContain('/search');
  }

  /**
   * Verify search results are displayed
   */
  async verifyResultsDisplayed(): Promise<void> {
    await expect(this.resultsTab).toBeVisible({ timeout: 10_000 });
    await expect(this.resultsCountStatus).toBeVisible();
  }

  /**
   * Get the number of results from the results count status
   */
  async getResultsCount(): Promise<number> {
    try {
      const statusText = await this.resultsCountStatus.textContent({ timeout: 10_000 });
      const match = statusText?.match(/(\d+)/); 
      return match ? parseInt(match[1], 10) : 0;
    } catch {
      // Fallback: count visible article cards
      return await this.searchResultCards.count();
    }
  }

  /**
   * Get the current search term from the search box
   */
  async getCurrentSearchTerm(): Promise<string> {
    return await this.searchBox.inputValue();
  }

  /**
   * Click on a search result article by index (0-based)
   */
  async clickSearchResultByIndex(index: number): Promise<void> {
    const result = this.searchResultCards.nth(index);
    await this.safeClick(result);
  }

  /**
   * Click on a search result article by partial title match
   */
  async clickSearchResultByTitle(titleSubstring: string): Promise<void> {
    const result = this.searchResultCards.filter({ hasText: titleSubstring }).first();
    await this.safeClick(result);
  }

  /**
   * Clear the search box
   */
  async clearSearch(): Promise<void> {
    await this.safeClick(this.clearButton);
    await expect(this.searchBox).toHaveValue('');
  }

  /**
   * Perform a new search from the results page
   */
  async searchForTopic(searchTerm: string): Promise<void> {
    await this.searchBox.clear();
    await this.searchBox.fill(searchTerm);
    await this.page.keyboard.press('Enter');
    await this.page.waitForURL(/\/search\?phrase=/);
  }

  /**
   * Load more results
   */
  async loadMoreResults(): Promise<void> {
    await this.loadMoreButton.scrollIntoViewIfNeeded();
    await this.safeClick(this.loadMoreButton);
    // Wait for new results to load
    await this.page.waitForTimeout(1000);
  }

  /**
   * Get the URL of this page
   */
  getCurrentUrl(): string {
    return this.page.url();
  }
}
