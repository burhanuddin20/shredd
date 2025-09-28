import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Polygon } from 'react-native-svg';
import { COLORS, FONTS } from './theme';

interface AchievementBadgeProps {
    achievement: any;
    isUnlocked: boolean;
}

const getAchievementColor = (achievementId: string, isUnlocked: boolean) => {
    if (!isUnlocked) return COLORS.border;

    // Easy achievements (bronze)
    const easyAchievements = ['first_fast', 'fast_12h', 'total_10'];
    if (easyAchievements.includes(achievementId)) return COLORS.bronze;

    // Medium achievements (silver)
    const mediumAchievements = [
        'fast_16h',
        'fast_18h',
        'total_20',
        'total_50',
        'streak_7',
        'streak_14',
        'streak_30',
    ];
    if (mediumAchievements.includes(achievementId)) return COLORS.silver;

    // Hard achievements (gold)
    return COLORS.gold;
};

const getAchievementSVG = (achievementId: string, isUnlocked: boolean) => {
    const color = getAchievementColor(achievementId, isUnlocked);

    switch (achievementId) {
        case 'first_fast':
            return (
                <Svg width={32} height={32} viewBox="0 0 128 128">
                    <Path
                        d="M64 10 L108 26 V62 C108 90 88 108 64 118 C40 108 20 90 20 62 V26 Z"
                        fill="none"
                        stroke={color}
                        strokeWidth="8"
                        strokeLinejoin="round"
                    />
                    <Path
                        d="M64 36 C56 48, 76 56, 64 76 C80 64, 80 50, 70 40 C72 48,64 50,64 36 Z"
                        fill="none"
                        stroke={color}
                        strokeWidth="6"
                    />
                </Svg>
            );
        case 'fast_12h':
        case 'fast_16h':
        case 'fast_18h':
        case 'fast_20h':
        case 'fast_24h':
            return (
                <Svg width={32} height={32} viewBox="0 0 128 128">
                    <Path
                        d="M64 10 L108 26 V62 C108 90 88 108 64 118 C40 108 20 90 20 62 V26 Z"
                        fill="none"
                        stroke={color}
                        strokeWidth="8"
                        strokeLinejoin="round"
                    />
                    <Path
                        d="M48 78 Q64 52 80 78"
                        fill="none"
                        stroke={color}
                        strokeWidth="6"
                    />
                    <Circle cx="64" cy="58" r="8" fill="none" stroke={color} strokeWidth="6" />
                    <Path d="M60 60 L68 52" stroke={color} strokeWidth="6" />
                </Svg>
            );
        case 'streak_365':
            return (
                <Svg width={32} height={32} viewBox="0 0 128 128">
                    <Path
                        d="M64 10 L108 26 V62 C108 90 88 108 64 118 C40 108 20 90 20 62 V26 Z"
                        fill="none"
                        stroke={color}
                        strokeWidth="8"
                        strokeLinejoin="round"
                    />
                    <Circle cx="64" cy="60" r="12" fill="none" stroke={color} strokeWidth="6" />
                    <Path
                        d="M64 44 V36 M64 84 V76 M48 60 H40 M88 60 H80 M52 48 L46 42 M76 48 L82 42 M52 72 L46 78 M76 72 L82 78"
                        stroke={color}
                        strokeWidth="4"
                        strokeLinecap="round"
                    />
                </Svg>
            );
        default:
            return (
                <Svg width={32} height={32} viewBox="0 0 128 128">
                    <Path
                        d="M64 10 L108 26 V62 C108 90 88 108 64 118 C40 108 20 90 20 62 V26 Z"
                        fill="none"
                        stroke={color}
                        strokeWidth="8"
                        strokeLinejoin="round"
                    />
                    <Polygon
                        points="64,38 68,48 78,48 70,54 74,64 64,58 54,64 58,54 50,48 60,48"
                        fill={color}
                    />
                </Svg>
            );
    }
};

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
    achievement,
    isUnlocked,
}) => {
    return (
        <View style={[styles.achievementBadge, !isUnlocked && styles.lockedBadge]}>
            {getAchievementSVG(achievement.id, isUnlocked)}
            <Text style={[styles.achievementLabel, !isUnlocked && styles.lockedText]}>
                {achievement.name}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    achievementBadge: {
        alignItems: 'center',
        padding: 8,
        backgroundColor: COLORS.surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
        minWidth: 80,
    },
    lockedBadge: {
        opacity: 0.5,
    },
    achievementLabel: {
        fontSize: 10,
        fontFamily: FONTS.heading,
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    lockedText: {
        color: COLORS.textSecondary,
    },
});
