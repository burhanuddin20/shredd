import { FONTS } from '@/components/shared/theme';
import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
    onSelectMonthly?: () => void;
    onSelectYearly?: () => void;
    onRestore?: () => void;
    onClose?: () => void;
};

export default function MockPaywall({ onSelectMonthly, onSelectYearly, onRestore, onClose }: Props) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>UNLOCK SHREDD PRO</Text>
            <Text style={styles.subtitle}>7-DAY FREE TRIAL</Text>
            <Text style={styles.bullets}>
                • Advanced timer & streaks{'\n'}
                • Achievements & ranks{'\n'}
                • (Coming soon) Squads & Leaderboards
            </Text>

            <View style={styles.cards}>
                <TouchableOpacity style={[styles.card, styles.cardPrimary]} onPress={onSelectMonthly}>
                    <Text style={styles.plan}>MONTHLY</Text>
                    <Text style={styles.price}>$3.99</Text>
                    <Text style={styles.small}>after 7-day trial</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.card} onPress={onSelectYearly}>
                    <Text style={styles.plan}>YEARLY</Text>
                    <Text style={styles.price}>$35.99</Text>
                    <Text style={styles.small}>save 25% yearly</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={onRestore} style={styles.restore}>
                <Text style={styles.restoreText}>Restore Purchases</Text>
            </TouchableOpacity>

            <Text style={styles.legal}>
                Auto-renews until canceled. Cancel anytime in Settings. Prices displayed for illustration only.
            </Text>

            <View style={styles.links}>
                <Text style={styles.link} onPress={() => Linking.openURL('https://example.com/terms')}>Terms</Text>
                <Text style={styles.dot}> • </Text>
                <Text style={styles.link} onPress={() => Linking.openURL('https://example.com/privacy')}>Privacy</Text>
            </View>

            <TouchableOpacity style={styles.close} onPress={onClose}>
                <Text style={styles.closeText}>Not now</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0B0C0C',
        padding: 20,
        justifyContent: 'center'
    },
    title: {
        fontSize: 24,
        textAlign: 'center',
        color: '#CBBE8E',
        fontFamily: FONTS.heading,
        letterSpacing: 1
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        color: '#9AA06A',
        marginTop: 6,
        fontFamily: FONTS.heading
    },
    bullets: {
        color: '#D9D4C7',
        marginTop: 16,
        textAlign: 'center'
    },
    cards: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 18
    },
    card: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#2A2A2A',
        backgroundColor: '#111',
        borderRadius: 10,
        padding: 16,
        alignItems: 'center'
    },
    cardPrimary: {
        borderColor: '#6B705C'
    },
    plan: {
        color: '#9AA06A',
        fontFamily: FONTS.heading,
        letterSpacing: 1
    },
    price: {
        color: '#E6E2D3',
        fontSize: 28,
        fontFamily: FONTS.monoBold,
        marginTop: 6
    },
    small: {
        color: '#8D8A80',
        marginTop: 4,
        fontSize: 12
    },
    restore: {
        alignSelf: 'center',
        marginTop: 16
    },
    restoreText: {
        color: '#CBBE8E',
        textDecorationLine: 'underline'
    },
    legal: {
        color: '#7b7b7b',
        fontSize: 11,
        textAlign: 'center',
        marginTop: 10
    },
    links: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 8
    },
    link: {
        color: '#CBBE8E',
        textDecorationLine: 'underline'
    },
    dot: {
        color: '#7b7b7b'
    },
    close: {
        alignSelf: 'center',
        marginTop: 18,
        padding: 10
    },
    closeText: {
        color: '#D9D4C7'
    },
});
