import { REVENUECAT_CONFIG } from '@/src/config/revenuecat';
import { Platform } from 'react-native';
import Purchases, {
    CustomerInfo,
    LOG_LEVEL,
    PurchasesError,
    PurchasesOffering,
    PurchasesPackage
} from 'react-native-purchases';

// RevenueCat Configuration
const REVENUECAT_API_KEY = {
  ios: REVENUECAT_CONFIG.IOS_API_KEY,
  android: REVENUECAT_CONFIG.ANDROID_API_KEY,
};

// Product identifiers - these should match your RevenueCat dashboard
export const PRODUCT_IDS = REVENUECAT_CONFIG.PRODUCT_IDS;

// Subscription status
export interface SubscriptionStatus {
  isSubscribed: boolean;
  isActive: boolean;
  productId?: string;
  expirationDate?: string;
  willRenew?: boolean;
}

class RevenueCatService {
  private isInitialized = false;
  private currentOfferings: PurchasesOffering[] | null = null;

  /**
   * Initialize RevenueCat with API key and user configuration
   */
  async initialize(userId?: string): Promise<void> {
    try {
      if (this.isInitialized) {
        console.log('RevenueCat already initialized');
        return;
      }

      const platform = Platform.OS;
      console.log('Platform detected:', platform);
      console.log('iOS API Key:', REVENUECAT_API_KEY.ios);
      console.log('Android API Key:', REVENUECAT_API_KEY.android);
      
      const apiKey = platform === 'ios' ? REVENUECAT_API_KEY.ios : 
                     platform === 'android' ? REVENUECAT_API_KEY.android : 
                     undefined;
      
      console.log('Selected API Key:', apiKey);
      
      if (!apiKey) {
        throw new Error(`No RevenueCat API key found for platform: ${platform}`);
      }

      // Configure RevenueCat
      await Purchases.configure({
        apiKey,
        appUserID: userId || undefined, // Use provided userId or anonymous
      });

      // Enable debug logs in development
      if (__DEV__) {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }

      this.isInitialized = true;
      console.log('RevenueCat initialized successfully');

      // Fetch offerings on initialization
      await this.fetchOfferings();
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
      throw error;
    }
  }

  /**
   * Set user ID for RevenueCat (call after user signs up)
   */
  async setUserId(userId: string): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      await Purchases.logIn(userId);
      console.log('RevenueCat user ID set:', userId);
    } catch (error) {
      console.error('Failed to set RevenueCat user ID:', error);
      throw error;
    }
  }

  /**
   * Fetch available offerings from RevenueCat
   */
  async fetchOfferings(): Promise<PurchasesOffering[]> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const offerings = await Purchases.getOfferings();
      this.currentOfferings = offerings.all;
      
      console.log('RevenueCat offerings fetched:', Object.keys(offerings.all));
      return offerings.all;
    } catch (error) {
      console.error('Failed to fetch RevenueCat offerings:', error);
      throw error;
    }
  }

  /**
   * Get current offerings (cached or fetch if needed)
   */
  async getOfferings(): Promise<PurchasesOffering[]> {
    if (this.currentOfferings) {
      return this.currentOfferings;
    }
    return await this.fetchOfferings();
  }

  /**
   * Get the current offering (usually the default)
   */
  async getCurrentOffering(): Promise<PurchasesOffering | null> {
    try {
      const offerings = await this.getOfferings();
      const current = await Purchases.getCurrentOffering();
      return current;
    } catch (error) {
      console.error('Failed to get current offering:', error);
      return null;
    }
  }

  /**
   * Purchase a package
   */
  async purchasePackage(packageToPurchase: PurchasesPackage): Promise<CustomerInfo> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log('Purchasing package:', packageToPurchase.identifier);
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      
      console.log('Purchase successful:', packageToPurchase.identifier);
      return customerInfo;
    } catch (error) {
      console.error('Purchase failed:', error);
      throw this.handlePurchaseError(error as PurchasesError);
    }
  }

  /**
   * Restore previous purchases
   */
  async restorePurchases(): Promise<CustomerInfo> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log('Restoring purchases...');
      const customerInfo = await Purchases.restorePurchases();
      
      console.log('Purchases restored successfully');
      return customerInfo;
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      throw error;
    }
  }

  /**
   * Check current subscription status
   */
  async checkSubscriptionStatus(): Promise<SubscriptionStatus> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const customerInfo = await Purchases.getCustomerInfo();
      const activeEntitlements = customerInfo.entitlements.active;
      
      // Check if user has any active subscription
      const hasActiveSubscription = Object.keys(activeEntitlements).length > 0;
      
      if (hasActiveSubscription) {
        const entitlement = Object.values(activeEntitlements)[0];
        return {
          isSubscribed: true,
          isActive: true,
          productId: entitlement.productIdentifier,
          expirationDate: entitlement.expirationDate,
          willRenew: entitlement.willRenew,
        };
      }

      return {
        isSubscribed: false,
        isActive: false,
      };
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      return {
        isSubscribed: false,
        isActive: false,
      };
    }
  }

  /**
   * Get customer info
   */
  async getCustomerInfo(): Promise<CustomerInfo> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      return await Purchases.getCustomerInfo();
    } catch (error) {
      console.error('Failed to get customer info:', error);
      throw error;
    }
  }

  /**
   * Handle purchase errors with user-friendly messages
   */
  private handlePurchaseError(error: PurchasesError): Error {
    switch (error.code) {
      case 'PURCHASES_ERROR_PRODUCT_NOT_AVAILABLE_FOR_PURCHASE':
        return new Error('This product is not available for purchase');
      case 'PURCHASES_ERROR_PAYMENT_PENDING':
        return new Error('Payment is pending. Please check your payment method');
      case 'PURCHASES_ERROR_PAYMENT_CANCELLED':
        return new Error('Payment was cancelled');
      case 'PURCHASES_ERROR_PAYMENT_INVALID':
        return new Error('Payment method is invalid');
      case 'PURCHASES_ERROR_PAYMENT_NOT_ALLOWED':
        return new Error('Payment is not allowed on this device');
      case 'PURCHASES_ERROR_PURCHASE_INVALID':
        return new Error('Purchase is invalid');
      case 'PURCHASES_ERROR_PURCHASE_NOT_ALLOWED':
        return new Error('Purchase is not allowed');
      case 'PURCHASES_ERROR_PURCHASE_ALREADY_OWNED':
        return new Error('You already own this product');
      case 'PURCHASES_ERROR_RECEIPT_ALREADY_IN_USE':
        return new Error('Receipt is already in use');
      case 'PURCHASES_ERROR_INVALID_RECEIPT':
        return new Error('Receipt is invalid');
      case 'PURCHASES_ERROR_MISSING_RECEIPT_FILE':
        return new Error('Receipt file is missing');
      case 'PURCHASES_ERROR_NETWORK_ERROR':
        return new Error('Network error. Please check your connection');
      case 'PURCHASES_ERROR_INVALID_CREDENTIALS':
        return new Error('Invalid credentials');
      case 'PURCHASES_ERROR_INVALID_APP_USER_ID':
        return new Error('Invalid user ID');
      case 'PURCHASES_ERROR_OPERATION_ALREADY_IN_PROGRESS_FOR_USER':
        return new Error('Operation already in progress');
      case 'PURCHASES_ERROR_INVALID_SUBSCRIBER_ATTRIBUTES':
        return new Error('Invalid subscriber attributes');
      case 'PURCHASES_ERROR_INVALID_MANAGED_PLAY_CONSOLE_ACCOUNT':
        return new Error('Invalid Google Play Console account');
      case 'PURCHASES_ERROR_PLAY_STORE_QUOTA_EXCEEDED':
        return new Error('Google Play Store quota exceeded');
      case 'PURCHASES_ERROR_PLAY_STORE_INVALID_PACKAGE_NAME':
        return new Error('Invalid package name');
      case 'PURCHASES_ERROR_PLAY_STORE_ACCOUNT_NOT_FOUND':
        return new Error('Google Play account not found');
      case 'PURCHASES_ERROR_PRODUCT_ALREADY_PURCHASED_ERROR':
        return new Error('Product already purchased');
      case 'PURCHASES_ERROR_PRODUCT_NOT_AVAILABLE_IN_CURRENT_STORE_FRONT':
        return new Error('Product not available in current store');
      case 'PURCHASES_ERROR_CUSTOMER_INFO_ERROR':
        return new Error('Failed to get customer info');
      case 'PURCHASES_ERROR_SYSTEM_ERROR':
        return new Error('System error occurred');
      case 'PURCHASES_ERROR_UNKNOWN_ERROR':
      default:
        return new Error('An unknown error occurred. Please try again');
    }
  }

  /**
   * Reset RevenueCat (for testing)
   */
  async reset(): Promise<void> {
    try {
      await Purchases.reset();
      this.isInitialized = false;
      this.currentOfferings = null;
      console.log('RevenueCat reset successfully');
    } catch (error) {
      console.error('Failed to reset RevenueCat:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const revenueCatService = new RevenueCatService();

// Export types for use in components
export type { CustomerInfo, PurchasesOffering, PurchasesPackage, SubscriptionStatus };

