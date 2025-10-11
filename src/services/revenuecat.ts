import { REVENUECAT_CONFIG } from '@/src/config/revenuecat';
import { Platform } from 'react-native';
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PurchasesError,
  PurchasesOffering,
  PurchasesPackage
} from 'react-native-purchases';

// Logging helpers with consistent tags
const LOG_TAG = {
  DEBUG: '[RC DEBUG]',
  INFO: '[RC INFO]',
  WARN: '[RC WARN]',
  ERROR: '[RC ERROR]',
  OFFERINGS: '[RC OFFERINGS]',
  PURCHASE: '[RC PURCHASE]',
  INIT: '[RC INIT]',
};

const log = {
  debug: (message: string, data?: any) => {
    console.log(LOG_TAG.DEBUG, message, data || '');
  },
  info: (message: string, data?: any) => {
    console.log(LOG_TAG.INFO, message, data || '');
  },
  warn: (message: string, data?: any) => {
    console.warn(LOG_TAG.WARN, message, data || '');
  },
  error: (message: string, error?: any) => {
    console.error(LOG_TAG.ERROR, message, error || '');
  },
  offerings: (message: string, data?: any) => {
    console.log(LOG_TAG.OFFERINGS, message, data || '');
  },
  purchase: (message: string, data?: any) => {
    console.log(LOG_TAG.PURCHASE, message, data || '');
  },
  init: (message: string, data?: any) => {
    console.log(LOG_TAG.INIT, message, data || '');
  },
};

// RevenueCat Configuration
const REVENUECAT_API_KEY = {
  ios: REVENUECAT_CONFIG.IOS_API_KEY,
  android: REVENUECAT_CONFIG.ANDROID_API_KEY,
};

// Product identifiers - these should match your RevenueCat dashboard
export const PRODUCT_IDS = REVENUECAT_CONFIG.PRODUCT_IDS;

// Subscription status
interface SubscriptionStatusType {
  isSubscribed: boolean;
  isActive: boolean;
  productId?: string;
  expirationDate?: string | null;
  willRenew?: boolean;
}

export type SubscriptionStatus = SubscriptionStatusType;

class RevenueCatService {
  private isInitialized = false;
  private isInitializing = false;
  private currentOffering: PurchasesOffering | null = null;

  /**
   * Initialize RevenueCat with API key and user configuration
   */
  async initialize(userId?: string): Promise<void> {
    try {
      if (this.isInitialized) {
        log.init('✅ Already initialized');
        return;
      }

      if (this.isInitializing) {
        log.init('⏳ Initialization already in progress, waiting...');
        // Wait for initialization to complete
        while (this.isInitializing) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        return;
      }

      this.isInitializing = true;
      log.init('🚀 Starting RevenueCat initialization...');

      const platform = Platform.OS;
      log.init(`📱 Platform detected: ${platform}`);
      
      const apiKey = platform === 'ios' ? REVENUECAT_API_KEY.ios : 
                     platform === 'android' ? REVENUECAT_API_KEY.android : 
                     undefined;
      
      log.init(`🔑 API Key for ${platform}: ${apiKey ? apiKey.substring(0, 12) + '...' : 'NOT FOUND'}`);
      
      if (!apiKey) {
        throw new Error(`No RevenueCat API key found for platform: ${platform}`);
      }

      // Set log level first
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      log.init('📝 Log level set to DEBUG');

      // Configure RevenueCat
      log.init(`👤 Configuring with ${userId ? 'user ID: ' + userId : 'anonymous user'}...`);
      await Purchases.configure({
        apiKey,
        appUserID: userId || undefined, // Use provided userId or anonymous
      });
      
      this.isInitialized = true;
      this.isInitializing = false;
      log.init('✅ RevenueCat configured successfully');

      // Fetch offerings on initialization (non-blocking)
      log.init('📦 Fetching offerings...');
      await this.fetchOfferings();
      
    } catch (error) {
      this.isInitializing = false;
      log.error('❌ Failed to initialize RevenueCat:', error);
      // Log detailed error information
      if (error instanceof Error) {
        log.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
      throw error;
    }
  }

  /**
   * Set user ID for RevenueCat (call after user signs up)
   */
  async setUserId(userId: string): Promise<void> {
    try {
      log.info('👤 Setting user ID:', userId);
      
      if (!this.isInitialized) {
        log.info('   ⚠️ Not initialized, initializing now...');
        await this.initialize();
      }
      
      await Purchases.logIn(userId);
      log.info('   ✅ User ID set successfully');
    } catch (error) {
      log.error('❌ Failed to set user ID:', error);
      throw error;
    }
  }

  /**
   * Fetch available offerings from RevenueCat
   * This properly awaits the SDK call and handles all edge cases
   */
  async fetchOfferings(): Promise<void> {
    try {
      if (!this.isInitialized) {
        log.offerings('⚠️ Not initialized, initializing now...');
        await this.initialize();
      }

      log.offerings('🔄 Fetching offerings from RevenueCat...');
      
      // This is the critical fix: properly await and handle the response
      const offeringsResponse = await Purchases.getOfferings();
      
      log.offerings('📦 Raw offerings response received');
      log.offerings('   - All offerings keys:', Object.keys(offeringsResponse.all || {}));
      log.offerings('   - Current offering ID:', offeringsResponse.current?.identifier || 'NONE');
      
      // Store the current offering (the default one)
      this.currentOffering = offeringsResponse.current || null;
      
      if (!this.currentOffering) {
        log.warn('⚠️ No current offering found in RevenueCat dashboard');
        log.warn('   This usually means:');
        log.warn('   1. No offering is marked as "current" in RevenueCat dashboard');
        log.warn('   2. Products are in "Missing Metadata" state in App Store Connect');
        log.warn('   3. Products are not approved yet');
        log.warn('   👉 App will fall back to mock paywall for testing');
      } else {
        log.offerings('✅ Current offering found:', this.currentOffering.identifier);
        log.offerings('   - Available packages:', this.currentOffering.availablePackages.length);
        
        // Log each package for debugging
        this.currentOffering.availablePackages.forEach((pkg, idx) => {
          log.offerings(`   📦 Package ${idx + 1}:`, {
            identifier: pkg.identifier,
            packageType: pkg.packageType,
            productId: pkg.product.identifier,
            price: pkg.product.priceString,
            title: pkg.product.title,
          });
        });
      }
      
    } catch (error) {
      log.error('❌ Failed to fetch offerings:', error);
      
      // Log detailed error information
      if (error instanceof Error) {
        log.error('   Error name:', error.name);
        log.error('   Error message:', error.message);
        log.error('   Error stack:', error.stack);
      }
      
      // Check if it's a RevenueCat-specific error
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const rcError = error as PurchasesError;
        log.error('   RC Error code:', rcError.code);
        log.error('   RC Error message:', rcError.message);
        log.error('   RC Underlying error:', rcError.underlyingErrorMessage);
      }
      
      log.warn('⚠️ Setting current offering to null, app will use mock paywall');
      this.currentOffering = null;
      
      // Don't throw - allow the app to continue with mock paywall
      // throw error;
    }
  }

  /**
   * Get the current offering (usually the default)
   * Returns null if offerings haven't been fetched or don't exist
   */
  async getCurrentOffering(): Promise<PurchasesOffering | null> {
    try {
      log.offerings('🔍 Getting current offering...');
      
      if (!this.isInitialized) {
        log.offerings('   ⚠️ Not initialized, initializing now...');
        await this.initialize();
      }
      
      // If we haven't fetched offerings yet, fetch them
      if (this.currentOffering === null) {
        log.offerings('   📦 No cached offering, fetching now...');
        await this.fetchOfferings();
      }
      
      if (this.currentOffering) {
        log.offerings('   ✅ Returning current offering:', this.currentOffering.identifier);
        log.offerings('   📦 Packages available:', this.currentOffering.availablePackages.length);
      } else {
        log.warn('   ⚠️ No current offering available');
        log.warn('   This is normal during Apple review if products are not approved yet');
      }
      
      return this.currentOffering;
    } catch (error) {
      log.error('❌ Failed to get current offering:', error);
      
      // Log the error type
      if (error instanceof Error) {
        log.error('   Error type:', error.constructor.name);
        log.error('   Error message:', error.message);
      } else if (typeof error === 'object' && error !== null) {
        log.error('   Error object:', JSON.stringify(error, null, 2));
      } else {
        log.error('   Error value:', String(error));
      }
      
      return null;
    }
  }

  /**
   * Create a mock offering for testing when real offerings are unavailable
   * This is useful during Apple review when products might not be approved yet
   */
  getMockOffering(): PurchasesOffering | null {
    log.warn('🎭 Using mock offering (real offerings unavailable)');
    log.warn('   This is expected during Apple review if products are not yet approved');
    
    // Return null - the UI will handle showing mock paywall
    return null;
  }

  /**
   * Purchase a package
   */
  async purchasePackage(packageToPurchase: PurchasesPackage): Promise<CustomerInfo> {
    try {
      if (!this.isInitialized) {
        log.purchase('⚠️ Not initialized, initializing now...');
        await this.initialize();
      }

      log.purchase('💳 Initiating purchase...');
      log.purchase('   Package:', packageToPurchase.identifier);
      log.purchase('   Product:', packageToPurchase.product.identifier);
      log.purchase('   Price:', packageToPurchase.product.priceString);
      
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      
      log.purchase('✅ Purchase completed successfully!');
      log.purchase('   Active entitlements:', Object.keys(customerInfo.entitlements.active));
      
      return customerInfo;
    } catch (error) {
      log.error('❌ Purchase failed:', error);
      
      // Log error details
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const rcError = error as PurchasesError;
        log.error('   Error code:', rcError.code);
        log.error('   Error message:', rcError.message);
        
        // User cancelled is not really an error
        if (rcError.code && rcError.code.includes('PAYMENT_CANCELLED')) {
          log.info('   ℹ️ User cancelled the purchase');
        }
      }
      
      throw this.handlePurchaseError(error as PurchasesError);
    }
  }

  /**
   * Restore previous purchases
   */
  async restorePurchases(): Promise<CustomerInfo> {
    try {
      if (!this.isInitialized) {
        log.purchase('⚠️ Not initialized, initializing now...');
        await this.initialize();
      }

      log.purchase('🔄 Restoring purchases...');
      const customerInfo = await Purchases.restorePurchases();
      
      const activeEntitlements = Object.keys(customerInfo.entitlements.active);
      
      if (activeEntitlements.length > 0) {
        log.purchase('✅ Purchases restored successfully!');
        log.purchase('   Active entitlements:', activeEntitlements);
      } else {
        log.purchase('ℹ️ No active purchases found to restore');
      }
      
      return customerInfo;
    } catch (error) {
      log.error('❌ Failed to restore purchases:', error);
      throw error;
    }
  }

  /**
   * Check current subscription status
   */
  async checkSubscriptionStatus(): Promise<SubscriptionStatus> {
    try {
      if (!this.isInitialized) {
        log.info('⚠️ Not initialized, initializing now...');
        await this.initialize();
      }

      log.info('🔍 Checking subscription status...');
      const customerInfo = await Purchases.getCustomerInfo();
      const activeEntitlements = customerInfo.entitlements.active;
      
      // Check if user has any active subscription
      const hasActiveSubscription = Object.keys(activeEntitlements).length > 0;
      
      if (hasActiveSubscription) {
        const entitlement = Object.values(activeEntitlements)[0];
        log.info('✅ Active subscription found!');
        log.info('   Product:', entitlement.productIdentifier);
        log.info('   Expires:', entitlement.expirationDate || 'Never');
        log.info('   Will renew:', entitlement.willRenew);
        
        return {
          isSubscribed: true,
          isActive: true,
          productId: entitlement.productIdentifier,
          expirationDate: entitlement.expirationDate,
          willRenew: entitlement.willRenew,
        };
      }

      log.info('ℹ️ No active subscription found');
      return {
        isSubscribed: false,
        isActive: false,
      };
    } catch (error) {
      log.error('❌ Failed to check subscription status:', error);
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
        log.info('⚠️ Not initialized, initializing now...');
        await this.initialize();
      }

      log.debug('📊 Fetching customer info...');
      const customerInfo = await Purchases.getCustomerInfo();
      log.debug('   ✅ Customer info retrieved');
      
      return customerInfo;
    } catch (error) {
      log.error('❌ Failed to get customer info:', error);
      throw error;
    }
  }

  /**
   * Handle purchase errors with user-friendly messages
   */
  private handlePurchaseError(error: PurchasesError): Error {
    const errorCode = error.code || '';
    const errorMessage = error.message || 'An unknown error occurred';
    
    // Map error codes to user-friendly messages
    const errorMap: Record<string, string> = {
      'PRODUCT_NOT_AVAILABLE': 'This product is not available for purchase',
      'PAYMENT_PENDING': 'Payment is pending. Please check your payment method',
      'PAYMENT_CANCELLED': 'Payment was cancelled',
      'PAYMENT_INVALID': 'Payment method is invalid',
      'PAYMENT_NOT_ALLOWED': 'Payment is not allowed on this device',
      'PURCHASE_INVALID': 'Purchase is invalid',
      'PURCHASE_NOT_ALLOWED': 'Purchase is not allowed',
      'PURCHASE_ALREADY_OWNED': 'You already own this product',
      'ALREADY_OWNED': 'You already own this product',
      'RECEIPT_ALREADY_IN_USE': 'Receipt is already in use',
      'INVALID_RECEIPT': 'Receipt is invalid',
      'MISSING_RECEIPT': 'Receipt file is missing',
      'NETWORK_ERROR': 'Network error. Please check your connection',
      'INVALID_CREDENTIALS': 'Invalid credentials',
      'INVALID_APP_USER_ID': 'Invalid user ID',
      'OPERATION_ALREADY_IN_PROGRESS': 'Operation already in progress',
      'INVALID_SUBSCRIBER_ATTRIBUTES': 'Invalid subscriber attributes',
      'STORE_PROBLEM': 'There was a problem with the app store',
      'PRODUCT_ALREADY_PURCHASED': 'Product already purchased',
      'NOT_AVAILABLE_IN_STORE': 'Product not available in current store',
      'CUSTOMER_INFO_ERROR': 'Failed to get customer info',
      'SYSTEM_ERROR': 'System error occurred',
    };
    
    // Check if any known error code pattern matches
    for (const [key, message] of Object.entries(errorMap)) {
      if (errorCode.includes(key)) {
        log.error(`   🔍 Mapped error code "${errorCode}" to: ${message}`);
        return new Error(message);
      }
    }
    
    // Default error message
    log.error(`   ⚠️ Unmapped error code: ${errorCode}`);
    return new Error(errorMessage || 'An unknown error occurred. Please try again');
  }

  /**
   * Reset RevenueCat (for testing)
   * Note: This logs out the current user and resets local state
   */
  async reset(): Promise<void> {
    try {
      log.info('🔄 Resetting RevenueCat...');
      
      // Log out the current user (this is the proper way to reset in v5+)
      if (this.isInitialized) {
        await Purchases.logOut();
      }
      
      this.isInitialized = false;
      this.isInitializing = false;
      this.currentOffering = null;
      log.info('✅ RevenueCat reset successfully');
    } catch (error) {
      log.error('❌ Failed to reset RevenueCat:', error);
      throw error;
    }
  }

  /**
   * Get initialization status
   */
  getInitializationStatus(): { isInitialized: boolean; isInitializing: boolean; hasOffering: boolean } {
    return {
      isInitialized: this.isInitialized,
      isInitializing: this.isInitializing,
      hasOffering: this.currentOffering !== null,
    };
  }
}

// Export singleton instance
export const revenueCatService = new RevenueCatService();

// Export types for use in components
export type { CustomerInfo, PurchasesOffering, PurchasesPackage };

