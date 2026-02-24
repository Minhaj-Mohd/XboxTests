import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { ReportOutageDialog } from './ReportOutageDialog';

/**
 * Service status information interface
 */
export interface ServiceStatus {
  name: string;
  status: 'normal' | 'limited' | 'major-outage';
}

/**
 * List of all Xbox services on the status page
 */
export enum XboxService {
  GAMES_GAMING = 'Games & gaming',
  ACCOUNT_PROFILE = 'Account & profile',
  ONLINE_SAFETY_FAMILY = 'Online safety & family',
  STORE_SUBSCRIPTIONS = 'Store & subscriptions',
  FRIENDS_SOCIAL_ACTIVITY = 'Friends & social activity',
  SHARING_BROADCASTING = 'Sharing & broadcasting',
  DEVICES_NETWORKING = 'Devices & networking',
  MULTIPLAYER_GAMING = 'Multiplayer gaming',
  CLOUD_GAMING_REMOTE_PLAY = 'Cloud gaming & remote play',
  SUPPORT_SERVICES = 'Support & services',
  APPS_MOBILE = 'Apps & mobile',
}

/**
 * Page Object for Xbox Status Page
 * URL: https://support.xbox.com/en-US/xbox-live-status
 */
export class XboxStatusPage extends BasePage {
  // Page header
  readonly pageHeading: Locator;
  readonly pageDescription: Locator;

  // Status key legend
  readonly statusKeyHeading: Locator;
  readonly upAndRunningIndicator: Locator;
  readonly limitedIndicator: Locator;
  readonly majorOutageIndicator: Locator;

  // Services section heading
  readonly servicesHeading: Locator;

  // Footer elements
  readonly reportServiceOutageSection: Locator;
  readonly reportButton: Locator;

  // Feedback section
  readonly didThisResolveHeading: Locator;
  readonly yesButton: Locator;
  readonly noButton: Locator;

  constructor(page: Page) {
    super(page);

    // Page header
    this.pageHeading = page.getByRole('heading', { name: 'Xbox Status', level: 1 });
    this.pageDescription = page.getByText('Check this page for details on the status of Xbox features and functionality.');

    // Status key legend
    this.statusKeyHeading = page.getByRole('heading', { name: 'Status key', level: 2 });
    this.upAndRunningIndicator = page.getByText('Up and running');
    this.limitedIndicator = page.getByText('Limited');
    this.majorOutageIndicator = page.getByText('Major outage');

    // Services section heading (use exact match to avoid "All services up and running")
    this.servicesHeading = page.getByRole('heading', { name: 'Services', level: 2, exact: true });

    // Report service outage section
    this.reportServiceOutageSection = page.getByRole('region', { name: 'Report a service outage' });
    this.reportButton = page.getByRole('button', { name: 'Report' });

    // Feedback section
    this.didThisResolveHeading = page.getByRole('heading', { name: 'Did this resolve your issue?', level: 2 });
    this.yesButton = page.getByRole('button', { name: '"Yes"' });
    this.noButton = page.getByRole('button', { name: '"No"' });
  }

  /**
   * Navigate to Xbox Status Page
   */
  async goto(): Promise<void> {
    await this.navigateTo('/en-US/xbox-live-status');
    await this.waitForPageLoad();
  }

  /**
   * Verify page is loaded correctly
   */
  async verifyPageLoaded(): Promise<void> {
    await expect(this.pageHeading).toBeVisible({ timeout: 15_000 });
    await expect(this.servicesHeading).toBeVisible();
    expect(this.getCurrentUrl()).toContain('/xbox-live-status');
  }

  /**
   * Get the service row button locator for a specific service
   */
  getServiceButton(serviceName: XboxService | string): Locator {
    return this.page.getByRole('button', { name: new RegExp(`${serviceName};.*`, 'i') });
  }

  /**
   * Get the "More options" menu item (ellipsis) for a specific service
   */
  getMoreOptionsMenuItem(serviceName: XboxService | string): Locator {
    return this.page.getByRole('menuitem', { name: `More options for ${serviceName}` });
  }

  /**
   * Click the "More options" menu (ellipsis) for a specific service
   */
  async clickMoreOptionsForService(serviceName: XboxService | string): Promise<void> {
    const moreOptionsMenuItem = this.getMoreOptionsMenuItem(serviceName);
    await this.safeClick(moreOptionsMenuItem);
    // Wait for menu to appear
    await this.page.waitForTimeout(300);
  }

  /**
   * Get the "Report an outage" menu item
   */
  get reportAnOutageMenuItem(): Locator {
    return this.page.getByRole('menuitem', { name: 'Report an outage' });
  }

  /**
   * Get the "Troubleshoot" menu item
   */
  get troubleshootMenuItem(): Locator {
    return this.page.getByRole('menuitem', { name: 'Troubleshoot' });
  }

  /**
   * Click "Report an outage" for a specific service
   * Opens the Report Outage dialog
   */
  async reportOutageForService(serviceName: XboxService | string): Promise<ReportOutageDialog> {
    // Click the ellipsis menu for the service
    await this.clickMoreOptionsForService(serviceName);

    // Click "Report an outage" menu item
    await this.safeClick(this.reportAnOutageMenuItem);

    // Return the dialog page object
    const dialog = new ReportOutageDialog(this.page);
    await dialog.waitForDialogToOpen();
    return dialog;
  }

  /**
   * Expand a service to see details
   */
  async expandService(serviceName: XboxService | string): Promise<void> {
    const serviceButton = this.getServiceButton(serviceName);
    await this.safeClick(serviceButton);
    // Wait for expansion animation
    await this.page.waitForTimeout(300);
  }

  /**
   * Get all visible services
   */
  async getVisibleServices(): Promise<string[]> {
    const services: string[] = [];
    for (const service of Object.values(XboxService)) {
      const button = this.getServiceButton(service);
      if (await this.isVisible(button, 2_000)) {
        services.push(service);
      }
    }
    return services;
  }

  /**
   * Verify all services are displayed
   */
  async verifyAllServicesDisplayed(): Promise<void> {
    for (const service of Object.values(XboxService)) {
      const button = this.getServiceButton(service);
      await expect(button).toBeVisible({ timeout: 5_000 });
    }
  }
}
