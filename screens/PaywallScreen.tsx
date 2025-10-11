import { REVENUECAT_CONFIG } from '@/src/config/revenuecat';
import { revenueCatService } from '@/src/services/revenuecat';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import {
    Alert,
    SafeAreaView,
    StyleSheet,
} from 'react-native';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';

interface PaywallScreenProps {
    onSubscriptionComplete?: () => void;
    onSkip?: () => void;
}

export default function PaywallScreen({
    onSubscriptionComplete,
    onSkip
}: PaywallScreenProps) {

    const handleSubscriptionComplete = useCallback(() => {
        if (onSubscriptionComplete) {
            onSubscriptionComplete();
        } else {
            router.replace('/(tabs)');
        }
    }, [onSubscriptionComplete]);

    const handleSkip = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (onSkip) {
            onSkip();
        }
        router.replace('/(tabs)');
    }, [onSkip]);

    useEffect(() => {
        const checkAndPresentPaywall = async () => {
            // Check if user is already subscribed
            const status = await revenueCatService.checkSubscriptionStatus();
            if (status.isSubscribed) {
                console.log('[PAYWALL] User already subscribed, skipping paywall');
                handleSubscriptionComplete();
                return;
            }

            // Present the RevenueCat paywall
            try {
                const paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
                    requiredEntitlementIdentifier: REVENUECAT_CONFIG.ENTITLEMENT_ID,
                });

                switch (paywallResult) {
                    case PAYWALL_RESULT.PURCHASED:
                        console.log('[PAYWALL] RevenueCat Paywall - PURCHASED');
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        handleSubscriptionComplete();
                        break;
                    case PAYWALL_RESULT.CANCELLED:
                        console.log('[PAYWALL] RevenueCat Paywall - CANCELLED');
                        handleSkip();
                        break;
                    case PAYWALL_RESULT.ERROR:
                        console.error('[PAYWALL] RevenueCat Paywall - ERROR');
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                        Alert.alert('Paywall Error', 'An error occurred with the paywall.');
                        handleSkip(); // On error, treat as skip
                        break;
                    default:
                        console.log('[PAYWALL] RevenueCat Paywall - Default result or not presented.');
                        handleSkip(); // If paywall not presented and not subscribed, treat as skip
                        break;
                }

            } catch (e) {
                console.error('[PAYWALL] Error presenting RevenueCat Paywall:', e);
                handleSkip(); // On error, treat as skip
            }
        };

        checkAndPresentPaywall();
    }, [handleSubscriptionComplete, handleSkip]);

    // PaywallScreen will always either present RevenueCatUI or navigate away.
    // No need to render anything else if the paywall is shown directly.
    return <SafeAreaView style={styles.container} />;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
