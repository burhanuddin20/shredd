import Constants from 'expo-constants';

export const ENV = {
  USE_MOCK_PAYWALL: String(Constants.expoConfig?.extra?.USE_MOCK_PAYWALL ?? 'false') === 'true',
};
