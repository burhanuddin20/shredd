import { getRankBadge } from '@/components/shared/rank-badges';
import { COLORS, FONTS } from '@/components/shared/theme';
import { useHaptics } from '@/hooks/use-haptics';
import React, { useEffect } from 'react';
import { Dimensions, Modal, StyleSheet, Text, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface LevelUpAnimationProps {
    visible: boolean;
    onClose: () => void;
    newLevel: number;
    newRank: string;
    xpEarned: number;
}

export const LevelUpAnimation: React.FC<LevelUpAnimationProps> = ({
    visible,
    onClose,
    newLevel,
    newRank,
    xpEarned,
}) => {
    // Haptics
    const { heavy, success, warning } = useHaptics();

    // Animation values
    const scale = useSharedValue(0);
    const rotation = useSharedValue(0);
    const glowOpacity = useSharedValue(0);
    const textOpacity = useSharedValue(0);
    const textTranslateY = useSharedValue(50);
    const confettiTrigger = useSharedValue(0);

    // Epic animation values
    const heroScale = useSharedValue(0);
    const heroRotation = useSharedValue(0);
    const epicGlowOpacity = useSharedValue(0);
    const epicGlowScale = useSharedValue(0);
    const lightningOpacity = useSharedValue(0);
    const lightningRotation = useSharedValue(0);
    const screenShake = useSharedValue(0);
    const rankGlow = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            // EPIC HERO ANIMATION SEQUENCE

            // Phase 1: Dramatic entrance (0-800ms) - HAPTICS
            heavy(); // Initial impact haptic
            screenShake.value = withSequence(
                withTiming(5, { duration: 100 }),
                withTiming(-3, { duration: 100 }),
                withTiming(2, { duration: 100 }),
                withTiming(0, { duration: 200 }),
                withTiming(0, { duration: 300 })
            );

            // Phase 2: Lightning effect (200-600ms) - HAPTICS
            setTimeout(() => warning(), 200); // Lightning haptic
            lightningOpacity.value = withSequence(
                withDelay(200, withTiming(1, { duration: 100 })),
                withTiming(0, { duration: 50 }),
                withTiming(1, { duration: 100 }),
                withTiming(0, { duration: 150 })
            );
            lightningRotation.value = withRepeat(
                withTiming(360, { duration: 200, easing: Easing.linear }),
                2,
                false
            );

            // Phase 3: Hero insignia dramatic entrance (400-1200ms)
            heroScale.value = withSequence(
                withDelay(400, withTiming(0.5, { duration: 200 })),
                withTiming(1.8, { duration: 300 }),
                withTiming(1.2, { duration: 200 }),
                withTiming(1.0, { duration: 100 })
            );

            heroRotation.value = withSequence(
                withDelay(400, withTiming(180, { duration: 400 })),
                withTiming(0, { duration: 200 })
            );

            // Phase 4: Epic glow explosion (600-1400ms)
            epicGlowOpacity.value = withSequence(
                withDelay(600, withTiming(1, { duration: 200 })),
                withTiming(0.8, { duration: 400 }),
                withTiming(0, { duration: 200 })
            );
            epicGlowScale.value = withSequence(
                withDelay(600, withTiming(0.5, { duration: 0 })),
                withTiming(2.5, { duration: 600 }),
                withTiming(3.0, { duration: 200 })
            );

            // Phase 5: Rank glow effect (800-1600ms)
            rankGlow.value = withSequence(
                withDelay(800, withTiming(1, { duration: 400 })),
                withRepeat(
                    withSequence(
                        withTiming(0.3, { duration: 200 }),
                        withTiming(1, { duration: 200 })
                    ),
                    2,
                    false
                ),
                withTiming(0, { duration: 400 })
            );

            // Phase 6: Text dramatic entrance (1000-1500ms)
            textOpacity.value = withDelay(1000, withTiming(1, { duration: 300 }));
            textTranslateY.value = withDelay(1000, withTiming(0, { duration: 500 }));

            // Phase 7: Confetti explosion (1200ms) - HAPTICS
            setTimeout(() => success(), 1200); // Success haptic for confetti
            confettiTrigger.value = withDelay(1200, withTiming(1, { duration: 100 }));

            // Auto close after 6 seconds (extended for epic effect)
            setTimeout(() => {
                onClose();
            }, 6000);
        }
    }, [visible]);

    const animatedHeroInsigniaStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: heroScale.value },
            { rotate: `${heroRotation.value}deg` },
        ],
    }));

    const animatedEpicGlowStyle = useAnimatedStyle(() => ({
        opacity: epicGlowOpacity.value,
        transform: [{ scale: epicGlowScale.value }],
    }));

    const animatedLightningStyle = useAnimatedStyle(() => ({
        opacity: lightningOpacity.value,
        transform: [{ rotate: `${lightningRotation.value}deg` }],
    }));

    const animatedScreenShakeStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: screenShake.value }],
    }));

    const animatedRankGlowStyle = useAnimatedStyle(() => ({
        opacity: rankGlow.value,
    }));

    const animatedTextStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value,
        transform: [{ translateY: textTranslateY.value }],
    }));

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="fade">
            <Animated.View style={[styles.overlay, animatedScreenShakeStyle]}>
                {/* Lightning Effect */}
                <Animated.View style={[styles.lightningContainer, animatedLightningStyle]}>
                    <View style={styles.lightning1} />
                    <View style={styles.lightning2} />
                    <View style={styles.lightning3} />
                </Animated.View>

                {/* Epic Glow Explosion */}
                <Animated.View style={[styles.epicGlowContainer, animatedEpicGlowStyle]}>
                    <View style={styles.epicGlowRing} />
                    <View style={[styles.epicGlowRing, styles.epicGlowRing2]} />
                    <View style={[styles.epicGlowRing, styles.epicGlowRing3]} />
                    <View style={[styles.epicGlowRing, styles.epicGlowRing4]} />
                </Animated.View>

                {/* Confetti Explosion */}
                <ConfettiCannon
                    count={200}
                    origin={{ x: width / 2, y: height / 2 }}
                    colors={[COLORS.gold, COLORS.warning, COLORS.accent, COLORS.textSecondary]}
                    autoStart={visible}
                    fadeOut={true}
                    explosionSpeed={500}
                />

                {/* Hero Insignia - MUCH BIGGER */}
                <Animated.View style={[styles.heroInsigniaContainer, animatedHeroInsigniaStyle]}>
                    <Animated.View style={[styles.rankGlowContainer, animatedRankGlowStyle]}>
                        <View style={styles.rankGlow} />
                    </Animated.View>
                    {getRankBadge(newRank, 200)}
                </Animated.View>

                {/* Epic Text */}
                <Animated.View style={[styles.textContainer, animatedTextStyle]}>
                    <Text style={styles.epicLevelUpText}>⚡ LEVEL UP! ⚡</Text>
                    <Text style={styles.epicRankText}>{newRank}</Text>
                    <Text style={styles.epicXpText}>+{xpEarned} XP</Text>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Lightning Effects
    lightningContainer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    lightning1: {
        position: 'absolute',
        width: 4,
        height: 200,
        backgroundColor: COLORS.warning,
        opacity: 0.8,
        transform: [{ rotate: '45deg' }],
    },
    lightning2: {
        position: 'absolute',
        width: 3,
        height: 150,
        backgroundColor: COLORS.gold,
        opacity: 0.9,
        transform: [{ rotate: '-30deg' }],
    },
    lightning3: {
        position: 'absolute',
        width: 2,
        height: 180,
        backgroundColor: COLORS.accent,
        opacity: 0.7,
        transform: [{ rotate: '60deg' }],
    },
    // Epic Glow Effects
    epicGlowContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    epicGlowRing: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        borderWidth: 4,
        borderColor: COLORS.gold,
        opacity: 0.8,
    },
    epicGlowRing2: {
        width: 400,
        height: 400,
        borderRadius: 200,
        borderColor: COLORS.warning,
        opacity: 0.6,
    },
    epicGlowRing3: {
        width: 500,
        height: 500,
        borderRadius: 250,
        borderColor: COLORS.accent,
        opacity: 0.4,
    },
    epicGlowRing4: {
        width: 600,
        height: 600,
        borderRadius: 300,
        borderColor: COLORS.textSecondary,
        opacity: 0.2,
    },
    // Hero Insignia
    heroInsigniaContainer: {
        marginBottom: 40,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rankGlowContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rankGlow: {
        width: 280,
        height: 280,
        borderRadius: 140,
        backgroundColor: COLORS.gold,
        opacity: 0.3,
    },
    textContainer: {
        alignItems: 'center',
    },
    epicLevelUpText: {
        fontSize: 36,
        fontFamily: FONTS.heading,
        color: COLORS.gold,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 3,
        textShadowColor: COLORS.accent,
        textShadowOffset: { width: 0, height: 3 },
        textShadowRadius: 6,
        marginBottom: 12,
    },
    epicRankText: {
        fontSize: 28,
        fontFamily: FONTS.heading,
        color: COLORS.textPrimary,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 8,
        textShadowColor: COLORS.warning,
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    epicXpText: {
        fontSize: 22,
        fontFamily: FONTS.monoBold,
        color: COLORS.textSecondary,
        fontWeight: 'bold',
        textShadowColor: COLORS.gold,
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
});
