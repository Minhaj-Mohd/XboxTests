import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for Xbox Support Home Page
 * URL: https://support.xbox.com/en-US/
 */
export class XboxSupportHomePage extends BasePage {
  // Navigation elements
  readonly microsoftLogo: Locator;
  readonly xboxLogo: Locator;
  readonly supportHomeLink: Locator;
  readonly xboxStatusLink: Locator;
  readonly helpTopicsButton: Locator;
  readonly moreButton: Locator;
  readonly searchButton: Locator;
  readonly signInButton: Locator;

  // Main content elements
  readonly mainHeading: Locator;
  readonly searchBox: Locator;

  // Section links
  readonly accountProfileLink: Locator;
  readonly subscriptionsBillingLink: Locator;
  readonly hardwareNetworkingLink: Locator;
  readonly familyOnlineSafetyLink: Locator;
  readonly gamesAppsLink: Locator;
  readonly friendsSocialActivityLink: Locator;

  constructor(page: Page) {
    super(page);

    // Navigation elements
    this.microsoftLogo = page.getByRole('link', { name: 'Microsoft' });
    this.xboxLogo = page.getByRole('link', { name: 'Xbox' }).first();
    this.supportHomeLink = page.getByRole('link', { name: 'Support home' });
    this.xboxStatusLink = page.getByRole('link', { name: 'Xbox status', exact: true });
    this.helpTopicsButton = page.getByRole('button', { name: /Help topics/i });
    this.moreButton = page.getByRole('button', { name: /More/i });
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.signInButton = page.getByRole('button', { name: /Sign in/i });

    // Main content elements
    this.mainHeading = page.getByRole('heading', { name: 'Hi, how can we help?', level: 1 });
    this.searchBox = page.getByRole('searchbox', { name: 'Hi, how can we help?' });

    // Section links
    this.accountProfileLink = page.getByRole('link', { name: 'Account & profile' });
    this.subscriptionsBillingLink = page.getByRole('link', { name: 'Subscriptions & billing' });
    this.hardwareNetworkingLink = page.getByRole('link', { name: 'Hardware & networking' });
    this.familyOnlineSafetyLink = page.getByRole('link', { name: 'Family & online safety' });
    this.gamesAppsLink = page.getByRole('link', { name: 'Games & apps' });
    this.friendsSocialActivityLink = page.getByRole('link', { name: 'Friends & social activity' });
  }

  /**
   * Navigate to Xbox Support Home Page
   */
  async goto(): Promise<void> {
    await this.navigateTo('/en-US/');
    await this.waitForPageLoad();
  }

  /**
   * Verify page is loaded correctly
   */
  async verifyPageLoaded(): Promise<void> {
    await expect(this.mainHeading).toBeVisible({ timeout: 15_000 });
    await expect(this.searchBox).toBeVisible();
    expect(this.getCurrentUrl()).toContain('/en-US');
  }

  /**
   * Navigate to Xbox Status page via navigation menu
   */
  async navigateToXboxStatus(): Promise<void> {
    await this.safeClick(this.xboxStatusLink);
    await this.page.waitForURL('**/xbox-live-status', { timeout: 15_000 });
  }

  /**
   * Search for a topic
   */
  async searchForTopic(searchTerm: string): Promise<void> {
    await this.searchBox.fill(searchTerm);
    await this.page.keyboard.press('Enter');
  }
}
