import { MilitaryButton } from '@/components/ui/military-button';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FLAGS } from '@/src/config/flags';
import { REVENUECAT_CONFIG } from '@/src/config/revenuecat';
import {
    revenueCatService
} from '@/src/services/revenuecat';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
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
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'dark'];

  

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
                        // todo handle this case
                        break;
                    default:
                        // This case might mean the paywall wasn't presented because the user was already subscribed
                        // or some other non-error condition. Also, if there are no offerings available.
                        console.log('[PAYWALL] RevenueCat Paywall - Default result or not presented.');
                        if (!status.isSubscribed) {
                            // todo handle this case
                        }
                        break;
                }

            } catch (e) {
                console.error('[PAYWALL] Error presenting RevenueCat Paywall:', e);
                // todo error message
            }
        };

        checkAndPresentPaywall();
    }, [BYPASS_PAYWALL, setUseMock, handleSubscriptionComplete, handleSkip]);

   
    
    // If RevenueCatUI is not presented, and not using mock, just return an empty view for now.
    // todo why are we returning an empty view for now?
    // The onboarding screen is responsible for the initial loading animation.
    return <SafeAreaView style={styles.container} />;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
});
