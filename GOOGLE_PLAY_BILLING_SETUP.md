# Google Play Billing Integration Guide

This app includes a premium subscription system with placeholder implementations. To enable actual Google Play billing, follow these steps:

## Prerequisites

1. Google Play Console account
2. App published (at least in internal testing)
3. Google Play Developer account ($25 one-time fee)

## Product Setup in Google Play Console

1. Go to Google Play Console
2. Select your app
3. Navigate to "Monetization" > "Products" > "Subscriptions"
4. Create two subscription products:

### Monthly Subscription
- Product ID: `premium_monthly`
- Name: Premium Monthly
- Description: Monthly subscription to Mindful Stash Save Premium
- Price: $2.99 USD
- Billing Period: 1 month
- Free Trial: Optional (e.g., 7 days)

### Yearly Subscription
- Product ID: `premium_yearly`
- Name: Premium Yearly
- Description: Yearly subscription to Mindful Stash Save Premium
- Price: $18.99 USD
- Billing Period: 1 year
- Free Trial: Optional (e.g., 7 days)

## Implementation Options

### Option 1: Cordova Plugin Purchase (Recommended)

Install the plugin:
```bash
npm install cordova-plugin-purchase
npx cap sync
```

Update `src/contexts/SubscriptionContext.tsx` to use the plugin.

### Option 2: Native Android Implementation

Create a native Android module that interfaces with Google Play Billing Library v5+.

1. Add billing dependency in `android/app/build.gradle`:
```gradle
dependencies {
    implementation 'com.android.billingclient:billing:5.2.1'
}
```

2. Create a Capacitor plugin to wrap the billing functionality
3. Update the subscription context to call your native methods

## Testing

1. Add test accounts in Google Play Console (Settings > License Testing)
2. Use these test accounts to test purchases without charges
3. Test scenarios:
   - New subscription purchase
   - Restore purchases
   - Subscription renewal
   - Subscription cancellation
   - Account switching

## Current Implementation

The app currently uses localStorage for subscription status. This is **NOT secure** for production and should be replaced with:

1. Server-side subscription validation
2. Google Play Developer API for receipt verification
3. Secure backend to manage subscription status
4. Regular subscription status checks

## Security Best Practices

- Never trust client-side subscription status alone
- Always verify receipts on your backend server
- Use Google Play Developer API to check subscription status
- Implement proper error handling for network issues
- Handle subscription lifecycle events (renewal, cancellation, etc.)

## Production Checklist

- [ ] Create products in Google Play Console
- [ ] Implement actual billing plugin
- [ ] Set up backend for receipt verification
- [ ] Add server-side subscription management
- [ ] Test all purchase flows
- [ ] Test subscription lifecycle
- [ ] Add proper error handling
- [ ] Implement subscription status sync
- [ ] Add analytics tracking for purchases
- [ ] Test on multiple devices and Android versions

## Useful Resources

- [Google Play Billing Documentation](https://developer.android.com/google/play/billing)
- [Cordova Plugin Purchase](https://github.com/j3k0/cordova-plugin-purchase)
- [Google Play Developer API](https://developers.google.com/android-publisher)
