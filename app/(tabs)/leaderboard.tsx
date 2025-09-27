import { Anton_400Regular, useFonts } from '@expo-google-fonts/anton';
import React, { useState } from 'react';
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { G, Path, Polygon } from 'react-native-svg';

const { width } = Dimensions.get('window');

// 🎨 Theme constants (matching homepage)
const COLORS = {
  background: '#0B0C0C',
  textPrimary: '#D4C5A9', // warmer military beige
  textSecondary: '#6B705C', // military green
  accent: '#4B5320', // deeper olive for badges/active tabs
  surface: '#111111', // card backgrounds
  border: '#2A2A2A',
  warning: '#DAA520', // military gold
};

const FONTS = {
  heading: Platform.OS === 'ios' ? 'Anton-Regular' : 'Anton_400Regular',
};

// Mock leaderboard data
const mockSquadData = [
  { id: 1, username: 'Gunnar', rank: 'Legendary Warrior', xp: 4520, level: 15 },
  { id: 2, username: 'Kiera', rank: 'Titan Slayer', xp: 3900, level: 13 },
  { id: 3, username: 'Ryota', rank: 'Captain', xp: 2800, level: 11 },
  { id: 4, username: 'Hana', rank: 'Soldier', xp: 2100, level: 9 },
  { id: 5, username: 'Tomas', rank: 'Scout', xp: 1500, level: 7 },
];

const mockGlobalData = [
  { id: 1, username: 'Eren', rank: 'Legendary Warrior', xp: 8920, level: 18 },
  { id: 2, username: 'Mikasa', rank: 'Legendary Warrior', xp: 8750, level: 17 },
  { id: 3, username: 'Levi', rank: 'Legendary Warrior', xp: 8200, level: 16 },
  { id: 4, username: 'Armin', rank: 'Commander', xp: 6500, level: 14 },
  { id: 5, username: 'Jean', rank: 'Captain', xp: 5800, level: 12 },
  { id: 6, username: 'Connie', rank: 'Captain', xp: 5200, level: 11 },
  { id: 7, username: 'Sasha', rank: 'Soldier', xp: 4800, level: 10 },
  { id: 8, username: 'Historia', rank: 'Soldier', xp: 4200, level: 9 },
];

// SVG Insignia Components
const ScoutBadge = ({ size = 32 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 128 128">
    <Path
      d="M64 10 L108 26 V62 C108 90 88 108 64 118 C40 108 20 90 20 62 V26 Z"
      fill="none"
      stroke={COLORS.accent}
      strokeWidth="8"
    />
    <Path
      d="M38 58 L64 82 L90 58"
      fill="none"
      stroke={COLORS.accent}
      strokeWidth="8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SoldierBadge = ({ size = 32 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 128 128">
    <Path
      d="M64 10 L108 26 V62 C108 90 88 108 64 118 C40 108 20 90 20 62 V26 Z"
      fill="none"
      stroke={COLORS.accent}
      strokeWidth="8"
    />
    <Polygon
      points="64,38 68,48 78,48 70,54 74,64 64,58 54,64 58,54 50,48 60,48"
      fill={COLORS.accent}
    />
  </Svg>
);

const CaptainBadge = ({ size = 32 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 128 128">
    <Path
      d="M64 10 L108 26 V62 C108 90 88 108 64 118 C40 108 20 90 20 62 V26 Z"
      fill="none"
      stroke={COLORS.accent}
      strokeWidth="8"
    />
    <G fill="none" stroke={COLORS.accent} strokeWidth="6">
      <Path d="M40 76 C40 60, 54 52, 64 52 C74 52, 88 60, 88 76" />
      <Path d="M48 80 C48 68, 56 64, 64 64 C72 64, 80 68, 80 80" />
    </G>
    <Polygon
      points="64,38 68,48 78,48 70,54 74,64 64,58 54,64 58,54 50,48 60,48"
      fill={COLORS.accent}
    />
  </Svg>
);

const CommanderBadge = ({ size = 32 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 128 128">
    <Path
      d="M64 10 L108 26 V62 C108 90 88 108 64 118 C40 108 20 90 20 62 V26 Z"
      fill="none"
      stroke={COLORS.accent}
      strokeWidth="8"
    />
    <G fill="none" stroke={COLORS.accent} strokeWidth="6">
      <Path d="M40 76 C40 60, 54 52, 64 52 C74 52, 88 60, 88 76" />
      <Path d="M48 80 C48 68, 56 64, 64 64 C72 64, 80 68, 80 80" />
    </G>
    <Polygon
      points="64,28 72,40 88,40 76,48 80,64 64,56 48,64 52,48 40,40 56,40"
      fill={COLORS.warning}
    />
  </Svg>
);

const TitanSlayerBadge = ({ size = 32 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 128 128">
    <Path
      d="M64 10 L108 26 V62 C108 90 88 108 64 118 C40 108 20 90 20 62 V26 Z"
      fill="none"
      stroke={COLORS.accent}
      strokeWidth="8"
    />
    <G fill="none" stroke={COLORS.accent} strokeWidth="6">
      <Path d="M40 76 C40 60, 54 52, 64 52 C74 52, 88 60, 88 76" />
      <Path d="M48 80 C48 68, 56 64, 64 64 C72 64, 80 68, 80 80" />
    </G>
    <Path
      d="M44 40 L84 40 L80 70 L64 90 L48 70 Z"
      fill={COLORS.accent}
    />
  </Svg>
);

const LegendaryWarriorBadge = ({ size = 32 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 128 128">
    <Path
      d="M64 10 L108 26 V62 C108 90 88 108 64 118 C40 108 20 90 20 62 V26 Z"
      fill="none"
      stroke={COLORS.warning}
      strokeWidth="8"
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

const getRankBadge = (rank: string, size = 32) => {
  switch (rank.toLowerCase()) {
    case 'scout':
      return <ScoutBadge size={size} />;
    case 'soldier':
      return <SoldierBadge size={size} />;
    case 'captain':
      return <CaptainBadge size={size} />;
    case 'commander':
      return <CommanderBadge size={size} />;
    case 'titan slayer':
      return <TitanSlayerBadge size={size} />;
    case 'legendary warrior':
      return <LegendaryWarriorBadge size={size} />;
    default:
      return <SoldierBadge size={size} />;
  }
};

export default function LeaderboardScreen() {
  const [fontsLoaded] = useFonts({
    Anton_400Regular,
  });
  const [activeTab, setActiveTab] = useState<'squad' | 'global'>('squad');

  const currentData = activeTab === 'squad' ? mockSquadData : mockGlobalData;

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>LEADERBOARD</Text>
          <Text style={styles.subtitle}>
            {activeTab === 'squad' ? 'Squad Rankings' : 'Global Rankings'}
          </Text>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'squad' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('squad')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'squad' && styles.activeTabText,
              ]}
            >
              SQUAD
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'global' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('global')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'global' && styles.activeTabText,
              ]}
            >
              GLOBAL
            </Text>
          </TouchableOpacity>
        </View>

        {/* Leaderboard List */}
        <View style={styles.leaderboardList}>
          {currentData.map((user, index) => (
            <View key={user.id} style={styles.leaderboardRow}>
              {/* Position */}
              <View style={styles.positionContainer}>
                <Text style={styles.positionNumber}>{index + 1}</Text>
              </View>

              {/* Badge */}
              <View style={styles.badgeContainer}>
                {getRankBadge(user.rank)}
              </View>

              {/* User Info */}
              <View style={styles.userInfo}>
                <Text style={styles.username}>{user.username}</Text>
                <Text style={styles.rank}>{user.rank}</Text>
              </View>

              {/* XP */}
              <View style={styles.xpContainer}>
                <Text style={styles.xpValue}>{user.xp.toLocaleString()}</Text>
                <Text style={styles.xpLabel}>XP</Text>
              </View>
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
    gap: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  title: {
    fontSize: 36,
    fontFamily: FONTS.heading,
    color: COLORS.textSecondary,
    letterSpacing: 3,
    textTransform: 'uppercase',
    fontWeight: 'bold',
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
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 25,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.accent,
  },
  tabText: {
    fontSize: 16,
    fontFamily: FONTS.heading,
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: COLORS.textPrimary,
  },
  leaderboardList: {
    gap: 12,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  positionContainer: {
    width: 40,
    alignItems: 'center',
  },
  positionNumber: {
    fontSize: 24,
    fontFamily: FONTS.heading,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  badgeContainer: {
    marginHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: 8,
  },
  username: {
    fontSize: 18,
    fontFamily: FONTS.heading,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  rank: {
    fontSize: 14,
    fontFamily: FONTS.heading,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  xpContainer: {
    alignItems: 'flex-end',
  },
  xpValue: {
    fontSize: 18,
    fontFamily: 'monospace',
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  xpLabel: {
    fontSize: 12,
    fontFamily: FONTS.heading,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
});