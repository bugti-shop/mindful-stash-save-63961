// Free tier limitations
export const FREE_LIMITS = {
  maxJars: 5,
  maxCategories: 2,
  transactionHistoryDays: 30,
  maxStickyNotes: 5,
  maxCurrencies: 1,
  defaultCurrency: '€',
  darkModes: 0,
  calculatorModes: ['monthly'],
  maxReminders: 0,
  maxActiveChallenges: 0,
  backupSync: false,
} as const;

export const PREMIUM_FEATURES = {
  unlimitedJars: true,
  unlimitedCategories: true,
  unlimitedHistory: true,
  allDarkModes: true,
  multipleCurrencies: true,
  advancedCalculator: true,
  backupSync: true,
  unlimitedNotes: true,
  trendsAnalytics: true,
  customReminders: 3,
  savingsChallenges: 1,
  noAds: true,
} as const;
