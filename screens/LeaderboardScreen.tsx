import { COLORS, FONTS } from '@/components/shared/theme';
import { Anton_400Regular, useFonts } from '@expo-google-fonts/anton';
import React from 'react';
import {
    StyleSheet,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Polygon } from 'react-native-svg';

// Trophy icon for coming soon
const TrophyIcon = ({ size = 80 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 128 128">
        {/* Trophy cup */}
        <Path
            d="M40 35 L40 50 C40 65, 50 75, 64 75 C78 75, 88 65, 88 50 L88 35"
            fill="none"
            stroke={COLORS.accent}
            strokeWidth="6"
            strokeLinecap="round"
        />
        {/* Trophy base */}
        <Path
            d="M50 75 L50 85 L78 85 L78 75"
            fill="none"
            stroke={COLORS.accent}
            strokeWidth="6"
            strokeLinecap="round"
        />
        <Path
            d="M45 85 L83 85 L85 95 L43 95 Z"
            fill={COLORS.accent}
            opacity="0.3"
        />
        {/* Trophy handles */}
        <Path
            d="M40 38 C28 38, 25 42, 25 48 C25 54, 28 58, 35 58 L40 58"
            fill="none"
            stroke={COLORS.accent}
            strokeWidth="6"
            strokeLinecap="round"
        />
        <Path
            d="M88 38 C100 38, 103 42, 103 48 C103 54, 100 58, 93 58 L88 58"
            fill="none"
            stroke={COLORS.accent}
            strokeWidth="6"
            strokeLinecap="round"
        />
        {/* Star on trophy */}
        <Polygon
            points="64,42 67,48 73,48 68,52 70,58 64,54 58,58 60,52 55,48 61,48"
            fill={COLORS.warning}
        />
        {/* Glow effect */}
        <Circle cx="64" cy="55" r="35" fill="none" stroke={COLORS.accent} strokeWidth="2" opacity="0.1" />
        <Circle cx="64" cy="55" r="40" fill="none" stroke={COLORS.accent} strokeWidth="1" opacity="0.05" />
    </Svg>
);

export default function LeaderboardScreen() {
    const [fontsLoaded] = useFonts({
        Anton_400Regular,
    });

    if (!fontsLoaded) {
        return null;
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Trophy Icon */}
                <View style={styles.iconContainer}>
                    <TrophyIcon size={120} />
                </View>

                {/* Coming Soon Header */}
                <Text style={styles.comingSoonText}>Coming Soon 🚀</Text>

                {/* Title */}
                <Text style={styles.title}>LEADERBOARD</Text>

                {/* Teaser Message */}
                <View style={styles.teaserCard}>
                    <Text style={styles.teaserTitle}>Get Ready to Compete!</Text>
                    <Text style={styles.teaserText}>
                        Compete with your squad and climb the global leaderboard.
                        Track your progress, challenge friends, and prove you're the ultimate faster!
                    </Text>
                </View>

                {/* Features List */}
                <View style={styles.featuresList}>
                    <View style={styles.featureItem}>
                        <Text style={styles.featureBullet}>⚔️</Text>
                        <Text style={styles.featureText}>Squad Rankings</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Text style={styles.featureBullet}>🌍</Text>
                        <Text style={styles.featureText}>Global Leaderboards</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Text style={styles.featureBullet}>🏆</Text>
                        <Text style={styles.featureText}>Weekly Squad Tournaments</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Text style={styles.featureBullet}>🎖️</Text>
                        <Text style={styles.featureText}>Squad Exclusive Rewards</Text>
                    </View>
                </View>

                {/* Stay Tuned Message */}
                <Text style={styles.stayTunedText}>Stay tuned, soldier! 💪</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 20,
    },
    iconContainer: {
        marginBottom: 10,
    },
    comingSoonText: {
        fontSize: 24,
        fontFamily: FONTS.heading,
        color: COLORS.accent,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    title: {
        fontSize: 36,
        fontFamily: FONTS.heading,
        color: COLORS.textSecondary,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 3,
        textShadowColor: '#000000',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    teaserCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 20,
        borderWidth: 2,
        borderColor: COLORS.border,
        marginTop: 10,
        maxWidth: 400,
    },
    teaserTitle: {
        fontSize: 20,
        fontFamily: FONTS.heading,
        color: COLORS.textPrimary,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        textAlign: 'center',
    },
    teaserText: {
        fontSize: 16,
        fontFamily: FONTS.body,
        color: COLORS.textSecondary,
        lineHeight: 24,
        textAlign: 'center',
    },
    featuresList: {
        marginTop: 10,
        gap: 12,
        width: '100%',
        maxWidth: 350,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    featureBullet: {
        fontSize: 24,
        marginRight: 16,
    },
    featureText: {
        fontSize: 16,
        fontFamily: FONTS.heading,
        color: COLORS.textPrimary,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    stayTunedText: {
        fontSize: 18,
        fontFamily: FONTS.heading,
        color: COLORS.textSecondary,
        fontWeight: 'bold',
        marginTop: 20,
        textAlign: 'center',
    },
});
