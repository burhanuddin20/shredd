import Constants from 'expo-constants';

export const ENV = {
  BYPASS_PAYWALL: String(Constants.expoConfig?.extra?.BYPASS_PAYWALL ?? 'false') === 'true',
  ENABLE_REVENUECAT: String(Constants.expoConfig?.extra?.ENABLE_REVENUECAT ?? 'true') === 'true',
};
