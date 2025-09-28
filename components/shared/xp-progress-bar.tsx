import { calculateLevel, XP_PER_LEVEL } from '@/constants/game';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS } from './theme';

interface XPProgressBarProps {
    currentXP: number;
    currentStreak?: number;
    showLevel?: boolean;
    showXP?: boolean;
    showCurrentStreak?: boolean;
}

export const XPProgressBar: React.FC<XPProgressBarProps> = ({
    currentXP,
    currentStreak = 0,
    showLevel = true,
    showXP = true,
    showCurrentStreak = true,
}) => {
    const userLevel = calculateLevel(currentXP);
    const currentLevelXP = userLevel.currentLevelXP;
    // todo this should just be a constant
    const nextLevelXP = XP_PER_LEVEL[userLevel.level + 1];
    const progress = (currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP);

    return (
        <View style={styles.container}>
            {/* XP Progress Bar */}
            <View style={styles.progressBarContainer}>
                <View style={styles.progressBarTrack}>
                    <View
                        style={[
                            styles.progressBarFill,
                            { width: `${Math.min(progress * 100, 100)}%` }
                        ]}
                    />
                </View>
                <View style={styles.xpLabels}>
                    <Text style={styles.xpLabel}>{currentLevelXP} XP</Text>
                    <Text style={styles.xpLabel}>{nextLevelXP} XP</Text>
                </View>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                {showLevel && (
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>LEVEL</Text>
                        <Text style={styles.statValue}>{userLevel.level}</Text>
                    </View>
                )}
                {showXP && (
                    <>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>XP</Text>
                            <Text style={styles.statValue}>{currentXP}</Text>
                        </View>
                    </>
                )}
                {showCurrentStreak && (
                    <>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>STREAK</Text>
                            <Text style={styles.statValue}>{currentStreak}</Text>
                        </View>
                    </>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 12,
    },
    progressBarContainer: {
        gap: 8,
    },
    progressBarTrack: {
        height: 8,
        backgroundColor: COLORS.border,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: COLORS.gold,
        borderRadius: 4,
    },
    xpLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    xpLabel: {
        fontSize: 12,
        fontFamily: FONTS.monoBold,
        color: COLORS.textSecondary,
        fontWeight: 'bold',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
        gap: 4,
        flex: 1,
    },
    statDivider: {
        width: 1,
        height: 32,
        backgroundColor: COLORS.border,
    },
    statLabel: {
        fontSize: 16,
        fontFamily: FONTS.monoBold,
        color: COLORS.textSecondary,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statValue: {
        fontSize: 16,
        fontFamily: FONTS.monoBold,
        color: COLORS.textPrimary,
        fontWeight: 'bold',
    },
});
