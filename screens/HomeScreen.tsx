import { AchievementAnimation } from '@/components/animations/AchievementAnimation';
// import { AnimationDemo } from '@/components/animations/AnimationDemo';
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
import { useDatabase } from '@/src/lib/DatabaseProvider';
import {getCompletedFastsCount } from '@/src/lib/db';
import { useFasting } from '@/src/lib/FastingProvider';
import { useUserProfile } from '@/src/lib/UserProfileProvider';
import { Anton_400Regular, useFonts } from '@expo-google-fonts/anton';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');


export default function HomeScreen() {
    // Load fonts
    const [fontsLoaded] = useFonts({
        Anton_400Regular,
    });

    // Database hooks
    const { isInitialized: dbInitialized } = useDatabase();
    const { currentFast, startFast, endFast, cancelFast, isLoading: fastingLoading } = useFasting();
    const { userProfile, achievements, addXP, checkAndUnlockAchievements, updateUserProfile, isLoading: profileLoading } = useUserProfile();

    // Local timer state
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(userProfile?.currentPlan || '');
    const [showPlanModal, setShowPlanModal] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Update selectedPlan when userProfile changes
    useEffect(() => {
        if (userProfile?.currentPlan) {
            setSelectedPlan(userProfile.currentPlan);
        }
    }, [userProfile?.currentPlan]);

    // Restore timer state when currentFast changes (app restart)
    useEffect(() => {
        if (currentFast && plan) {
            // Calculate remaining time based on when the fast started
            const startTime = new Date(currentFast.startTime);
            const now = new Date();
            const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
            const remainingSeconds = totalSeconds - elapsedSeconds;

            if (remainingSeconds > 0) {
                // Fast is still active
                setTimeRemaining(remainingSeconds);
                setIsRunning(true);
            } else {
                // Fast should have completed
                setTimeRemaining(0);
                setIsRunning(false);
                // Auto-complete the fast
                completeFast();
            }
        } else {
            // No active fast
            setTimeRemaining(0);
            setIsRunning(false);
        }
    }, [currentFast, plan, totalSeconds, completeFast]);

    // Calculate real stats from database
    const { fastHistory } = useFasting();
    const totalFasts = fastHistory.filter(fast => fast.status === 'completed').length;
    const longestStreak = 0; // TODO: Calculate from fast history dates

    // Use database user data only
    const user = userProfile ? {
        id: userProfile.id,
        username: userProfile.username,
        email: userProfile.email || '',
        totalXP: userProfile.totalXP,
        currentStreak: userProfile.streak,
        longestStreak,
        totalFasts,
        achievements: achievements.map(a => a.id),
        currentPlan: userProfile.currentPlan,
        createdAt: new Date(userProfile.createdAt),
    } : null;

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

    const userLevel = calculateLevel(user?.totalXP || 0);
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

                // Get the actual count from database after completing the fast
                const completedCount = await getCompletedFastsCount();
                await checkAndUnlockAchievements(completedCount, plan.fastingHours, user?.currentStreak || 0);

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
    }, [currentFast, plan, endFast, addXP, checkAndUnlockAchievements, user?.currentStreak]);

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

            // Achievements will be checked after completion

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
        Alert.alert('End Fast', 'Are you sure you want to end your current fast?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'End Fast',
                style: 'destructive',
                onPress: async () => {
                    if (currentFast && plan) {
                        try {
                            // Calculate XP based on how much of the fast was completed
                            const progress = totalSeconds > 0 ? (totalSeconds - timeRemaining) / totalSeconds : 0;
                            const xpEarned = Math.floor(getXPReward(plan.fastingHours) * progress);

                            if (xpEarned > 0) {
                                // Fast was completed - use endFast
                                await endFast(currentFast.id!, xpEarned);
                                await addXP(xpEarned);

                                // Get the actual count from database after completing the fast
                                const completedCount = await getCompletedFastsCount();
                                await checkAndUnlockAchievements(completedCount, plan.fastingHours, user?.currentStreak || 0);

                                Alert.alert('Fast Ended', `You earned ${xpEarned} XP for your progress.`, [
                                    { text: 'OK' },
                                ]);
                            } else {
                                // Fast was ended early - use cancelFast (no XP, no achievements)
                                await cancelFast(currentFast.id!);

                                Alert.alert('Fast Cancelled', 'Fast ended early - no XP earned.', [
                                    { text: 'OK' },
                                ]);
                            }

                            setIsRunning(false);
                            setTimeRemaining(0);
                        } catch (error) {
                            console.error('Failed to end fast:', error);
                            Alert.alert('Error', 'Failed to end fast. Please try again.');
                        }
                    }
                },
            },
        ]);
    };

    const handlePlanSelect = async (planId: string) => {
        try {
            setSelectedPlan(planId);
            setShowPlanModal(false);

            // Update user profile in database
            if (userProfile) {
                await updateUserProfile({ currentPlan: planId });
            }
        } catch (error) {
            console.error('Failed to update plan:', error);
        }
    };



    if (!fontsLoaded || !dbInitialized || fastingLoading || profileLoading || !userProfile || !user) {
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
                        <TouchableOpacity style={styles.statItem} onPress={() => setShowPlanModal(true)}>
                            <Text style={styles.statLabel}>PLAN</Text>
                            <Text style={styles.statValue}>{selectedPlan || 'Select Plan'}</Text>
                        </TouchableOpacity>
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
                {/* <View style={styles.leaderboardSection}> */}
                {/* <Text style={styles.leaderboardLabel}>LEADERBOARD</Text> */}
                {/* <Text style={styles.leaderboardPosition}></Text> */}
                {/* </View> */}

                <View style={styles.leaderboardSection}>
                    <Text style={styles.leaderboardLabel}>TOTAL FASTS</Text>
                    <Text style={styles.leaderboardPosition}>{totalFasts}</Text>
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

                {/* Animation Demo */}
                {/* <AnimationDemo
                    onTriggerLevelUp={triggerLevelUp}
                    onTriggerAchievement={triggerAchievementUnlock}
                /> */}

                {/* Reset Database Button - Remove this in production */}
                {/* <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: COLORS.accent, marginTop: 20 }]}
                    onPress={handleResetDatabase}
                >
                    <Text style={styles.actionButtonText}>RESET DATABASE (TEST)</Text>
                </TouchableOpacity> */}

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

                {/* Plan Selection Modal */}
                <Modal
                    visible={showPlanModal}
                    animationType="slide"
                    presentationStyle="pageSheet"
                >
                    <SafeAreaView style={[styles.modalContainer, { backgroundColor: COLORS.background }]}>
                        <View style={[styles.modalHeader, { backgroundColor: COLORS.surface }]}>
                            <TouchableOpacity onPress={() => setShowPlanModal(false)}>
                                <Text style={[styles.modalCancelText, { color: COLORS.accent }]}>Cancel</Text>
                            </TouchableOpacity>
                            <Text style={[styles.modalTitle, { color: COLORS.textPrimary }]}>Select Plan</Text>
                            <View style={{ width: 60 }} />
                        </View>

                        <View style={styles.planList}>
                            {FASTING_PLANS.map((plan) => (
                                <TouchableOpacity
                                    key={plan.id}
                                    style={[
                                        styles.planItem,
                                        {
                                            backgroundColor: COLORS.surface,
                                            borderColor: selectedPlan === plan.id ? COLORS.accent : COLORS.border,
                                            borderWidth: selectedPlan === plan.id ? 2 : 1,
                                        }
                                    ]}
                                    onPress={() => handlePlanSelect(plan.id)}
                                >
                                    <View style={styles.planInfo}>
                                        <Text style={[styles.planName, { color: COLORS.textPrimary }]}>
                                            {plan.name}
                                        </Text>
                                        <Text style={[styles.planDescription, { color: COLORS.textSecondary }]}>
                                            {plan.fastingHours}h fast, {plan.eatingHours}h eating
                                        </Text>
                                    </View>
                                    {selectedPlan === plan.id && (
                                        <View style={[styles.selectedIndicator, { backgroundColor: COLORS.accent }]} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </SafeAreaView>
                </Modal>
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
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: FONTS.heading,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    modalCancelText: {
        fontSize: 16,
        fontWeight: '600',
    },
    planList: {
        padding: 20,
        gap: 12,
    },
    planItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
    },
    planInfo: {
        flex: 1,
    },
    planName: {
        fontSize: 16,
        fontFamily: FONTS.heading,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    planDescription: {
        fontSize: 14,
        opacity: 0.8,
    },
    selectedIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 12,
    },
});
