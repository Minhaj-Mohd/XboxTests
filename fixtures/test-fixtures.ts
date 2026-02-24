import { test as base, expect } from '@playwright/test';
import {
  XboxSupportHomePage,
  XboxStatusPage,
  ReportOutageDialog,
  SearchResultsPage,
} from '../pages';

/**
 * Custom test fixtures for Xbox Support Portal tests
 * Provides pre-initialized page objects for cleaner test code
 */
interface XboxTestFixtures {
  xboxHomePage: XboxSupportHomePage;
  xboxStatusPage: XboxStatusPage;
  searchResultsPage: SearchResultsPage;
}

/**
 * Extended test with Xbox-specific fixtures
 */
export const test = base.extend<XboxTestFixtures>({
  xboxHomePage: async ({ page }, use) => {
    const homePage = new XboxSupportHomePage(page);
    await use(homePage);
  },

  xboxStatusPage: async ({ page }, use) => {
    const statusPage = new XboxStatusPage(page);
    await use(statusPage);
  },

  searchResultsPage: async ({ page }, use) => {
    const searchPage = new SearchResultsPage(page);
    await use(searchPage);
  },
});

export { expect };
