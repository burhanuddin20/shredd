import { AchievementAnimation } from '@/components/animations/AchievementAnimation';
import { LevelUpAnimation } from '@/components/animations/LevelUpAnimation';
import { AchievementBadge } from '@/components/shared/achievement-badges';
import { AnimatedXPProgressBar } from '@/components/shared/animated-xp-progress-bar';
import { getRankBadge } from '@/components/shared/rank-badges';
import { COLORS, FONTS } from '@/components/shared/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
    ACHIEVEMENTS,
    calculateLevel,
    getRankName,
} from '@/constants/game';
import { useAnimations } from '@/hooks/use-animations';
import { useDatabase } from '@/src/lib/DatabaseProvider';
import { useFasting } from '@/src/lib/FastingProvider';
import { useUserProfile } from '@/src/lib/UserProfileProvider';
import { Anton_400Regular, useFonts } from '@expo-google-fonts/anton';
import { router } from 'expo-router';
import React, { memo, useMemo, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';



const ProfileScreen = memo(function ProfileScreen() {
    const [fontsLoaded] = useFonts({
        Anton_400Regular,
    });

    const { isInitialized: dbInitialized } = useDatabase();
    const { userProfile, achievements, isLoading } = useUserProfile();

    // Only log when XP actually changes
    const prevXP = React.useRef(userProfile?.totalXP || 0);
    if (prevXP.current !== (userProfile?.totalXP || 0)) {
        console.log('ProfileScreen - XP changed:', prevXP.current, '->', userProfile?.totalXP || 0);
        prevXP.current = userProfile?.totalXP || 0;
    }

    const [showAllAchievements, setShowAllAchievements] = useState(false);
    const [showAllHistory, setShowAllHistory] = useState(false);

    // Calculate real stats from database
    // FastingProvider is shared across all screens, so data updates automatically
    const { fastHistory, isLoading: fastHistoryLoading } = useFasting();
    const totalFasts = fastHistory.filter(fast => fast.status === 'completed').length;


    // Calculate longest streak from fast history
    const calculateLongestStreak = (fasts: typeof fastHistory): number => {
        if (fasts.length === 0) return 0;

        const completedFasts = fasts
            .filter(fast => fast.status === 'completed')
            .map(fast => new Date(fast.startTime))
            .sort((a, b) => a.getTime() - b.getTime());

        if (completedFasts.length === 0) return 0;

        let maxStreak = 1;
        let currentStreak = 1;

        for (let i = 1; i < completedFasts.length; i++) {
            const prevDate = completedFasts[i - 1];
            const currDate = completedFasts[i];
            const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                currentStreak++;
                maxStreak = Math.max(maxStreak, currentStreak);
            } else {
                currentStreak = 1;
            }
        }

        return maxStreak;
    };

    const longestStreak = calculateLongestStreak(fastHistory);

    // Format fast history for display
    const formattedFastHistory = useMemo(() => {
        return fastHistory
            .filter(fast => fast.status === 'completed' || fast.status === 'cancelled')
            .map(fast => {
                const startDate = new Date(fast.startTime);
                const endDate = fast.endTime ? new Date(fast.endTime) : new Date();
                const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 100) / 10);

                return {
                    id: fast.id!.toString(),
                    date: startDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: '2-digit'
                    }),
                    duration: `${duration}h`,
                    type: fast.planId,
                    status: fast.status === 'completed' ? 'Completed' : 'Cancelled'
                };
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [fastHistory]);

    // Use database user data only
    const user = useMemo(() => {
        if (!userProfile) return null;

        return {
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
        };
    }, [userProfile, longestStreak, totalFasts, achievements]);

    // Track previous XP for smooth animations (only updates when XP actually changes)
    const [previousXP, setPreviousXP] = useState(userProfile?.totalXP || 0);

    const userLevel = useMemo(() => calculateLevel(user?.totalXP || 0), [user?.totalXP]);
    const rankName = useMemo(() => getRankName(userLevel.level), [userLevel.level]);

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

    // Track level changes and trigger level up animation
    const prevLevel = React.useRef(userLevel.level);
    const prevAchievementCount = React.useRef(achievements.length);
    const isInitialMount = React.useRef(true);

    React.useEffect(() => {
        const currentXP = userProfile?.totalXP || 0;
        const currentLevel = calculateLevel(currentXP).level;

        // On first mount, just initialize previousXP without animation
        if (isInitialMount.current) {
            isInitialMount.current = false;
            setPreviousXP(currentXP);
            prevLevel.current = currentLevel;
            return;
        }

        // Check if XP changed and if we leveled up
        if (currentXP !== previousXP) {
            const prevLevelCalc = calculateLevel(previousXP).level;

            if (currentLevel > prevLevelCalc) {
                // Level up detected!
                const xpGained = currentXP - previousXP;
                triggerLevelUp(currentLevel, xpGained);
            }

            // Update previousXP after checking level
            setPreviousXP(currentXP);
        }
    }, [userProfile?.totalXP, previousXP, triggerLevelUp]);

    // Track achievement unlocks and trigger animation
    React.useEffect(() => {
        if (achievements.length > prevAchievementCount.current && prevAchievementCount.current > 0) {
            // New achievement unlocked!
            const newAchievements = achievements.slice(prevAchievementCount.current);
            const latestAchievement = newAchievements[0];

            // Find the achievement details from ACHIEVEMENTS constant
            const achievementDetails = ACHIEVEMENTS.find(a => a.id === latestAchievement.id);

            if (achievementDetails) {
                triggerAchievementUnlock(achievementDetails, true);
            }
        }

        prevAchievementCount.current = achievements.length;
    }, [achievements, triggerAchievementUnlock]);

    // Debug loading states (only when loading)
    if (!fontsLoaded || !dbInitialized || isLoading || fastHistoryLoading || !userProfile || !user) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading profile...</Text>
                    <Text style={[styles.loadingText, { fontSize: 12, marginTop: 10 }]}>
                        {!fontsLoaded ? 'Loading fonts...' :
                            !dbInitialized ? 'Initializing database...' :
                                isLoading ? 'Loading user profile...' :
                                    fastHistoryLoading ? 'Loading fast history...' :
                                        !userProfile ? 'No user profile found...' :
                                            !user ? 'Processing user data...' : 'Unknown loading state...'}
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
                    <Text style={styles.title}>PROFILE</Text>

                    {/* Settings Icon */}
                    <TouchableOpacity
                        style={styles.settingsIcon}
                        onPress={() => router.push('/profile/settings')}
                    >
                        <IconSymbol name="gearshape.fill" size={24} color={COLORS.textSecondary} />
                    </TouchableOpacity>

                    {/* Profile Picture & Info */}
                    <View style={styles.profileSection}>
                        <View style={styles.avatarContainer}>
                            {getRankBadge(rankName, 80)}
                        </View>

                        <View style={styles.userInfo}>
                            <Text style={styles.username}>{user.username}</Text>
                            <Text style={styles.rank}>{rankName}</Text>
                        </View>
                    </View>
                </View>

                {/* XP Progress Bar Section */}
                <View style={styles.xpSection}>
                    <AnimatedXPProgressBar
                        currentXP={user.totalXP}
                        previousXP={previousXP}
                        currentStreak={user.currentStreak}
                        showLevel={true}
                        showXP={true}
                        showCurrentStreak={true}
                        onLevelUp={() => triggerLevelUp(userLevel.level, 50)}
                    />
                </View>


                {/* Records Section */}
                <View style={styles.recordsSection}>
                    <View style={styles.recordsRow}>
                        <View style={styles.recordCard}>
                            <Text style={styles.recordValue}>{totalFasts}</Text>
                            <Text style={styles.recordLabel}>TOTAL FASTS</Text>
                        </View>
                        <View style={styles.recordCard}>
                            <Text style={styles.recordValue}>{user.longestStreak} Days</Text>
                            <Text style={styles.recordLabel}>LONGEST STREAK</Text>
                        </View>
                        <View style={styles.recordCard}>
                            <Text style={styles.recordValue}>{Math.floor(user.totalXP / 100)}</Text>
                            <Text style={styles.recordLabel}>DAYS FASTING</Text>
                        </View>
                    </View>
                </View>

                {/* Achievements Section */}
                <View style={styles.achievementsSection}>
                    <Text style={styles.sectionTitle}>ACHIEVEMENTS</Text>
                    <View style={styles.achievementsGrid}>
                        {(showAllAchievements ? ACHIEVEMENTS : ACHIEVEMENTS.filter(achievement => user.achievements.includes(achievement.id)).slice(0, 4)).map((achievement) => {
                            const isUnlocked = user.achievements.includes(achievement.id);
                            return isUnlocked ? (
                                <TouchableOpacity
                                    key={achievement.id}
                                    onPress={() => triggerAchievementUnlock(achievement, true)}
                                >
                                    <AchievementBadge
                                        achievement={achievement}
                                        isUnlocked={true}
                                    />
                                </TouchableOpacity>
                            ) : (
                                <View key={achievement.id}>
                                    <AchievementBadge
                                        achievement={achievement}
                                        isUnlocked={false}
                                    />
                                </View>
                            );
                        })}
                    </View>
                    {ACHIEVEMENTS.length > 4 && (
                        <TouchableOpacity
                            style={styles.toggleButton}
                            onPress={() => setShowAllAchievements(!showAllAchievements)}
                        >
                            <Text style={styles.toggleButtonText}>
                                {showAllAchievements ? 'SHOW LESS' : `SHOW ALL (${ACHIEVEMENTS.length})`}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Fast History Section */}
                <View style={styles.historySection}>
                    <Text style={styles.sectionTitle}>FAST HISTORY</Text>
                    <View style={styles.historyTable}>
                        {/* Table Header */}
                        <View style={styles.tableHeader}>
                            <Text style={styles.headerText}>DATE</Text>
                            <Text style={styles.headerText}>DURATION</Text>
                            <Text style={styles.headerText}>TYPE</Text>
                            <Text style={styles.headerText}>STATUS</Text>
                        </View>

                        {/* Table Rows */}
                        {(showAllHistory ? formattedFastHistory : formattedFastHistory.slice(0, 3)).map((fast, index, array) => (
                            <View key={fast.id} style={styles.tableRow}>
                                <Text style={styles.tableCell}>{fast.date}</Text>
                                <Text style={styles.tableCell}>{fast.duration}</Text>
                                <Text style={styles.tableCell}>{fast.type}</Text>
                                <Text style={[
                                    styles.tableCell,
                                    styles.statusCell,
                                    fast.status === 'Completed' ? styles.completedStatus :
                                        fast.status === 'Current' ? styles.currentStatus :
                                            styles.cancelledStatus
                                ]}>
                                    {fast.status}
                                </Text>
                                {index < array.length - 1 && <View style={styles.rowDivider} />}
                            </View>
                        ))}
                    </View>
                    {formattedFastHistory.length > 3 && (
                        <TouchableOpacity
                            style={styles.toggleButton}
                            onPress={() => setShowAllHistory(!showAllHistory)}
                        >
                            <Text style={styles.toggleButtonText}>
                                {showAllHistory ? 'SHOW LESS' : `SHOW ALL (${formattedFastHistory.length})`}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

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
});

export default ProfileScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        padding: 16,
        gap: 20,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 20,
        position: 'relative',
    },
    title: {
        fontSize: 32,
        fontFamily: FONTS.heading,
        color: COLORS.textSecondary,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 2,
        textShadowColor: '#000000',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    settingsIcon: {
        position: 'absolute',
        top: 20,
        right: 0,
        padding: 8,
    },
    profileSection: {
        alignItems: 'center',
        marginTop: 24,
    },
    avatarContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    userInfo: {
        alignItems: 'center',
    },
    username: {
        fontSize: 24,
        fontFamily: FONTS.monoBold,
        color: COLORS.textPrimary,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    rank: {
        fontSize: 16,
        fontFamily: FONTS.monoBold,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 4,
    },
    xpSection: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    recordsSection: {
        gap: 16,
    },
    recordsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    recordCard: {
        flex: 1,
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    recordValue: {
        fontSize: 24,
        fontFamily: FONTS.monoBold,
        color: COLORS.textPrimary,
        fontWeight: 'bold',
    },
    recordLabel: {
        fontSize: 10,
        fontFamily: FONTS.heading,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: 4,
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 24,
        fontFamily: FONTS.heading,
        color: COLORS.textSecondary,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        textShadowColor: '#000000',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
        textAlign: 'center',
    },
    achievementsSection: {
        gap: 16,
    },
    achievementsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 1,
        justifyContent: 'space-evenly',
    },
    toggleButton: {
        backgroundColor: COLORS.buttonBg,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
        alignSelf: 'center',
        marginTop: 12,
    },
    toggleButtonText: {
        fontSize: 12,
        fontFamily: FONTS.heading,
        color: COLORS.textPrimary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontWeight: 'bold',
    },
    historySection: {
        gap: 16,
    },
    historyTable: {
        backgroundColor: COLORS.surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: COLORS.border,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    headerText: {
        flex: 1,
        fontSize: 12,
        fontFamily: FONTS.heading,
        color: COLORS.textSecondary,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 16,
        position: 'relative',
    },
    tableCell: {
        flex: 1,
        fontSize: 14,
        fontFamily: FONTS.monoBold,
        color: COLORS.textPrimary,
        textAlign: 'center',
    },
    statusCell: {
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    completedStatus: {
        color: '#4CAF50', // Green
    },
    currentStatus: {
        color: COLORS.warning, // Gold
    },
    cancelledStatus: {
        color: COLORS.accent, // Red
    },
    rowDivider: {
        position: 'absolute',
        bottom: 0,
        left: 16,
        right: 16,
        height: 1,
        backgroundColor: COLORS.border,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    loadingText: {
        fontSize: 18,
        fontFamily: FONTS.heading,
        color: COLORS.textPrimary,
        fontWeight: 'bold',
    },
});
