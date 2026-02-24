/**
 * Test data constants for Xbox Support Portal tests
 */

/**
 * URLs used in tests
 */
export const URLS = {
  HOME: '/en-US/',
  XBOX_STATUS: '/en-US/xbox-live-status',
  PRIVACY_STATEMENT: 'https://go.microsoft.com/fwlink/?LinkId=521839',
  MICROSOFT_PRIVACY: 'https://privacy.microsoft.com',
} as const;

/**
 * Expected text content for validation
 */
export const EXPECTED_TEXT = {
  PAGE_TITLES: {
    HOME: 'Xbox Support',
    STATUS: 'Xbox Status | Xbox Support',
  },
  DIALOG: {
    TELL_US_MORE_TITLE: 'Tell us more',
    THANK_YOU_MESSAGE: 'Thanks for sharing your feedback. We appreciate it.',
    QUESTIONS_COUNT: '2 questions',
    TIME_TO_COMPLETE: '1 minute to complete',
    QUESTION_1: "What's not working?",
    QUESTION_2: 'Additional feedback? (optional)',
    CHARACTER_LIMIT: '4000 characters remain',
    SUBMIT_BUTTON: 'Submit feedback',
    CLOSE_BUTTON: 'Close',
  },
  CONFIRMATION: {
    TITLE: 'Are you sure you want to leave?',
    MESSAGE: "Your answers won't be submitted.",
    YES_BUTTON: 'Yes',
    NO_BUTTON: 'No',
  },
} as const;

/**
 * "What's not working?" options for Friends & social activity
 */
export const FRIENDS_SOCIAL_OPTIONS = [
  'Clubs',
  'Friends list',
  'Messaging',
  'Parties and invites',
  'Leaderboards',
] as const;

/**
 * Character limits
 */
export const CHARACTER_LIMITS = {
  ADDITIONAL_FEEDBACK: 4000,
} as const;

/**
 * Timeout configurations for different scenarios
 */
export const TIMEOUTS = {
  PAGE_LOAD: 15_000,
  ELEMENT_VISIBLE: 10_000,
  DIALOG_OPEN: 10_000,
  ANIMATION: 500,
  NETWORK_LATENCY: 30_000,
} as const;
