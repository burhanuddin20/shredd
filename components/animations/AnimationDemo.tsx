import { COLORS, FONTS } from '@/components/shared/theme';
import { ACHIEVEMENTS } from '@/constants/game';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AnimationDemoProps {
    onTriggerLevelUp: (level: number, xp: number) => void;
    onTriggerAchievement: (achievement: any, isUnlocked: boolean) => void;
}

export const AnimationDemo: React.FC<AnimationDemoProps> = ({
    onTriggerLevelUp,
    onTriggerAchievement,
}) => {

    const handleLevelUp = () => {
        onTriggerLevelUp(5, 150); // Level 5, 150 XP earned
    };

    const handleAchievementUnlock = () => {
        const achievement = ACHIEVEMENTS[0]; // First achievement
        onTriggerAchievement(achievement, true);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Animation Demo</Text>
            <Text style={styles.subtitle}>Tap buttons to test animations</Text>

            <TouchableOpacity style={styles.button} onPress={handleLevelUp}>
                <Text style={styles.buttonText}>🎖️ TRIGGER LEVEL UP</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleAchievementUnlock}>
                <Text style={styles.buttonText}>🏅 TRIGGER ACHIEVEMENT</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: COLORS.surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
        margin: 16,
    },
    title: {
        fontSize: 20,
        fontFamily: FONTS.heading,
        color: COLORS.textPrimary,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: FONTS.heading,
        color: COLORS.textSecondary,
        marginBottom: 16,
    },
    button: {
        backgroundColor: COLORS.buttonBg,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 6,
        marginBottom: 12,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontFamily: FONTS.heading,
        color: COLORS.textPrimary,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});
