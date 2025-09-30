import { calculateLevel, XP_PER_LEVEL } from '@/constants/game';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { COLORS, FONTS } from './theme';

interface AnimatedXPProgressBarProps {
    currentXP: number;
    previousXP: number;
    currentStreak?: number;
    showLevel?: boolean;
    showXP?: boolean;
    showCurrentStreak?: boolean;
    onLevelUp?: () => void;
}

export const AnimatedXPProgressBar: React.FC<AnimatedXPProgressBarProps> = ({
    currentXP,
    previousXP,
    currentStreak = 0,
    showLevel = true,
    showXP = true,
    showCurrentStreak = true,
    onLevelUp,
}) => {
    const userLevel = calculateLevel(currentXP);
    const previousUserLevel = calculateLevel(previousXP);
    const currentLevelXP = userLevel.currentLevelXP; // XP within current level (e.g., 50 for 300 total XP at level 2)
    const nextLevelXP = userLevel.nextLevelXP; // XP needed for next level (e.g., 250 for level 2→3)

    // Get the actual XP thresholds for display
    const currentLevelThreshold = XP_PER_LEVEL[userLevel.level] || 0; // e.g., 250 for level 2
    const nextLevelThreshold = XP_PER_LEVEL[userLevel.level + 1] || currentLevelThreshold; // e.g., 500 for level 3

    // Check if level up occurred
    const leveledUp = userLevel.level > previousUserLevel.level;

    // Animation values
    const progressWidth = useSharedValue(0);
    const levelScale = useSharedValue(1);
    const xpScale = useSharedValue(1);

    useEffect(() => {
        // Calculate progress within current level
        const progress = nextLevelXP > 0 ? currentLevelXP / nextLevelXP : 0;
        const targetWidth = Math.min(progress * 100, 100);

        if (leveledUp) {
            // Level up animation sequence
            progressWidth.value = withSequence(
                withTiming(100, { duration: 300 }),
                withTiming(0, { duration: 0 }), // Reset to 0
                withTiming(targetWidth, { duration: 800 })
            );

            levelScale.value = withSequence(
                withTiming(1.2, { duration: 200 }),
                withTiming(1, { duration: 200 })
            );

            xpScale.value = withSequence(
                withTiming(1.1, { duration: 200 }),
                withTiming(1, { duration: 200 })
            );

            // Trigger level up callback
            if (onLevelUp) {
                setTimeout(() => onLevelUp(), 500);
            }
        } else {
            // Normal progress animation
            progressWidth.value = withTiming(targetWidth, { duration: 600 });
        }
    }, [currentXP, previousXP, leveledUp]);

    const animatedProgressStyle = useAnimatedStyle(() => ({
        width: `${progressWidth.value}%`,
    }));

    const animatedLevelStyle = useAnimatedStyle(() => ({
        transform: [{ scale: levelScale.value }],
    }));

    const animatedXPStyle = useAnimatedStyle(() => ({
        transform: [{ scale: xpScale.value }],
    }));

    return (
        <View style={styles.container}>
            {/* XP Progress Bar */}
            <View style={styles.progressBarContainer}>
                <View style={styles.progressBarTrack}>
                    <Animated.View
                        style={[styles.progressBarFill, animatedProgressStyle]}
                    />
                </View>
                <View style={styles.xpLabels}>
                    <Text style={styles.xpLabel}>{currentLevelThreshold} XP</Text>
                    <Text style={styles.xpLabel}>{nextLevelThreshold} XP</Text>
                </View>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                {showLevel && (
                    <Animated.View style={[styles.statItem, animatedLevelStyle]}>
                        <Text style={styles.statLabel}>LEVEL</Text>
                        <Text style={styles.statValue}>{userLevel.level}</Text>
                    </Animated.View>
                )}
                {showXP && (
                    <>
                        <View style={styles.statDivider} />
                        <Animated.View style={[styles.statItem, animatedXPStyle]}>
                            <Text style={styles.statLabel}>XP</Text>
                            <Text style={styles.statValue}>{currentXP}</Text>
                        </Animated.View>
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
        fontSize: 10,
        fontFamily: FONTS.heading,
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
