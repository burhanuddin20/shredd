import { AchievementBadge } from '@/components/shared/achievement-badges';
import { COLORS, FONTS } from '@/components/shared/theme';
import React, { useEffect } from 'react';
import { Dimensions, Modal, StyleSheet, Text, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface AchievementAnimationProps {
    visible: boolean;
    onClose: () => void;
    achievement: any;
    isUnlocked: boolean;
}

export const AchievementAnimation: React.FC<AchievementAnimationProps> = ({
    visible,
    onClose,
    achievement,
    isUnlocked,
}) => {
    // Animation values
    const badgeScale = useSharedValue(0);
    const badgeOpacity = useSharedValue(0);
    const ringScale = useSharedValue(0);
    const ringOpacity = useSharedValue(0);
    const textOpacity = useSharedValue(0);
    const textTranslateY = useSharedValue(50);
    const confettiTrigger = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            // Badge animations
            badgeOpacity.value = withTiming(1, { duration: 300 });
            badgeScale.value = withSequence(
                withTiming(0.8, { duration: 200 }),
                withTiming(1.1, { duration: 200 }),
                withTiming(1, { duration: 200 })
            );

            // Ring animations
            ringScale.value = withSequence(
                withTiming(0, { duration: 0 }),
                withDelay(400, withTiming(1.5, { duration: 600 })),
                withTiming(2, { duration: 400 })
            );
            ringOpacity.value = withSequence(
                withTiming(0, { duration: 0 }),
                withDelay(400, withTiming(1, { duration: 600 })),
                withTiming(0, { duration: 400 })
            );

            // Text animations
            textOpacity.value = withDelay(800, withTiming(1, { duration: 500 }));
            textTranslateY.value = withDelay(800, withTiming(0, { duration: 500 }));

            // Confetti
            confettiTrigger.value = withDelay(600, withTiming(1, { duration: 100 }));

            // Auto close after 3 seconds
            setTimeout(() => {
                onClose();
            }, 3000);
        }
    }, [visible]);

    const animatedBadgeStyle = useAnimatedStyle(() => ({
        opacity: badgeOpacity.value,
        transform: [{ scale: badgeScale.value }],
    }));

    const animatedRingStyle = useAnimatedStyle(() => ({
        transform: [{ scale: ringScale.value }],
        opacity: ringOpacity.value,
    }));

    const animatedTextStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value,
        transform: [{ translateY: textTranslateY.value }],
    }));

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.overlay}>
                {/* Confetti */}
                {confettiTrigger.value > 0 && (
                    <ConfettiCannon
                        count={50}
                        origin={{ x: width / 2, y: height / 2 }}
                        colors={[COLORS.gold, COLORS.silver, COLORS.bronze]}
                        autoStart={true}
                        fadeOut={true}
                    />
                )}

                {/* Glowing Ring */}
                <Animated.View style={[styles.ringContainer, animatedRingStyle]}>
                    <View style={styles.glowRing} />
                    <View style={[styles.glowRing, styles.glowRing2]} />
                </Animated.View>

                {/* Achievement Badge */}
                <Animated.View style={[styles.badgeContainer, animatedBadgeStyle]}>
                    <AchievementBadge achievement={achievement} isUnlocked={isUnlocked} />
                </Animated.View>

                {/* Text */}
                <Animated.View style={[styles.textContainer, animatedTextStyle]}>
                    <Text style={styles.unlockedText}>ACHIEVEMENT UNLOCKED</Text>
                    <Text style={styles.achievementName}>{achievement.name}</Text>
                    <Text style={styles.achievementDescription}>{achievement.description}</Text>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ringContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    glowRing: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 3,
        borderColor: COLORS.gold,
        opacity: 0.8,
    },
    glowRing2: {
        width: 200,
        height: 200,
        borderRadius: 100,
        opacity: 0.4,
    },
    badgeContainer: {
        marginBottom: 40,
    },
    textContainer: {
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    unlockedText: {
        fontSize: 20,
        fontFamily: FONTS.heading,
        color: COLORS.gold,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 2,
        textShadowColor: '#000000',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
        marginBottom: 12,
    },
    achievementName: {
        fontSize: 24,
        fontFamily: FONTS.heading,
        color: COLORS.textPrimary,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
        textAlign: 'center',
    },
    achievementDescription: {
        fontSize: 16,
        fontFamily: FONTS.heading,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
});
