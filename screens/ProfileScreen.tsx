import { AchievementBadge } from '@/components/shared/achievement-badges';
import { getRankBadge } from '@/components/shared/rank-badges';
import { COLORS, FONTS } from '@/components/shared/theme';
import { XPProgressBar } from '@/components/shared/xp-progress-bar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
    ACHIEVEMENTS,
    calculateLevel,
    getRankName,
    UserProfile,
} from '@/constants/game';
import { Anton_400Regular, useFonts } from '@expo-google-fonts/anton';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock user data
const mockUser: UserProfile = {
    id: '1',
    username: 'trilly',
    email: 'scout@surveycorps.com',
    profilePicture: 'https://i.pravatar.cc/100',
    totalXP: 100,
    currentStreak: 5,
    longestStreak: 12,
    totalFasts: 15,
    achievements: ['first_fast', 'fast_16h', 'total_10'],
    currentPlan: '16:8',
    createdAt: new Date('2024-01-01'),
};

// Mock fast history data
const mockFastHistory = [
    {
        id: '1',
        date: '2024-01-15',
        duration: '16:30:00',
        type: '16:8',
        status: 'Completed',
    },
    {
        id: '2',
        date: '2024-01-14',
        duration: '18:45:00',
        type: '18:6',
        status: 'Completed',
    },
    {
        id: '3',
        date: '2024-01-13',
        duration: '12:15:00',
        type: '16:8',
        status: 'Cancelled',
    },
    {
        id: '4',
        date: '2024-01-12',
        duration: '16:00:00',
        type: '16:8',
        status: 'Completed',
    },
    {
        id: '5',
        date: '2024-01-11',
        duration: '20:30:00',
        type: '20:4',
        status: 'Completed',
    },
];

export default function ProfileScreen() {
    const [fontsLoaded] = useFonts({
        Anton_400Regular,
    });

    const [user] = useState<UserProfile>(mockUser);
    const [showAllAchievements, setShowAllAchievements] = useState(false);
    const [showAllHistory, setShowAllHistory] = useState(false);
    const userLevel = calculateLevel(user.totalXP);
    const rankName = getRankName(userLevel.level);

    if (!fontsLoaded) {
        return null;
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
                    <XPProgressBar
                        currentXP={user.totalXP}
                        currentStreak={user.currentStreak}
                        showLevel={true}
                        showXP={true}
                        showCurrentStreak={true}
                    />
                </View>


                {/* Records Section */}
                <View style={styles.recordsSection}>
                    <View style={styles.recordsRow}>
                        <View style={styles.recordCard}>
                            <Text style={styles.recordValue}>{user.totalFasts}</Text>
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
                        {(showAllAchievements ? ACHIEVEMENTS : ACHIEVEMENTS.filter(achievement => user.achievements.includes(achievement.id)).slice(0, 4)).map((achievement) => (
                            <AchievementBadge
                                key={achievement.id}
                                achievement={achievement}
                                isUnlocked={user.achievements.includes(achievement.id)}
                            />
                        ))}
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
                    <View style={styles.historyList}>
                        {(showAllHistory ? mockFastHistory : mockFastHistory.slice(0, 3)).map((fast, index, array) => (
                            <View key={fast.id} style={styles.historyRow}>
                                <View style={styles.historyInfo}>
                                    <Text style={styles.historyDate}>{fast.date}</Text>
                                    <Text style={styles.historyDuration}>{fast.duration}</Text>
                                </View>
                                <View style={styles.historyDetails}>
                                    <Text style={styles.historyType}>{fast.type}</Text>
                                    <Text style={[
                                        styles.historyStatus,
                                        fast.status === 'Completed' ? styles.completedStatus : styles.cancelledStatus
                                    ]}>
                                        {fast.status}
                                    </Text>
                                </View>
                                {index < array.length - 1 && <View style={styles.historyDivider} />}
                            </View>
                        ))}
                    </View>
                    {mockFastHistory.length > 3 && (
                        <TouchableOpacity
                            style={styles.toggleButton}
                            onPress={() => setShowAllHistory(!showAllHistory)}
                        >
                            <Text style={styles.toggleButtonText}>
                                {showAllHistory ? 'SHOW LESS' : `SHOW ALL (${mockFastHistory.length})`}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
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
    historyList: {
        backgroundColor: COLORS.surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
    },
    historyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    historyInfo: {
        flex: 1,
    },
    historyDate: {
        fontSize: 16,
        fontFamily: FONTS.heading,
        color: COLORS.textPrimary,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    historyDuration: {
        fontSize: 14,
        fontFamily: FONTS.monoBold,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    historyDetails: {
        alignItems: 'flex-end',
    },
    historyType: {
        fontSize: 14,
        fontFamily: FONTS.heading,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    historyStatus: {
        fontSize: 12,
        fontFamily: FONTS.heading,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: 2,
    },
    completedStatus: {
        color: COLORS.textPrimary,
    },
    cancelledStatus: {
        color: COLORS.accent,
    },
    historyDivider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginHorizontal: 16,
    },
});
