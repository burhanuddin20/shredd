import { IconSymbol } from '@/components/ui/icon-symbol';
import { MilitaryButton } from '@/components/ui/military-button';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FLAGS } from '@/src/config/flags';
import { REVENUECAT_CONFIG } from '@/src/config/revenuecat';
import MockPaywall from '@/src/features/paywall/MockPaywall';
import {
    PurchasesOffering,
    PurchasesPackage,
    revenueCatService,
    SubscriptionStatus
} from '@/src/services/revenuecat';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Dev flag to bypass paywall
const BYPASS_PAYWALL = REVENUECAT_CONFIG.DEV.BYPASS_PAYWALL;

interface PaywallScreenProps {
    onSubscriptionComplete?: () => void;
    onSkip?: () => void;
}

export default function PaywallScreen({
    onSubscriptionComplete,
    onSkip
}: PaywallScreenProps) {
    const [offerings, setOfferings] = useState<PurchasesOffering[]>([]);
    const [currentOffering, setCurrentOffering] = useState<PurchasesOffering | null>(null);
    const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
    const [useMock, setUseMock] = useState(FLAGS.USE_MOCK_PAYWALL);

    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'dark'];

    useEffect(() => {
        initializePaywall();
    }, []);

    const initializePaywall = async () => {
        try {
            setIsLoading(true);

            // If mock flag is enabled, use mock paywall
            if (FLAGS.USE_MOCK_PAYWALL) {
                setUseMock(true);
                setIsLoading(false);
                return;
            }

            // Check if user is already subscribed
            const status = await revenueCatService.checkSubscriptionStatus();
            setSubscriptionStatus(status);

            if (status.isSubscribed) {
                // User is already subscribed, skip paywall
                handleSubscriptionComplete();
                return;
            }

            // Fetch offerings
            const fetchedOfferings = await revenueCatService.getOfferings();
            setOfferings(fetchedOfferings);

            // Get current offering
            const current = await revenueCatService.getCurrentOffering();
            setCurrentOffering(current);

            // Check if we have valid offerings
            if (current && current.availablePackages.length > 0) {
                setUseMock(false);
                // Auto-select yearly package if available (better value)
                const yearlyPackage = current.availablePackages.find(
                    pkg => pkg.packageType === 'ANNUAL'
                );
                const monthlyPackage = current.availablePackages.find(
                    pkg => pkg.packageType === 'MONTHLY'
                );

                setSelectedPackage(yearlyPackage || monthlyPackage || current.availablePackages[0]);
            } else {
                // No products returned → fall back to mock
                setUseMock(true);
            }

        } catch (error) {
            console.error('Failed to initialize paywall:', error);
            // Network / configuration error → fall back to mock
            setUseMock(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePackageSelect = (pkg: PurchasesPackage) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setSelectedPackage(pkg);
    };

    const handlePurchase = async () => {
        if (!selectedPackage) {
            Alert.alert('Error', 'Please select a subscription plan');
            return;
        }

        try {
            setIsPurchasing(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            const customerInfo = await revenueCatService.purchasePackage(selectedPackage);

            // Check if purchase was successful
            const status = await revenueCatService.checkSubscriptionStatus();
            setSubscriptionStatus(status);

            if (status.isSubscribed) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert(
                    'Welcome to Shredd Pro! 🎉',
                    'Your subscription is active. Enjoy all premium features!',
                    [{ text: 'Continue', onPress: handleSubscriptionComplete }]
                );
            } else {
                throw new Error('Purchase completed but subscription not active');
            }

        } catch (error) {
            console.error('Purchase failed:', error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Purchase Failed', error.message || 'Please try again');
        } finally {
            setIsPurchasing(false);
        }
    };

    const handleRestore = async () => {
        try {
            setIsRestoring(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            const customerInfo = await revenueCatService.restorePurchases();

            // Check if restoration was successful
            const status = await revenueCatService.checkSubscriptionStatus();
            setSubscriptionStatus(status);

            if (status.isSubscribed) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert(
                    'Purchases Restored! ✅',
                    'Your subscription has been restored successfully.',
                    [{ text: 'Continue', onPress: handleSubscriptionComplete }]
                );
            } else {
                Alert.alert(
                    'No Purchases Found',
                    'No active subscriptions were found to restore.',
                    [{ text: 'OK' }]
                );
            }

        } catch (error) {
            console.error('Restore failed:', error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Restore Failed', error.message || 'Please try again');
        } finally {
            setIsRestoring(false);
        }
    };

    const handleSubscriptionComplete = () => {
        if (onSubscriptionComplete) {
            onSubscriptionComplete();
        } else {
            router.replace('/(tabs)');
        }
    };

    const handleSkip = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (onSkip) {
            onSkip();
        } else {
            router.replace('/(tabs)');
        }
    };

    // Dev bypass
    if (BYPASS_PAYWALL) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.devBypass}>
                    <Text style={[styles.devBypassText, { color: colors.accent }]}>
                        DEV MODE: Paywall Bypassed
                    </Text>
                    <MilitaryButton
                        title="Continue to App"
                        onPress={handleSubscriptionComplete}
                        variant="primary"
                        size="large"
                    />
                </View>
            </SafeAreaView>
        );
    }

    // Mock paywall
    if (useMock) {
        return (
            <MockPaywall
                onSelectMonthly={() => {/* NO-OP for screenshot */ }}
                onSelectYearly={() => {/* NO-OP for screenshot */ }}
                onRestore={() => {/* NO-OP */ }}
                onClose={handleSkip}
            />
        );
    }

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.accent} />
                    <Text style={[styles.loadingText, { color: colors.beige }]}>
                        Loading subscription options...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!currentOffering || currentOffering.availablePackages.length === 0) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.errorContainer}>
                    <IconSymbol name="exclamationmark.triangle" size={60} color={colors.accent} />
                    <Text style={[styles.errorTitle, { color: colors.beige }]}>
                        Subscription Unavailable
                    </Text>
                    <Text style={[styles.errorText, { color: colors.secondary }]}>
                        Subscription options are not available at the moment. Please try again later.
                    </Text>
                    <MilitaryButton
                        title="Try Again"
                        onPress={initializePaywall}
                        variant="primary"
                        size="medium"
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <IconSymbol name="crown.fill" size={60} color={colors.accent} />
                    </View>
                    <Text style={[styles.title, { color: colors.beige }]}>
                        Unlock Shredd Pro
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.accent }]}>
                        Transform your fasting journey
                    </Text>
                </View>

                {/* Features List */}
                <View style={styles.featuresContainer}>
                    <Text style={[styles.featuresTitle, { color: colors.beige }]}>
                        Premium Features
                    </Text>

                    {FEATURES.map((feature, index) => (
                        <View key={index} style={styles.featureItem}>
                            <IconSymbol
                                name={feature.icon as any}
                                size={24}
                                color={colors.accent}
                            />
                            <View style={styles.featureTextContainer}>
                                <Text style={[styles.featureTitle, { color: colors.beige }]}>
                                    {feature.title}
                                </Text>
                                <Text style={[styles.featureDescription, { color: colors.secondary }]}>
                                    {feature.description}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Free Trial Badge */}
                <View style={[styles.trialBadge, { backgroundColor: colors.accent + '20', borderColor: colors.accent }]}>
                    <IconSymbol name="gift.fill" size={20} color={colors.accent} />
                    <Text style={[styles.trialText, { color: colors.accent }]}>
                        7 Days Free Trial
                    </Text>
                </View>

                {/* Subscription Options */}
                <View style={styles.packagesContainer}>
                    <Text style={[styles.packagesTitle, { color: colors.beige }]}>
                        Choose Your Plan
                    </Text>

                    {currentOffering.availablePackages.map((pkg) => (
                        <TouchableOpacity
                            key={pkg.identifier}
                            onPress={() => handlePackageSelect(pkg)}
                            style={[
                                styles.packageCard,
                                selectedPackage?.identifier === pkg.identifier && styles.selectedPackageCard,
                                {
                                    borderColor: selectedPackage?.identifier === pkg.identifier
                                        ? colors.accent
                                        : colors.border
                                }
                            ]}
                        >
                            <View style={styles.packageContent}>
                                <View style={styles.packageInfo}>
                                    <Text style={[styles.packageName, { color: colors.beige }]}>
                                        {getPackageDisplayName(pkg.packageType)}
                                    </Text>
                                    <Text style={[styles.packagePrice, { color: colors.accent }]}>
                                        {pkg.product.priceString}
                                    </Text>
                                    {pkg.packageType === 'ANNUAL' && (
                                        <Text style={[styles.packageSavings, { color: colors.secondary }]}>
                                            Save 50% vs monthly
                                        </Text>
                                    )}
                                </View>
                                {selectedPackage?.identifier === pkg.identifier && (
                                    <IconSymbol name="checkmark.circle.fill" size={24} color={colors.accent} />
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsContainer}>
                    <MilitaryButton
                        title={isPurchasing ? "Processing..." : "Start Free Trial"}
                        onPress={handlePurchase}
                        variant="primary"
                        size="large"
                        disabled={!selectedPackage || isPurchasing}
                        loading={isPurchasing}
                    />

                    <MilitaryButton
                        title={isRestoring ? "Restoring..." : "Restore Purchases"}
                        onPress={handleRestore}
                        variant="secondary"
                        size="medium"
                        disabled={isRestoring}
                        loading={isRestoring}
                    />
                </View>

                {/* Terms */}
                <View style={styles.termsContainer}>
                    <Text style={[styles.termsText, { color: colors.secondary }]}>
                        By subscribing, you agree to our Terms of Service and Privacy Policy.
                        Subscription automatically renews unless cancelled at least 24 hours before the end of the current period.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// Features list
const FEATURES = [
    {
        icon: 'gamecontroller.fill',
        title: 'Advanced Gamification',
        description: 'Unlock all achievements, ranks, and XP multipliers'
    },
    {
        icon: 'flame.fill',
        title: 'Unlimited Streaks',
        description: 'Track unlimited fasting streaks with detailed analytics'
    },
    {
        icon: 'person.2.fill',
        title: 'Squad Features',
        description: 'Create squads, compete with friends, and climb leaderboards'
    },
    {
        icon: 'chart.bar.fill',
        title: 'Advanced Analytics',
        description: 'Detailed progress tracking and personalized insights'
    },
    {
        icon: 'bell.fill',
        title: 'Smart Notifications',
        description: 'Intelligent reminders and motivation messages'
    },
    {
        icon: 'star.fill',
        title: 'Premium Support',
        description: 'Priority customer support and feature requests'
    }
];

// Helper function to get package display name
const getPackageDisplayName = (packageType: string): string => {
    switch (packageType) {
        case 'MONTHLY':
            return 'Monthly';
        case 'ANNUAL':
            return 'Yearly';
        case 'WEEKLY':
            return 'Weekly';
        case 'LIFETIME':
            return 'Lifetime';
        default:
            return 'Subscription';
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        fontFamily: 'body',
    },
    devBypass: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    devBypassText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        fontFamily: 'military',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    errorTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
        fontFamily: 'military',
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 24,
        fontFamily: 'body',
    },
    header: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 32,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
        fontFamily: 'military',
    },
    subtitle: {
        fontSize: 18,
        textAlign: 'center',
        opacity: 0.9,
        fontFamily: 'body',
    },
    featuresContainer: {
        marginBottom: 32,
    },
    featuresTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        fontFamily: 'military',
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    featureTextContainer: {
        flex: 1,
        marginLeft: 12,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
        fontFamily: 'military',
    },
    featureDescription: {
        fontSize: 14,
        lineHeight: 20,
        fontFamily: 'body',
    },
    trialBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        borderWidth: 2,
        marginBottom: 32,
        alignSelf: 'center',
    },
    trialText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
        fontFamily: 'military',
    },
    packagesContainer: {
        marginBottom: 32,
    },
    packagesTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        fontFamily: 'military',
    },
    packageCard: {
        borderWidth: 2,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    selectedPackageCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    packageContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    packageInfo: {
        flex: 1,
    },
    packageName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
        fontFamily: 'military',
    },
    packagePrice: {
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily: 'military',
    },
    packageSavings: {
        fontSize: 14,
        marginTop: 4,
        fontStyle: 'italic',
        fontFamily: 'body',
    },
    actionsContainer: {
        marginBottom: 24,
    },
    termsContainer: {
        paddingHorizontal: 8,
    },
    termsText: {
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
        fontFamily: 'body',
    },
});
