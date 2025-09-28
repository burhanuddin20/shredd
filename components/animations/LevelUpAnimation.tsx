import { getRankBadge } from '@/components/shared/rank-badges';
import { COLORS, FONTS } from '@/components/shared/theme';
import React, { useEffect } from 'react';
import { Dimensions, Modal, StyleSheet, Text, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
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
    // Animation values
    const scale = useSharedValue(0);
    const rotation = useSharedValue(0);
    const glowOpacity = useSharedValue(0);
    const textOpacity = useSharedValue(0);
    const textTranslateY = useSharedValue(50);
    const confettiTrigger = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            // Start animations
            scale.value = withSequence(
                withTiming(1.2, { duration: 600 }),
                withTiming(1, { duration: 400 })
            );

            rotation.value = withSequence(
                withTiming(10, { duration: 300 }),
                withTiming(-5, { duration: 300 }),
                withTiming(0, { duration: 400 })
            );

            glowOpacity.value = withSequence(
                withTiming(0, { duration: 0 }),
                withDelay(400, withTiming(1, { duration: 800 })),
                withTiming(0, { duration: 400 })
            );

            textOpacity.value = withDelay(800, withTiming(1, { duration: 500 }));
            textTranslateY.value = withDelay(800, withTiming(0, { duration: 500 }));

            // Trigger confetti
            confettiTrigger.value = withDelay(600, withTiming(1, { duration: 100 }));

            // Auto close after 4 seconds
            setTimeout(() => {
                onClose();
            }, 4000);
        }
    }, [visible]);

    const animatedInsigniaStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: scale.value },
            { rotate: `${rotation.value}deg` },
        ],
    }));

    const animatedGlowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
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
                        count={100}
                        origin={{ x: width / 2, y: height / 2 }}
                        colors={[COLORS.gold, COLORS.warning, COLORS.textSecondary]}
                        autoStart={true}
                        fadeOut={true}
                    />
                )}

                {/* Glow Effect */}
                <Animated.View style={[styles.glowContainer, animatedGlowStyle]}>
                    <View style={styles.glowRing} />
                    <View style={[styles.glowRing, styles.glowRing2]} />
                    <View style={[styles.glowRing, styles.glowRing3]} />
                </Animated.View>

                {/* Insignia */}
                <Animated.View style={[styles.insigniaContainer, animatedInsigniaStyle]}>
                    {getRankBadge(newRank, 120)}
                </Animated.View>

                {/* Text */}
                <Animated.View style={[styles.textContainer, animatedTextStyle]}>
                    <Text style={styles.levelUpText}>LEVEL UP!</Text>
                    <Text style={styles.rankText}>{newRank}</Text>
                    <Text style={styles.xpText}>+{xpEarned} XP</Text>
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
    glowContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    glowRing: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 2,
        borderColor: COLORS.gold,
        opacity: 0.6,
    },
    glowRing2: {
        width: 250,
        height: 250,
        borderRadius: 125,
        opacity: 0.4,
    },
    glowRing3: {
        width: 300,
        height: 300,
        borderRadius: 150,
        opacity: 0.2,
    },
    insigniaContainer: {
        marginBottom: 40,
    },
    textContainer: {
        alignItems: 'center',
    },
    levelUpText: {
        fontSize: 32,
        fontFamily: FONTS.heading,
        color: COLORS.gold,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 2,
        textShadowColor: '#000000',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
        marginBottom: 8,
    },
    rankText: {
        fontSize: 24,
        fontFamily: FONTS.heading,
        color: COLORS.textPrimary,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    xpText: {
        fontSize: 18,
        fontFamily: FONTS.monoBold,
        color: COLORS.textSecondary,
        fontWeight: 'bold',
    },
});
