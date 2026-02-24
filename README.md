# Xbox Support Portal - Playwright E2E Tests

## Overview

This project contains end-to-end tests for the Xbox Support Portal using Playwright with TypeScript. The tests are designed to be reliable, maintainable, and CI/CD pipeline ready.

## Project Structure

```
XboxTests/
├── fixtures/              # Test fixtures and test data
│   ├── test-fixtures.ts   # Custom Playwright fixtures
│   └── test-data.ts       # Test constants and expected values
├── pages/                 # Page Object Models
│   ├── BasePage.ts        # Base page with common functionality
│   ├── XboxSupportHomePage.ts
│   ├── XboxStatusPage.ts
│   ├── ReportOutageDialog.ts
│   └── index.ts           # Barrel export
├── tests/                 # Test specifications
│   └── report-outage-survey.spec.ts
├── utils/                 # Utility functions
│   └── test-helpers.ts
├── playwright.config.ts   # Playwright configuration
├── package.json
├── tsconfig.json
└── README.md
```

## Test Coverage

### Test Case: TC-30648805
**Title:** [XBL] Verify if user is able to submit 'Report an outage' survey for Friends & social activity

#### Covered Scenarios:
1. ✅ Navigate to Xbox Support home page
2. ✅ Click on Xbox Live status menu
3. ✅ Click ellipses for Friends & social activity
4. ✅ Select 'Report an outage' option
5. ✅ Verify 'Tell us more' popup displays
6. ✅ Verify Question 1 (mandatory) with all radio options
7. ✅ Verify Question 2 (optional) with character limit
8. ✅ Verify Privacy statement hyperlink
9. ✅ Verify Submit button enables after selection
10. ✅ Verify Close confirmation dialog
11. ✅ Verify Yes/No behavior on confirmation

## Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Configuration

Copy the example config and fill in your values:

```bash
cp config.example.json config.json
```

Then edit `config.json` with your Azure Key Vault URL, Azure DevOps org, project, plan ID, suite ID, and PAT secret name. The file is git-ignored to prevent accidental exposure of sensitive values.

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in headed mode (visible browser)
```bash
npm run test:headed
```

### Run tests in debug mode
```bash
npm run test:debug
```

### Run tests with UI
```bash
npm run test:ui
```

### Run tests for CI/CD
```bash
npm run test:ci
```

### View test report
```bash
npm run test:report
```

## Configuration

### Browser Support
- Chromium (Desktop Chrome)
- Firefox
- WebKit (Desktop Safari)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

### Environment Variables
- `CI`: Set to `true` in CI/CD pipelines for optimized settings

### Timeouts
| Scenario | Timeout |
|----------|---------|
| Test execution | 60s |
| Assertions | 10s |
| Navigation | 30s |
| Actions | 15s |

## Page Object Model

All page objects extend `BasePage` which provides:
- Safe click with auto-wait
- Navigation with retry logic
- Screenshot capture
- Element visibility checks

### Example Usage

```typescript
import { test, expect } from '../fixtures/test-fixtures';
import { XboxStatusPage, XboxService } from '../pages';

test('example test', async ({ page }) => {
  const statusPage = new XboxStatusPage(page);
  await statusPage.goto();
  
  const dialog = await statusPage.reportOutageForService(
    XboxService.FRIENDS_SOCIAL_ACTIVITY
  );
  
  await dialog.verifyDialogDisplayed();
});
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Playwright Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Run tests
        run: npm run test:ci
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: |
            playwright-report/
            test-results/
```

### Azure DevOps Pipeline Example

```yaml
trigger:
  - main

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '20.x'

  - script: npm ci
    displayName: 'Install dependencies'

  - script: npx playwright install --with-deps
    displayName: 'Install Playwright'

  - script: npm run test:ci
    displayName: 'Run Playwright tests'

  - task: PublishTestResults@2
    condition: always()
    inputs:
      testResultsFormat: 'JUnit'
      testResultsFiles: 'test-results/junit.xml'

  - task: PublishPipelineArtifact@1
    condition: always()
    inputs:
      targetPath: 'playwright-report'
      artifact: 'playwright-report'
```

## Best Practices

1. **Wait Strategies**: Use explicit waits over arbitrary timeouts
2. **Assertions**: Clear assertions with meaningful error messages
3. **Page Objects**: Encapsulate page interactions in POM classes
4. **Test Isolation**: Each test is independent and can run in parallel
5. **Retry Logic**: Built-in retries for flaky network conditions
6. **Screenshots**: Automatic capture on failure for debugging

## Troubleshooting

### Tests timing out
- Increase timeouts in `playwright.config.ts`
- Check network connectivity
- Verify page elements haven't changed

### Element not found
- Update locators in Page Object files
- Use Playwright Inspector: `npm run test:debug`

### CI failures
- Check if browser installation succeeded
- Review artifacts for screenshots and traces
