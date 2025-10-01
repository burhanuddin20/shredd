import Constants from 'expo-constants';

// RevenueCat Configuration
// Using Expo Constants for secure environment variable access
export const REVENUECAT_CONFIG = {
  // iOS API Key (from app.config.js)
  IOS_API_KEY: Constants.expoConfig?.extra?.REVENUECAT_IOS_API_KEY || 'appl_xxxxxxxxxxxxxxxxxxxxxxxx',
  
  // Android API Key (from app.config.js)  
  ANDROID_API_KEY: Constants.expoConfig?.extra?.REVENUECAT_ANDROID_API_KEY || 'goog_xxxxxxxxxxxxxxxxxxxxxxxx',
  
  PRODUCT_IDS: {
    MONTHLY: 'shredd_pro_monthly',
    YEARLY: 'shredd_pro_yearly',
  },
  
  ENTITLEMENT_ID: 'Pro',
  
  // Bundle ID (must match your app.json)
  BUNDLE_ID: 'com.shredd.fasting',
  
  // Dev settings
  DEV: {
    BYPASS_PAYWALL: __DEV__ && false, // Set to true to bypass paywall in dev mode
    ENABLE_DEBUG_LOGS: __DEV__,
  }
} as const;


