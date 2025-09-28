import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  ACHIEVEMENTS,
  calculateLevel,
  getRankName,
  UserProfile,
} from '@/constants/game';
import { Anton_400Regular, useFonts } from '@expo-google-fonts/anton';
import { router } from 'expo-router';
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
import Svg, { Circle, Path, Polygon } from 'react-native-svg';

const { width } = Dimensions.get('window');

// 🎨 Theme constants (matching homepage/leaderboard)
const COLORS = {
  background: '#0B0C0C',
  textPrimary: '#E6E2D3', // beige
  textSecondary: '#6B705C', // muted military green
  buttonBg: '#556B2F', // military olive green
  surface: '#111111', // card backgrounds
  border: '#2A2A2A',
  accent: '#B22222', // military red accent
  warning: '#DAA520', // military gold
  // Achievement colors
  bronze: '#CD7F32', // Bronze
  silver: '#C0C0C0', // Silver
  gold: '#DAA520', // Gold
};

const FONTS = {
  heading: Platform.OS === 'ios' ? 'Anton-Regular' : 'Anton_400Regular',
  monoBold: Platform.OS === 'ios' ? 'RobotoMono-Bold' : 'RobotoMono_Bold',
};

// Mock user data
const mockUser: UserProfile = {
  id: '1',
  username: 'trilly',
  email: 'trilly@surveycorps.com',
  profilePicture: 'https://i.pravatar.cc/100',
  totalXP: 250,
  currentStreak: 5,
  longestStreak: 12,
  totalFasts: 15,
  achievements: ['first_fast', 'fast_16h', 'total_10', 'fast_18h'],
  currentPlan: '16:8',
  createdAt: new Date('2024-01-01'),
};

// Mock fast history data
const mockFastHistory = [
  { id: 1, date: '2024-01-15', duration: '16:00', type: '16:8', status: 'Completed' },
  { id: 2, date: '2024-01-14', duration: '14:30', type: '16:8', status: 'Completed' },
  { id: 3, date: '2024-01-13', duration: '18:00', type: '18:6', status: 'Completed' },
  { id: 4, date: '2024-01-12', duration: '8:00', type: '16:8', status: 'Cancelled' },
  { id: 5, date: '2024-01-11', duration: '16:00', type: '16:8', status: 'Completed' },
];

// Rank Badge Components (reusing from leaderboard)
const ScoutBadge = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 128 128">
    <Path
      d="M64 10 L108 26 V62 C108 90 88 108 64 118 C40 108 20 90 20 62 V26 Z"
      fill="none"
      stroke={COLORS.textSecondary}
      strokeWidth="8"
    />
    <Path
      d="M38 58 L64 82 L90 58"
      fill="none"
      stroke={COLORS.textSecondary}
      strokeWidth="8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SoldierBadge = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 128 128">
    <Path
      d="M64 10 L108 26 V62 C108 90 88 108 64 118 C40 108 20 90 20 62 V26 Z"
      fill="none"
      stroke={COLORS.textSecondary}
      strokeWidth="8"
    />
    <Polygon
      points="64,38 68,48 78,48 70,54 74,64 64,58 54,64 58,54 50,48 60,48"
      fill={COLORS.textSecondary}
    />
  </Svg>
);

const getRankBadge = (rank: string, size = 24) => {
  switch (rank.toLowerCase()) {
    case 'scout':
      return <ScoutBadge size={size} />;
    case 'soldier':
      return <SoldierBadge size={size} />;
    default:
      return <SoldierBadge size={size} />;
  }
};

// Achievement Badge Component
const AchievementBadge = ({
  achievement,
  isUnlocked
}: {
  achievement: any;
  isUnlocked: boolean;
}) => {
  const getAchievementColor = (achievementId: string) => {
    if (!isUnlocked) return COLORS.border;

    // Easy achievements (bronze)
    const easyAchievements = ['first_fast', 'fast_12h', 'total_10'];
    if (easyAchievements.includes(achievementId)) return COLORS.bronze;

    // Medium achievements (silver)
    const mediumAchievements = ['fast_16h', 'fast_18h', 'total_20', 'total_50', 'streak_7', 'streak_14', 'streak_30'];
    if (mediumAchievements.includes(achievementId)) return COLORS.silver;

    // Hard achievements (gold)
    return COLORS.gold;
  };

  const getAchievementSVG = (achievementId: string) => {
    const color = getAchievementColor(achievementId);

    switch (achievementId) {
      case 'first_fast':
        return (
          <Svg width={32} height={32} viewBox="0 0 128 128">
            <Path d="M64 10 L108 26 V62 C108 90 88 108 64 118 C40 108 20 90 20 62 V26 Z" fill="none" stroke={color} strokeWidth="8" strokeLinejoin="round" />
            <Path d="M64 36 C56 48, 76 56, 64 76 C80 64, 80 50, 70 40 C72 48,64 50,64 36 Z" fill="none" stroke={color} strokeWidth="6" />
          </Svg>
        );
      case 'fast_12h':
        return (
          <Svg width={32} height={32} viewBox="0 0 128 128">
            <Path d="M64 10 L108 26 V62 C108 90 88 108 64 118 C40 108 20 90 20 62 V26 Z" fill="none" stroke={color} strokeWidth="8" strokeLinejoin="round" />
            <Path d="M48 78 Q64 52 80 78" fill="none" stroke={color} strokeWidth="6" />
            <Circle cx="64" cy="58" r="8" fill="none" stroke={color} strokeWidth="6" />
            <Path d="M60 60 L68 52" stroke={color} strokeWidth="6" />
          </Svg>
        );
      case 'fast_16h':
        return (
          <Svg width={32} height={32} viewBox="0 0 128 128">
            <Path d="M64 10 L108 26 V62 C108 90 88 108 64 118 C40 108 20 90 20 62 V26 Z" fill="none" stroke={color} strokeWidth="8" strokeLinejoin="round" />
            <Path d="M48 78 Q64 52 80 78" fill="none" stroke={color} strokeWidth="6" />
            <Circle cx="64" cy="58" r="8" fill="none" stroke={color} strokeWidth="6" />
            <Path d="M60 60 L68 52" stroke={color} strokeWidth="6" />
          </Svg>
        );
      case 'fast_18h':
        return (
          <Svg width={32} height={32} viewBox="0 0 128 128">
            <Path d="M64 10 L108 26 V62 C108 90 88 108 64 118 C40 108 20 90 20 62 V26 Z" fill="none" stroke={color} strokeWidth="8" strokeLinejoin="round" />
            <Path d="M48 78 Q64 52 80 78" fill="none" stroke={color} strokeWidth="6" />
            <Circle cx="64" cy="58" r="8" fill="none" stroke={color} strokeWidth="6" />
            <Path d="M60 60 L68 52" stroke={color} strokeWidth="6" />
          </Svg>
        );
      case 'fast_20h':
        return (
          <Svg width={32} height={32} viewBox="0 0 128 128">
            <Path d="M64 10 L108 26 V62 C108 90 88 108 64 118 C40 108 20 90 20 62 V26 Z" fill="none" stroke={color} strokeWidth="8" strokeLinejoin="round" />
            <Path d="M48 78 Q64 52 80 78" fill="none" stroke={color} strokeWidth="6" />
            <Circle cx="64" cy="58" r="8" fill="none" stroke={color} strokeWidth="6" />
            <Path d="M60 60 L68 52" stroke={color} strokeWidth="6" />
          </Svg>
        );
      case 'fast_24h':
        return (
          <Svg width={32} height={32} viewBox="0 0 128 128">
            <Path d="M64 10 L108 26 V62 C108 90 88 108 64 118 C40 108 20 90 20 62 V26 Z" fill="none" stroke={color} strokeWidth="8" strokeLinejoin="round" />
            <Path d="M48 78 Q64 52 80 78" fill="none" stroke={color} strokeWidth="6" />
            <Circle cx="64" cy="58" r="8" fill="none" stroke={color} strokeWidth="6" />
            <Path d="M60 60 L68 52" stroke={color} strokeWidth="6" />
          </Svg>
        );
      case 'streak_365':
        return (
          <Svg width={32} height={32} viewBox="0 0 128 128">
            <Path d="M64 10 L108 26 V62 C108 90 88 108 64 118 C40 108 20 90 20 62 V26 Z" fill="none" stroke={color} strokeWidth="8" strokeLinejoin="round" />
            <Circle cx="64" cy="60" r="12" fill="none" stroke={color} strokeWidth="6" />
            <Path d="M64 44 V36 M64 84 V76 M48 60 H40 M88 60 H80 M52 48 L46 42 M76 48 L82 42 M52 72 L46 78 M76 72 L82 78" stroke={color} strokeWidth="4" strokeLinecap="round" />
          </Svg>
        );
      default:
        return (
          <Svg width={32} height={32} viewBox="0 0 128 128">
            <Path d="M64 10 L108 26 V62 C108 90 88 108 64 118 C40 108 20 90 20 62 V26 Z" fill="none" stroke={color} strokeWidth="8" strokeLinejoin="round" />
            <Polygon points="64,38 68,48 78,48 70,54 74,64 64,58 54,64 58,54 50,48 60,48" fill={color} />
          </Svg>
        );
    }
  };

  return (
    <View style={[styles.achievementBadge, !isUnlocked && styles.lockedBadge]}>
      {getAchievementSVG(achievement.id)}
      <Text style={[styles.achievementLabel, !isUnlocked && styles.lockedText]}>
        {achievement.name}
      </Text>
    </View>
  );
};

export default function ProfileScreen() {
  const [fontsLoaded] = useFonts({
    Anton_400Regular,
  });

  const [user] = useState<UserProfile>(mockUser);
  const [showAllAchievements, setShowAllAchievements] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const userLevel = calculateLevel(user.totalXP);
  const rankName = getRankName(userLevel.level);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>PROFILE</Text>

          {/* Settings Icon */}
          <TouchableOpacity
            style={styles.settingsIcon}
            onPress={() => router.push('/profile/settings')}
          >
            <IconSymbol name="gearshape.fill" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {/* Profile Picture & Info */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              {getRankBadge(rankName, 80)}
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.username}>{user.username}</Text>
              <Text style={styles.rank}>{rankName}</Text>
            </View>
          </View>
        </View>

        {/* Records Section */}
        <View style={styles.recordsSection}>
          <Text style={styles.sectionTitle}>RECORDS</Text>
          <View style={styles.recordsRow}>
            <View style={styles.recordCard}>
              <Text style={styles.recordValue}>{user.totalFasts}</Text>
              <Text style={styles.recordLabel}>TOTAL FASTS</Text>
            </View>
            <View style={styles.recordCard}>
              <Text style={styles.recordValue}>{user.longestStreak}</Text>
              <Text style={styles.recordLabel}>LONGEST STREAK</Text>
            </View>
            <View style={styles.recordCard}>
              <Text style={styles.recordValue}>{Math.floor(user.totalXP / 100)}</Text>
              <Text style={styles.recordLabel}>DAYS FASTING</Text>
            </View>
          </View>
        </View>

        {/* Achievements Section */}
        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>ACHIEVEMENTS</Text>
          <View style={styles.achievementsGrid}>
            {(showAllAchievements ? ACHIEVEMENTS : ACHIEVEMENTS.slice(0, 8)).map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                isUnlocked={user.achievements.includes(achievement.id)}
              />
            ))}
          </View>
          {ACHIEVEMENTS.length > 8 && (
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setShowAllAchievements(!showAllAchievements)}
            >
              <Text style={styles.toggleButtonText}>
                {showAllAchievements ? 'SHOW LESS' : `SHOW ALL (${ACHIEVEMENTS.length})`}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Fast History Section */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>FAST HISTORY</Text>
          <View style={styles.historyList}>
            {(showAllHistory ? mockFastHistory : mockFastHistory.slice(0, 3)).map((fast, index, array) => (
              <View key={fast.id} style={styles.historyRow}>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyDate}>{fast.date}</Text>
                  <Text style={styles.historyDuration}>{fast.duration}</Text>
                </View>
                <View style={styles.historyDetails}>
                  <Text style={styles.historyType}>{fast.type}</Text>
                  <Text style={[
                    styles.historyStatus,
                    fast.status === 'Completed' ? styles.completedStatus : styles.cancelledStatus
                  ]}>
                    {fast.status}
                  </Text>
                </View>
                {index < array.length - 1 && <View style={styles.historyDivider} />}
              </View>
            ))}
          </View>
          {mockFastHistory.length > 3 && (
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setShowAllHistory(!showAllHistory)}
            >
              <Text style={styles.toggleButtonText}>
                {showAllHistory ? 'SHOW LESS' : `SHOW ALL (${mockFastHistory.length})`}
              </Text>
            </TouchableOpacity>
          )}
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
    gap: 20,
    position: 'relative',
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
  profileSection: {
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 100,
  },
  userInfo: {
    alignItems: 'center',
    gap: 4,
  },
  username: {
    fontSize: 24,
    fontFamily: FONTS.heading,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  rank: {
    fontSize: 16,
    fontFamily: FONTS.heading,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metricValue: {
    fontSize: 24,
    fontFamily: FONTS.monoBold,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  metricLabel: {
    fontSize: 10,
    fontFamily: FONTS.heading,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
    textAlign: 'center',
  },
  achievementsSection: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: FONTS.heading,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textShadowColor: '#000000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementBadge: {
    width: (width - 64) / 3,
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  lockedBadge: {
    opacity: 0.4,
  },
  achievementLabel: {
    fontSize: 10,
    fontFamily: FONTS.heading,
    color: COLORS.textSecondary,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  lockedText: {
    color: COLORS.border,
  },
  historySection: {
    gap: 16,
  },
  historyList: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  historyInfo: {
    gap: 4,
  },
  historyDate: {
    fontSize: 14,
    fontFamily: FONTS.monoBold,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  historyDuration: {
    fontSize: 12,
    fontFamily: FONTS.heading,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  historyDetails: {
    alignItems: 'flex-end',
    gap: 4,
  },
  historyType: {
    fontSize: 12,
    fontFamily: FONTS.heading,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  historyStatus: {
    fontSize: 12,
    fontFamily: FONTS.heading,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: 'bold',
  },
  completedStatus: {
    color: COLORS.textSecondary,
  },
  cancelledStatus: {
    color: COLORS.accent,
  },
  historyDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
  },
  settingsIcon: {
    position: 'absolute',
    top: 20,
    right: 16,
    padding: 8,
  },
  recordsSection: {
    gap: 16,
  },
  recordsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  recordCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recordValue: {
    fontSize: 24,
    fontFamily: FONTS.monoBold,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  recordLabel: {
    fontSize: 10,
    fontFamily: FONTS.heading,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
    textAlign: 'center',
  },
  toggleButton: {
    backgroundColor: COLORS.buttonBg,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'center',
    marginTop: 12,
  },
  toggleButtonText: {
    fontSize: 12,
    fontFamily: FONTS.heading,
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: 'bold',
  },
});