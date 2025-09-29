import { COLORS, FONTS } from '@/components/shared/theme';
import { useUserProfile } from '@/src/hooks/useUserProfile';
import { useDatabase } from '@/src/lib/DatabaseProvider';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function AppNavigator() {
    const { isInitialized: dbInitialized } = useDatabase();
    const { userProfile, isLoading } = useUserProfile();

    useEffect(() => {
        if (dbInitialized && !isLoading) {
            if (userProfile) {
                // User is onboarded, go to tabs
                router.replace('/(tabs)');
            } else {
                // User is not onboarded, go to onboarding
                router.replace('/onboarding');
            }
        }
    }, [dbInitialized, isLoading, userProfile]);

    // Show loading while checking onboarding status
    if (!dbInitialized || isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    // This should not render as useEffect will navigate away
    return null;
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    loadingText: {
        fontSize: 18,
        fontFamily: FONTS.heading,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
});
