import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Options for "What's not working?" question
 */
export enum WhatsNotWorkingOption {
  CLUBS = 'Clubs',
  FRIENDS_LIST = 'Friends list',
  MESSAGING = 'Messaging',
  PARTIES_AND_INVITES = 'Parties and invites',
  LEADERBOARDS = 'Leaderboards',
  OTHER = 'Other',
}

/**
 * Page Object for the "Tell us more" / Report Outage Dialog
 * This dialog appears when reporting an outage for any Xbox service
 */
export class ReportOutageDialog extends BasePage {
  // Dialog container
  readonly dialog: Locator;
  readonly dialogTitle: Locator;
  readonly closeButton: Locator;

  // Info section
  readonly thankYouMessage: Locator;
  readonly questionsCount: Locator;
  readonly timeToComplete: Locator;

  // Question 1: What's not working? (Mandatory)
  readonly question1Region: Locator;
  readonly question1Label: Locator;
  readonly radioGroup: Locator;
  readonly clubsRadio: Locator;
  readonly friendsListRadio: Locator;
  readonly messagingRadio: Locator;
  readonly partiesAndInvitesRadio: Locator;
  readonly leaderboardsRadio: Locator;
  readonly otherRadio: Locator;
  readonly otherTextbox: Locator;

  // Question 2: Additional feedback (Optional)
  readonly question2Region: Locator;
  readonly question2Label: Locator;
  readonly additionalFeedbackTextbox: Locator;
  readonly characterLimitText: Locator;

  // Footer elements
  readonly privacyStatementLink: Locator;
  readonly submitFeedbackButton: Locator;

  // Confirmation dialog elements
  readonly confirmationDialog: Locator;
  readonly confirmationHeading: Locator;
  readonly confirmationMessage: Locator;
  readonly confirmYesButton: Locator;
  readonly confirmNoButton: Locator;

  constructor(page: Page) {
    super(page);

    // Dialog container
    this.dialog = page.getByRole('dialog', { name: 'Tell us more' });
    this.dialogTitle = page.getByRole('heading', { name: 'Tell us more', level: 2 });
    this.closeButton = page.getByRole('button', { name: 'Close' });

    // Info section
    this.thankYouMessage = page.getByText('Thanks for sharing your feedback. We appreciate it.');
    this.questionsCount = page.getByText('2 questions');
    this.timeToComplete = page.getByText('1 minute to complete');

    // Question 1: What's not working?
    this.question1Region = page.getByRole('region', { name: "What's not working?" });
    this.question1Label = page.getByText("What's not working?");
    this.radioGroup = page.getByRole('radiogroup');
    this.clubsRadio = page.getByRole('radio', { name: 'Clubs' });
    this.friendsListRadio = page.getByRole('radio', { name: 'Friends list' });
    this.messagingRadio = page.getByRole('radio', { name: 'Messaging' });
    this.partiesAndInvitesRadio = page.getByRole('radio', { name: 'Parties and invites' });
    this.leaderboardsRadio = page.getByRole('radio', { name: 'Leaderboards' });
    this.otherRadio = page.locator('input[type="radio"]').last();
    this.otherTextbox = page.getByRole('textbox', { name: 'Other' });

    // Question 2: Additional feedback (Optional)
    this.question2Region = page.getByRole('region', { name: 'Additional feedback? (optional)' });
    this.question2Label = page.getByText('Additional feedback? (optional)');
    this.additionalFeedbackTextbox = page.getByRole('textbox', { name: 'Type your response' });
    this.characterLimitText = page.getByText(/4000 characters remain/);

    // Footer elements
    this.privacyStatementLink = page.getByRole('link', { name: 'Privacy statement' });
    this.submitFeedbackButton = page.getByRole('button', { name: 'Submit feedback' });

    // Confirmation dialog elements
    this.confirmationDialog = page.getByRole('dialog', { name: 'Are you sure you want to leave?' });
    this.confirmationHeading = page.getByRole('heading', { name: 'Are you sure you want to leave?', level: 2 });
    this.confirmationMessage = page.getByText("Your answers won't be submitted.");
    this.confirmYesButton = page.getByRole('button', { name: 'Yes' });
    this.confirmNoButton = page.getByRole('button', { name: 'No' });
  }

  /**
   * Wait for the dialog to open
   */
  async waitForDialogToOpen(): Promise<void> {
    // Wait for dialog title to be visible (more reliable than dialog container)
    await expect(this.dialogTitle).toBeVisible({ timeout: 10_000 });
  }

  /**
   * Verify the dialog is displayed correctly
   */
  async verifyDialogDisplayed(): Promise<void> {
    await expect(this.dialogTitle).toBeVisible();
    await expect(this.closeButton).toBeVisible();
    await expect(this.thankYouMessage).toBeVisible();
    await expect(this.questionsCount).toBeVisible();
    await expect(this.timeToComplete).toBeVisible();
  }

  /**
   * Verify Question 1 is displayed correctly with all options
   */
  async verifyQuestion1Displayed(): Promise<void> {
    await expect(this.question1Label).toBeVisible();
    await expect(this.clubsRadio).toBeVisible();
    await expect(this.friendsListRadio).toBeVisible();
    await expect(this.messagingRadio).toBeVisible();
    await expect(this.partiesAndInvitesRadio).toBeVisible();
    await expect(this.leaderboardsRadio).toBeVisible();
    await expect(this.otherTextbox).toBeVisible();
  }

  /**
   * Verify Question 2 is displayed correctly
   */
  async verifyQuestion2Displayed(): Promise<void> {
    await expect(this.question2Label).toBeVisible();
    await expect(this.additionalFeedbackTextbox).toBeVisible();
    await expect(this.characterLimitText).toBeVisible();
  }

  /**
   * Verify privacy statement link
   */
  async verifyPrivacyStatementLink(): Promise<void> {
    await expect(this.privacyStatementLink).toBeVisible();
    await expect(this.privacyStatementLink).toHaveAttribute(
      'href',
      'https://go.microsoft.com/fwlink/?LinkId=521839'
    );
  }

  /**
   * Verify submit button is disabled initially
   */
  async verifySubmitButtonDisabled(): Promise<void> {
    await expect(this.submitFeedbackButton).toBeDisabled();
  }

  /**
   * Verify submit button is enabled
   */
  async verifySubmitButtonEnabled(): Promise<void> {
    await expect(this.submitFeedbackButton).toBeEnabled();
  }

  /**
   * Select an option for "What's not working?"
   */
  async selectWhatsNotWorkingOption(option: WhatsNotWorkingOption): Promise<void> {
    // Click on the label text instead of the radio button directly
    // This avoids interception issues
    switch (option) {
      case WhatsNotWorkingOption.CLUBS:
        await this.page.getByText('Clubs', { exact: true }).click();
        break;
      case WhatsNotWorkingOption.FRIENDS_LIST:
        await this.page.getByText('Friends list', { exact: true }).click();
        break;
      case WhatsNotWorkingOption.MESSAGING:
        await this.page.getByText('Messaging', { exact: true }).click();
        break;
      case WhatsNotWorkingOption.PARTIES_AND_INVITES:
        await this.page.getByText('Parties and invites', { exact: true }).click();
        break;
      case WhatsNotWorkingOption.LEADERBOARDS:
        await this.page.getByText('Leaderboards', { exact: true }).click();
        break;
      case WhatsNotWorkingOption.OTHER:
        await this.otherTextbox.click();
        break;
    }
    // Wait for state update
    await this.page.waitForTimeout(300);
  }

  /**
   * Enter text in the "Other" textbox
   */
  async enterOtherText(text: string): Promise<void> {
    await this.otherTextbox.fill(text);
  }

  /**
   * Enter additional feedback
   */
  async enterAdditionalFeedback(feedback: string): Promise<void> {
    await this.additionalFeedbackTextbox.fill(feedback);
  }

  /**
   * Verify character count updates correctly
   */
  async verifyCharacterCount(expectedRemaining: number): Promise<void> {
    await expect(this.page.getByText(`${expectedRemaining} characters remain`)).toBeVisible();
  }

  /**
   * Click the close button
   */
  async clickCloseButton(): Promise<void> {
    await this.safeClick(this.closeButton);
  }

  /**
   * Click submit feedback button
   */
  async clickSubmitFeedback(): Promise<void> {
    await this.safeClick(this.submitFeedbackButton);
  }

  /**
   * Verify confirmation dialog appears with correct content
   */
  async verifyConfirmationDialogDisplayed(): Promise<void> {
    await expect(this.confirmationHeading).toBeVisible({ timeout: 5_000 });
    await expect(this.confirmationMessage).toBeVisible();
    await expect(this.confirmYesButton).toBeVisible();
    await expect(this.confirmNoButton).toBeVisible();
  }

  /**
   * Click Yes on confirmation dialog (closes the form)
   */
  async confirmYes(): Promise<void> {
    await this.safeClick(this.confirmYesButton);
    // Wait for dialog to close
    await expect(this.dialog).not.toBeVisible({ timeout: 5_000 });
  }

  /**
   * Click No on confirmation dialog (returns to form)
   */
  async confirmNo(): Promise<void> {
    await this.safeClick(this.confirmNoButton);
    // Wait for main dialog to be visible again
    await expect(this.dialogTitle).toBeVisible({ timeout: 5_000 });
  }

  /**
   * Verify form closes after clicking Yes
   */
  async verifyDialogClosed(): Promise<void> {
    await expect(this.dialogTitle).not.toBeVisible({ timeout: 5_000 });
  }

  /**
   * Full workflow: Fill and submit the form
   */
  async fillAndSubmitForm(
    whatsNotWorking: WhatsNotWorkingOption,
    additionalFeedback?: string
  ): Promise<void> {
    await this.selectWhatsNotWorkingOption(whatsNotWorking);

    if (additionalFeedback) {
      await this.enterAdditionalFeedback(additionalFeedback);
    }

    await this.verifySubmitButtonEnabled();
    await this.clickSubmitFeedback();
  }
}
