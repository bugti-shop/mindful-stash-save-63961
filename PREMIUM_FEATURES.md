# Premium Features Implementation

## Overview
The app now includes a comprehensive freemium model with feature gating for free vs premium users.

## Subscription Tiers

### Free Plan
- **5 jars maximum**
- **2 categories maximum**
- **30-day transaction history**
- **5 sticky notes maximum**
- **1 currency (€ Euro only)**
- **Monthly calculator only**
- **Light mode only (default dark mode)**
- **Manual entry only**

### Premium Plan ($2.99/month or $18.99/year)
- ✅ Unlimited jars & categories
- ✅ Unlimited transaction history
- ✅ All 6 dark modes (Ocean Blue, Forest Green, Sunset Orange, Rose Gold, Midnight Purple, Minimal Gray)
- ✅ Multiple currencies (12+ options)
- ✅ Advanced calculator (daily/weekly/monthly)
- ✅ Backup & sync
- ✅ Unlimited sticky notes
- ✅ Savings trends & analytics
- ✅ Custom reminders (3)
- ✅ Savings challenges (1 active)
- ✅ No ads

## Dark Mode Themes

### 1. Ocean Blue
- Deep blue ocean-inspired palette
- Perfect for calming savings experience

### 2. Forest Green
- Natural green forest theme
- Eco-friendly savings vibe

### 3. Sunset Orange
- Warm sunset gradient colors
- Energetic and motivating

### 4. Rose Gold
- Elegant rose and gold tones
- Sophisticated savings experience

### 5. Midnight Purple
- Rich purple midnight sky
- Mysterious and premium feel

### 6. Minimal Gray
- Clean grayscale design
- Professional and minimal

## Feature Gating Implementation

### Jar Creation Limit
- Free users see toast notification when attempting to create 6th jar
- Premium users have unlimited jars

### Category Creation Limit
- Free users limited to 2 categories
- Premium users have unlimited categories

### Currency Selector
- Free users see disabled selector locked to € (Euro)
- Premium message displayed: "💎 Premium members can choose from 12+ currencies"
- Premium users can select from 12+ currency options

### Calculator Modes
- Free users only see "Monthly" savings calculation
- Daily/Weekly options shown with premium upsell message
- Premium users see all three calculation modes

### Transaction History
- Free users see last 30 days of transactions only
- Banner message: "📅 Free plan shows last 30 days"
- Premium users see unlimited history

### Sticky Notes
- Free users limited to 5 sticky notes
- Toast notification when limit reached
- Premium users have unlimited notes

### Dark Mode Themes
- Free users only have Light mode and Default Dark mode
- Premium themes show lock icon and "Premium" badge
- Clicking locked theme opens premium upgrade dialog

## UI Components

### Settings Dialog
Located in header (gear icon), contains 3 tabs:
1. **Premium Tab** - Shows feature list, pricing, and purchase buttons
2. **Theme Tab** - Shows all theme options with lock/unlock states
3. **Notifications Tab** - Notification settings (existing feature)

### Premium Settings Component
- Feature checklist with checkmarks
- Two pricing cards (Monthly/Yearly)
- "Popular" and "Best Value" badges
- Save 47% messaging for yearly plan
- Restore Purchases button

### Theme Switcher Component
- Grid layout showing all themes
- Theme preview boxes
- Lock icons for premium themes
- Active theme indicator
- Click to apply (free users see upgrade prompt)

### Feature Gate Component
- Reusable component for gating features
- Shows upgrade dialog when needed
- Can show custom fallback UI

## Technical Implementation

### Context: SubscriptionContext
- Manages subscription state
- Provides `tier` (free/premium)
- Provides `canUseFeature()` helper
- Handles purchase flows (placeholder for Google Play Billing)
- Stores subscription in localStorage

### Free Limits Configuration
All limits defined in `FREE_LIMITS` constant:
```typescript
{
  maxJars: 5,
  maxCategories: 2,
  transactionHistoryDays: 30,
  maxStickyNotes: 5,
  maxCurrencies: 1,
  darkModes: 0,
  calculatorModes: ['monthly'],
  maxReminders: 0,
  maxActiveChallenges: 0,
}
```

### Toast Notifications
User-friendly messages when limits reached:
- "Jar Limit Reached - Free plan is limited to 5 jars. Upgrade to Premium for unlimited jars!"
- Similar messages for all other limits

## Google Play Billing Integration

See `GOOGLE_PLAY_BILLING_SETUP.md` for complete setup instructions.

### Product IDs
- Monthly: `premium_monthly` ($2.99/month)
- Yearly: `premium_yearly` ($18.99/year)

### Current Status
- UI and feature gating fully implemented
- Placeholder purchase functions ready
- Requires actual Google Play Billing library integration
- See setup guide for production deployment steps

## Testing Considerations

### Testing Free Limits
1. Create 5 jars → 6th should show limit message
2. Create 2 categories → 3rd should show limit message
3. Add 5 sticky notes → 6th should show limit message
4. View transaction history → Only last 30 days visible
5. Try currency selector → Should be locked to €
6. Check calculator → Only monthly visible

### Testing Premium Features
1. Toggle localStorage: `subscription_tier = 'premium'`
2. Verify all limits removed
3. Test all dark modes
4. Test all currencies
5. Test full calculator (daily/weekly/monthly)
6. Verify unlimited transaction history

## Future Enhancements

1. **Backend Validation** - Move subscription checks to server
2. **Receipt Verification** - Validate purchases with Google Play API
3. **Subscription Sync** - Real-time subscription status updates
4. **Analytics** - Track feature usage and upgrade conversions
5. **A/B Testing** - Test different pricing and messaging
6. **Trial Period** - Offer 7-day free trial
7. **Promo Codes** - Support discount codes
8. **Family Plan** - Multi-user subscriptions
