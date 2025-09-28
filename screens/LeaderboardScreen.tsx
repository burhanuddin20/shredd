import { COLORS, FONTS } from '@/components/shared/theme';
import { Anton_400Regular, useFonts } from '@expo-google-fonts/anton';
import React, { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { G, Path, Polygon } from 'react-native-svg';

const { width } = Dimensions.get('window');

// SVG Badge Components
const ScoutBadge = ({ size = 32, color = COLORS.accent }) => (
    <Svg width={size} height={size} viewBox="0 0 128 128">
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

const SoldierBadge = ({ size = 32, color = COLORS.accent }) => (
    <Svg width={size} height={size} viewBox="0 0 128 128">
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

const CaptainBadge = ({ size = 32, color = COLORS.accent }) => (
    <Svg width={size} height={size} viewBox="0 0 128 128">
        <Path
            d="M64 10 L108 26 V62 C108 90 88 108 64 118 C40 108 20 90 20 62 V26 Z"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinejoin="round"
        />
        <G fill="none" stroke={color} strokeWidth="6">
            <Path d="M40 76 C40 60, 54 52, 64 52 C74 52, 88 60, 88 76" />
            <Path d="M48 80 C48 68, 56 64, 64 64 C72 64, 80 68, 80 80" />
        </G>
        <Polygon
            points="64,38 68,48 78,48 70,54 74,64 64,58 54,64 58,54 50,48 60,48"
            fill={color}
        />
    </Svg>
);

const CommanderBadge = ({ size = 32, color = COLORS.accent }) => (
    <Svg width={size} height={size} viewBox="0 0 128 128">
        <Path
            d="M64 10 L108 26 V62 C108 90 88 108 64 118 C40 108 20 90 20 62 V26 Z"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinejoin="round"
        />
        <G fill="none" stroke={color} strokeWidth="6">
            <Path d="M40 76 C40 60, 54 52, 64 52 C74 52, 88 60, 88 76" />
            <Path d="M48 80 C48 68, 56 64, 64 64 C72 64, 80 68, 80 80" />
        </G>
        <Polygon
            points="64,28 72,40 88,40 76,48 80,64 64,56 48,64 52,48 40,40 56,40"
            fill={COLORS.warning}
        />
    </Svg>
);

const TitanSlayerBadge = ({ size = 32, color = COLORS.accent }) => (
    <Svg width={size} height={size} viewBox="0 0 128 128">
        <Path
            d="M64 10 L108 26 V62 C108 90 88 108 64 118 C40 108 20 90 20 62 V26 Z"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinejoin="round"
        />
        <G fill="none" stroke={color} strokeWidth="6">
            <Path d="M40 76 C40 60, 54 52, 64 52 C74 52, 88 60, 88 76" />
            <Path d="M48 80 C48 68, 56 64, 64 64 C72 64, 80 68, 80 80" />
        </G>
        <Path d="M44 40 L84 40 L80 70 L64 90 L48 70 Z" fill={color} />
    </Svg>
);

const LegendaryWarriorBadge = ({ size = 32, color = COLORS.accent }) => (
    <Svg width={size} height={size} viewBox="0 0 128 128">
        <Path
            d="M64 10 L108 26 V62 C108 90 88 108 64 118 C40 108 20 90 20 62 V26 Z"
            fill="none"
            stroke={COLORS.warning}
            strokeWidth="8"
            strokeLinejoin="round"
        />
        <G fill="none" stroke={COLORS.warning} strokeWidth="6">
            <Path d="M40 76 C40 60, 54 52, 64 52 C74 52, 88 60, 88 76" />
            <Path d="M48 80 C48 68, 56 64, 64 64 C72 64, 80 68, 80 80" />
        </G>
        <Polygon
            points="64,28 72,40 88,40 76,48 80,64 64,56 48,64 52,48 40,40 56,40"
            fill={COLORS.warning}
        />
    </Svg>
);

const getRankBadge = (rankName: string, size: number = 32, color?: string) => {
    switch (rankName) {
        case 'Cadet':
        case 'Trainee':
        case 'Scout':
            return <ScoutBadge size={size} color={color} />;
        case 'Soldier':
            return <SoldierBadge size={size} color={color} />;
        case 'Captain':
            return <CaptainBadge size={size} color={color} />;
        case 'Commander':
            return <CommanderBadge size={size} color={color} />;
        case 'Titan Slayer':
            return <TitanSlayerBadge size={size} color={color} />;
        case 'Legendary Warrior':
            return <LegendaryWarriorBadge size={size} color={color} />;
        default:
            return <ScoutBadge size={size} color={color} />;
    }
};

// Mock data
const mockLeaderboardData = [
    { id: '1', username: 'Gunnar', xp: 4520, rank: 'Legendary Warrior', isUser: false },
    { id: '2', username: 'Kiera', xp: 3900, rank: 'Titan Slayer', isUser: false },
    { id: '3', username: 'Ryota', xp: 2800, rank: 'Captain', isUser: false },
    { id: '4', username: 'Hana', xp: 2100, rank: 'Soldier', isUser: false },
    { id: '5', username: 'Tomas', xp: 1500, rank: 'Scout', isUser: true },
];

const mockSquadData = [
    { id: '1', username: 'Tomas', xp: 1500, rank: 'Scout', isUser: true },
    { id: '2', username: 'Elena', xp: 1200, rank: 'Scout', isUser: false },
    { id: '3', username: 'Marcus', xp: 950, rank: 'Scout', isUser: false },
    { id: '4', username: 'Zara', xp: 800, rank: 'Scout', isUser: false },
    { id: '5', username: 'Kai', xp: 650, rank: 'Scout', isUser: false },
];

export default function LeaderboardScreen() {
    const [fontsLoaded] = useFonts({
        Anton_400Regular,
    });
    const [activeTab, setActiveTab] = useState<'squad' | 'global'>('squad');

    if (!fontsLoaded) {
        return null;
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>LEADERBOARD</Text>
                    <Text style={styles.subtitle}>{activeTab.toUpperCase()} RANKING</Text>
                </View>

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'squad' && styles.activeTab]}
                        onPress={() => setActiveTab('squad')}
                    >
                        <Text style={[styles.tabText, activeTab === 'squad' && styles.activeTabText]}>
                            SQUAD
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'global' && styles.activeTab]}
                        onPress={() => setActiveTab('global')}
                    >
                        <Text style={[styles.tabText, activeTab === 'global' && styles.activeTabText]}>
                            GLOBAL
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Leaderboard List */}
                <View style={styles.leaderboardList}>
                    {(activeTab === 'squad' ? mockSquadData : mockLeaderboardData).map((entry, index) => (
                        <View key={entry.id} style={styles.leaderboardItem}>
                            <Text style={styles.positionText}>{index + 1}.</Text>
                            <View style={styles.badgeContainer}>
                                {getRankBadge(entry.rank, 32, entry.isUser ? COLORS.accent : COLORS.textSecondary)}
                            </View>
                            <View style={styles.userInfo}>
                                <Text style={styles.username}>{entry.username}</Text>
                                <Text style={styles.rankText}>{entry.rank}</Text>
                            </View>
                            <Text style={styles.xpText}>XP: {entry.xp}</Text>
                        </View>
                    ))}
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
        gap: 16,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 20,
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
    subtitle: {
        fontSize: 16,
        fontFamily: FONTS.heading,
        color: COLORS.textPrimary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 8,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderRadius: 8,
        padding: 4,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 6,
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: COLORS.buttonBg,
    },
    tabText: {
        fontSize: 16,
        fontFamily: FONTS.heading,
        color: COLORS.textSecondary,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    activeTabText: {
        color: COLORS.textPrimary,
    },
    leaderboardList: {
        gap: 12,
    },
    leaderboardItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    positionText: {
        fontSize: 20,
        fontFamily: FONTS.heading,
        color: COLORS.textPrimary,
        fontWeight: 'bold',
        minWidth: 40,
    },
    badgeContainer: {
        marginHorizontal: 16,
    },
    userInfo: {
        flex: 1,
    },
    username: {
        fontSize: 18,
        fontFamily: FONTS.heading,
        color: COLORS.textPrimary,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    rankText: {
        fontSize: 14,
        fontFamily: FONTS.heading,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: 2,
    },
    xpText: {
        fontSize: 16,
        fontFamily: FONTS.monoBold,
        color: COLORS.textPrimary,
        fontWeight: 'bold',
    },
});
