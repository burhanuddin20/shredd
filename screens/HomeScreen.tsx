import { AchievementAnimation } from '@/components/animations/AchievementAnimation';
import { AnimationDemo } from '@/components/animations/AnimationDemo';
import { LevelUpAnimation } from '@/components/animations/LevelUpAnimation';
import { ProgressRing } from '@/components/shared/progress-ring';
import { COLORS, FONTS, SIZES } from '@/components/shared/theme';
import {
    calculateLevel,
    FASTING_PLANS,
    getRankName,
    getXPReward,
} from '@/constants/game';
import { useAnimations } from '@/hooks/use-animations';
import { useFasting } from '@/src/hooks/useFasting';
import { useUserProfile } from '@/src/hooks/useUserProfile';
import { useDatabase } from '@/src/lib/DatabaseProvider';
import { Anton_400Regular, useFonts } from '@expo-google-fonts/anton';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Mock user data (fallback)
// const mockUser: UserProfile = {
//     id: '1',
//     username: 'trilly',
//     email: 'scout@corps.com',
//     profilePicture: 'https://i.pravatar.cc/100',
//     totalXP: 250,
//     currentStreak: 5,
//     longestStreak: 12,
//     totalFasts: 15,
//     achievements: ['first_fast', 'fast_16h', 'total_10'],
//     currentPlan: '16:8',
//     createdAt: new Date('2024-01-01'),
// };

export default function HomeScreen() {
    // Load fonts
    const [fontsLoaded] = useFonts({
        Anton_400Regular,
    });

    // Database hooks
    const { isInitialized: dbInitialized } = useDatabase();
    const { currentFast, startFast, endFast, isLoading: fastingLoading } = useFasting();
    const { userProfile, achievements, addXP, checkAndUnlockAchievements, isLoading: profileLoading } = useUserProfile();

    // Local timer state
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [selectedPlan] = useState('16:8');
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Use database user or fallback to mock data
    const user = userProfile ? {
        id: userProfile.id,
        username: userProfile.username,
        email: userProfile.email || '',
        profilePicture: 'https://i.pravatar.cc/100',
        totalXP: userProfile.totalXP,
        currentStreak: userProfile.streak,
        longestStreak: 12, // TODO: Calculate from fast history
        totalFasts: 15, // TODO: Calculate from fast history
        achievements: achievements.map(a => a.id),
        currentPlan: '16:8', // TODO: Get from user preferences
        createdAt: new Date('2024-01-01'), // TODO: Add to user table
    } : {
        id: '1',
        username: 'Guest',
        email: '',
        profilePicture: 'https://i.pravatar.cc/100',
        totalXP: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalFasts: 0,
        achievements: [],
        currentPlan: '16:8',
        createdAt: new Date(),
    };

    // Animation hooks
    const {
        levelUpVisible,
        levelUpData,
        triggerLevelUp,
        closeLevelUp,
        achievementVisible,
        achievementData,
        triggerAchievementUnlock,
        closeAchievement,
    } = useAnimations();

    const userLevel = calculateLevel(user.totalXP);
    const rankName = getRankName(userLevel.level);
    const plan = FASTING_PLANS.find(
        (p) => p.id === (currentFast?.planId || selectedPlan)
    );
    const totalSeconds = (plan?.fastingHours || 16) * 60 * 60;
    const progress =
        totalSeconds > 0 ? (totalSeconds - timeRemaining) / totalSeconds : 0;

    const completeFast = useCallback(async () => {
        if (currentFast && plan) {
            const xpEarned = getXPReward(plan.fastingHours);

            try {
                await endFast(currentFast.id!, xpEarned);
                await addXP(xpEarned);
                await checkAndUnlockAchievements(1, plan.fastingHours, 1);

                setIsRunning(false);
                setTimeRemaining(0);

                Alert.alert('Fast Complete!', `You earned ${xpEarned} XP.`, [
                    { text: 'OK' },
                ]);
            } catch (error) {
                console.error('Failed to complete fast:', error);
                Alert.alert('Error', 'Failed to complete fast. Please try again.');
            }
        }
    }, [currentFast, plan, endFast, addXP, checkAndUnlockAchievements]);

    useEffect(() => {
        if (isRunning && timeRemaining > 0) {
            intervalRef.current = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev <= 1) {
                        completeFast();
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning, timeRemaining, completeFast]);

    const startFastHandler = async () => {
        if (!plan) return;

        try {
            await startFast(selectedPlan);
            setTimeRemaining(plan.fastingHours * 60 * 60);
            setIsRunning(true);

            Alert.alert(
                'Fast Started!',
                `Your ${plan.name} fast has begun. Good luck, soldier!`,
                [{ text: 'Let\'s Go!', style: 'default' }]
            );
        } catch (error) {
            console.error('Failed to start fast:', error);
            Alert.alert('Error', 'Failed to start fast. Please try again.');
        }
    };

    const endFastHandler = () => {
        Alert.alert('End Fast', 'Are you sure you want to end your current fast? You will not receive XP.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'End Fast',
                style: 'destructive',
                onPress: async () => {
                    if (currentFast) {
                        try {
                            await endFast(currentFast.id!, 0);
                            setIsRunning(false);
                            setTimeRemaining(0);
                        } catch (error) {
                            console.error('Failed to end fast:', error);
                        }
                    }
                },
            },
        ]);
    };

    if (!fontsLoaded || !dbInitialized || fastingLoading || profileLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
                <View style={styles.loadingContainer}>
                    <Text style={[styles.loadingText, { color: COLORS.textPrimary }]}>
                        Loading...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.homeTitle}>HOME</Text>
                </View>

                {/* Current Fast Section */}
                <View style={styles.currentFastSection}>
                    <Text style={styles.sectionLabel}>CURRENT FAST</Text>

                    {/* Progress Ring */}
                    <View style={styles.progressRingContainer}>
                        <ProgressRing
                            progress={progress}
                            timeRemaining={timeRemaining}
                            planName={plan ? `${plan.fastingHours} HR FAST` : undefined}
                        />
                    </View>

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>PLAN</Text>
                            <Text style={styles.statValue}>{plan?.id || '16:8'}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>XP</Text>
                            <Text style={styles.statValue}>{user.totalXP}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>RANK</Text>
                            <Text style={styles.statValue}>{rankName}</Text>
                        </View>
                    </View>
                </View>

                {/* Leaderboard Section */}
                <View style={styles.leaderboardSection}>
                    <Text style={styles.leaderboardLabel}>LEADERBOARD</Text>
                    <Text style={styles.leaderboardPosition}>5th PLACE</Text>
                </View>

                {/* Action Button */}
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={currentFast ? endFastHandler : startFastHandler}
                >
                    <Text style={styles.actionButtonText}>
                        {currentFast ? 'END FAST' : 'START FAST'}
                    </Text>
                </TouchableOpacity>

                {/* Animation Demo - Remove this in production */}
                <AnimationDemo
                    onTriggerLevelUp={triggerLevelUp}
                    onTriggerAchievement={triggerAchievementUnlock}
                />

                {/* Onboarding Test Button */}
                <TouchableOpacity
                    style={styles.testButton}
                    onPress={() => router.push('/onboarding')}
                >
                    <Text style={styles.testButtonText}>🧪 TEST ONBOARDING</Text>
                </TouchableOpacity>

                {/* Animation Modals */}
                {levelUpVisible && levelUpData && (
                    <LevelUpAnimation
                        visible={levelUpVisible}
                        onClose={closeLevelUp}
                        newLevel={levelUpData.newLevel}
                        newRank={levelUpData.newRank}
                        xpEarned={levelUpData.xpEarned}
                    />
                )}

                {achievementVisible && achievementData && (
                    <AchievementAnimation
                        visible={achievementVisible}
                        onClose={closeAchievement}
                        achievement={achievementData.achievement}
                        isUnlocked={achievementData.isUnlocked}
                    />
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        padding: 16,
        gap: 16,
    },
    header: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    homeTitle: {
        fontSize: 36,
        fontFamily: FONTS.heading,
        color: COLORS.textSecondary,
        letterSpacing: 2,
        textTransform: 'uppercase',
        fontWeight: 'bold',
        textShadowColor: '#000000',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
    },
    currentFastSection: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 14,
    },
    sectionLabel: {
        fontSize: 20,
        fontFamily: FONTS.heading,
        color: COLORS.textSecondary,
        fontWeight: 'bold',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 12,
    },
    progressRingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
    },
    statItem: {
        alignItems: 'center',
        gap: 4,
        flex: 1,
    },
    statDivider: {
        width: 1,
        height: 48,
        backgroundColor: COLORS.border,
    },
    statLabel: {
        fontSize: 12,
        fontFamily: FONTS.heading,
        color: COLORS.textSecondary,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statValue: {
        fontSize: 20,
        fontFamily: FONTS.heading,
        color: COLORS.textPrimary,
        fontWeight: 'bold',
    },
    leaderboardSection: {
        alignItems: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
    },
    leaderboardLabel: {
        fontSize: 25,
        fontFamily: FONTS.heading,
        color: COLORS.textSecondary,
        fontWeight: 'bold',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 6,
    },
    leaderboardPosition: {
        fontSize: 18,
        fontFamily: FONTS.heading,
        color: COLORS.textPrimary,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    testButton: {
        backgroundColor: COLORS.accent,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 6,
        marginTop: 16,
        alignItems: 'center',
    },
    testButtonText: {
        fontSize: 16,
        fontFamily: FONTS.heading,
        color: COLORS.textPrimary,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    actionButton: {
        backgroundColor: COLORS.buttonBg,
        width: width - 32,
        height: SIZES.buttonHeight,
        borderRadius: SIZES.buttonRadius,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
    },
    actionButtonText: {
        fontSize: 20,
        fontFamily: FONTS.heading,
        fontWeight: 'bold',
        color: COLORS.buttonText,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 18,
        fontFamily: FONTS.heading,
        fontWeight: 'bold',
    },
});
