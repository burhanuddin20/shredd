import { IconSymbol } from '@/components/ui/icon-symbol';
import {
    calculateLevel,
    getRankName,
    UserProfile
} from '@/constants/game';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Mock leaderboard data - in real app this would come from API
const MOCK_LEADERBOARD: (UserProfile & { position: number })[] = [
  {
    id: '1',
    username: 'TitanSlayer99',
    email: 'titan@surveycorps.com',
    profilePicture: 'https://i.pravatar.cc/100?img=1',
    totalXP: 8500,
    currentStreak: 45,
    longestStreak: 67,
    totalFasts: 89,
    achievements: ['first_fast', 'fast_24h', 'streak_30d', 'total_50'],
    currentPlan: '24:0',
    createdAt: new Date('2023-06-01'),
    position: 1,
  },
  {
    id: '2',
    username: 'Scout',
    email: 'scout@surveycorps.com',
    profilePicture: 'https://i.pravatar.cc/100?img=2',
    totalXP: 2200,
    currentStreak: 5,
    longestStreak: 12,
    totalFasts: 15,
    achievements: ['first_fast', 'fast_16h', 'total_10'],
    currentPlan: '16:8',
    createdAt: new Date('2024-01-01'),
    position: 2,
  },
  {
    id: '3',
    username: 'ErenWarrior',
    email: 'eren@surveycorps.com',
    profilePicture: 'https://i.pravatar.cc/100?img=3',
    totalXP: 1800,
    currentStreak: 8,
    longestStreak: 15,
    totalFasts: 22,
    achievements: ['first_fast', 'fast_18h', 'streak_7d'],
    currentPlan: '18:6',
    createdAt: new Date('2024-02-15'),
    position: 3,
  },
  {
    id: '4',
    username: 'MikasaElite',
    email: 'mikasa@surveycorps.com',
    profilePicture: 'https://i.pravatar.cc/100?img=4',
    totalXP: 1650,
    currentStreak: 12,
    longestStreak: 18,
    totalFasts: 19,
    achievements: ['first_fast', 'fast_16h', 'fast_20h'],
    currentPlan: '20:4',
    createdAt: new Date('2024-03-01'),
    position: 4,
  },
  {
    id: '5',
    username: 'LeviCaptain',
    email: 'levi@surveycorps.com',
    profilePicture: 'https://i.pravatar.cc/100?img=5',
    totalXP: 1400,
    currentStreak: 3,
    longestStreak: 9,
    totalFasts: 12,
    achievements: ['first_fast', 'fast_16h'],
    currentPlan: '16:8',
    createdAt: new Date('2024-04-01'),
    position: 5,
  },
  {
    id: '6',
    username: 'ArminTactician',
    email: 'armin@surveycorps.com',
    profilePicture: 'https://i.pravatar.cc/100?img=6',
    totalXP: 1200,
    currentStreak: 6,
    longestStreak: 11,
    totalFasts: 14,
    achievements: ['first_fast', 'fast_12h'],
    currentPlan: '12:12',
    createdAt: new Date('2024-05-01'),
    position: 6,
  },
  {
    id: '7',
    username: 'HistoriaQueen',
    email: 'historia@surveycorps.com',
    profilePicture: 'https://i.pravatar.cc/100?img=7',
    totalXP: 950,
    currentStreak: 2,
    longestStreak: 7,
    totalFasts: 9,
    achievements: ['first_fast'],
    currentPlan: '16:8',
    createdAt: new Date('2024-06-01'),
    position: 7,
  },
  {
    id: '8',
    username: 'ConnieCadet',
    email: 'connie@surveycorps.com',
    profilePicture: 'https://i.pravatar.cc/100?img=8',
    totalXP: 750,
    currentStreak: 4,
    longestStreak: 6,
    totalFasts: 7,
    achievements: ['first_fast'],
    currentPlan: '12:12',
    createdAt: new Date('2024-07-01'),
    position: 8,
  },
];

const currentUserId = '2'; // Current user is Scout (position 2)

export default function LeaderboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const [leaderboard] = useState<(UserProfile & { position: number })[]>(MOCK_LEADERBOARD);
  const [selectedTab, setSelectedTab] = useState<'xp' | 'streak' | 'fasts'>('xp');

  const currentUser = leaderboard.find(user => user.id === currentUserId);

  const getRankBadgeColor = (position: number): string => {
    switch (position) {
      case 1: return colors.rankGold;
      case 2: return colors.rankSilver;
      case 3: return colors.rankBronze;
      default: return colors.border;
    }
  };

  const getRankBadgeIcon = (position: number): string => {
    switch (position) {
      case 1: return 'crown.fill';
      case 2: return 'medal.fill';
      case 3: return 'award.fill';
      default: return 'shield.fill';
    }
  };

  const getSortedLeaderboard = () => {
    switch (selectedTab) {
      case 'streak':
        return [...leaderboard].sort((a, b) => b.currentStreak - a.currentStreak);
      case 'fasts':
        return [...leaderboard].sort((a, b) => b.totalFasts - a.totalFasts);
      default:
        return [...leaderboard].sort((a, b) => b.totalXP - a.totalXP);
    }
  };

  const getTabValue = (user: UserProfile): number => {
    switch (selectedTab) {
      case 'streak': return user.currentStreak;
      case 'fasts': return user.totalFasts;
      default: return user.totalXP;
    }
  };

  const getTabLabel = (): string => {
    switch (selectedTab) {
      case 'streak': return 'Current Streak';
      case 'fasts': return 'Total Fasts';
      default: return 'Total XP';
    }
  };

  const renderLeaderboardItem = ({ item, index }: { item: UserProfile & { position: number }; index: number }) => {
    const userLevel = calculateLevel(item.totalXP);
    const rankName = getRankName(userLevel.level);
    const isCurrentUser = item.id === currentUserId;
    const tabValue = getTabValue(item);

    return (
      <View style={[
        styles.leaderboardItem, 
        { 
          backgroundColor: isCurrentUser ? colors.accent + '20' : colors.surface,
          borderColor: isCurrentUser ? colors.accent : 'transparent',
          borderWidth: isCurrentUser ? 2 : 0,
        }
      ]}>
        <View style={styles.positionContainer}>
          {index < 3 ? (
            <View style={[styles.topThreeBadge, { backgroundColor: getRankBadgeColor(index + 1) }]}>
              <IconSymbol 
                name={getRankBadgeIcon(index + 1)} 
                size={20} 
                color={colors.primary} 
              />
            </View>
          ) : (
            <View style={[styles.positionBadge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.positionText, { color: colors.text }]}>#{index + 1}</Text>
            </View>
          )}
        </View>

        <View style={styles.userInfo}>
          <Image source={{ uri: item.profilePicture }} style={styles.userAvatar} />
          <View style={styles.userDetails}>
            <Text style={[styles.username, { color: colors.text }]}>
              {item.username}
              {isCurrentUser && (
                <Text style={[styles.currentUserLabel, { color: colors.accent }]}> (You)</Text>
              )}
            </Text>
            <Text style={[styles.rank, { color: colors.accent }]}>{rankName}</Text>
            <Text style={[styles.level, { color: colors.icon }]}>Level {userLevel.level}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statBadge, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{tabValue}</Text>
            <Text style={[styles.statLabel, { color: colors.icon }]}>
              {selectedTab === 'streak' ? 'days' : selectedTab === 'fasts' ? 'fasts' : 'XP'}
            </Text>
          </View>
          
          <View style={styles.additionalStats}>
            <Text style={[styles.additionalStat, { color: colors.icon }]}>
              {item.totalXP} XP
            </Text>
            <Text style={[styles.additionalStat, { color: colors.icon }]}>
              {item.currentStreak} streak
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderCurrentUserCard = () => {
    if (!currentUser) return null;

    const userLevel = calculateLevel(currentUser.totalXP);
    const rankName = getRankName(userLevel.level);

    return (
      <View style={[styles.currentUserCard, { backgroundColor: colors.surface }]}>
        <View style={styles.currentUserHeader}>
          <View style={styles.currentUserInfo}>
            <Image source={{ uri: currentUser.profilePicture }} style={styles.currentUserAvatar} />
            <View>
              <Text style={[styles.currentUsername, { color: colors.text }]}>
                {currentUser.username}
              </Text>
              <Text style={[styles.currentUserRank, { color: colors.accent }]}>
                {rankName} • Level {userLevel.level}
              </Text>
            </View>
          </View>
          <View style={[styles.currentUserPosition, { backgroundColor: colors.accent }]}>
            <Text style={[styles.positionNumber, { color: colors.primary }]}>
              #{currentUser.position}
            </Text>
          </View>
        </View>

        <View style={styles.currentUserStats}>
          <View style={styles.currentUserStat}>
            <Text style={[styles.currentUserStatValue, { color: colors.text }]}>
              {currentUser.totalXP}
            </Text>
            <Text style={[styles.currentUserStatLabel, { color: colors.icon }]}>Total XP</Text>
          </View>
          <View style={styles.currentUserStat}>
            <Text style={[styles.currentUserStatValue, { color: colors.text }]}>
              {currentUser.currentStreak}
            </Text>
            <Text style={[styles.currentUserStatLabel, { color: colors.icon }]}>Current Streak</Text>
          </View>
          <View style={styles.currentUserStat}>
            <Text style={[styles.currentUserStatValue, { color: colors.text }]}>
              {currentUser.totalFasts}
            </Text>
            <Text style={[styles.currentUserStatLabel, { color: colors.icon }]}>Total Fasts</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{ 
          title: 'Leaderboard',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }} 
      />

      <View style={styles.content}>
        {/* Current User Card */}
        {renderCurrentUserCard()}

        {/* Tab Selector */}
        <View style={[styles.tabContainer, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            style={[
              styles.tab,
              { backgroundColor: selectedTab === 'xp' ? colors.accent : 'transparent' }
            ]}
            onPress={() => setSelectedTab('xp')}
          >
            <Text style={[
              styles.tabText,
              { color: selectedTab === 'xp' ? colors.primary : colors.text }
            ]}>
              XP
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              { backgroundColor: selectedTab === 'streak' ? colors.accent : 'transparent' }
            ]}
            onPress={() => setSelectedTab('streak')}
          >
            <Text style={[
              styles.tabText,
              { color: selectedTab === 'streak' ? colors.primary : colors.text }
            ]}>
              Streak
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              { backgroundColor: selectedTab === 'fasts' ? colors.accent : 'transparent' }
            ]}
            onPress={() => setSelectedTab('fasts')}
          >
            <Text style={[
              styles.tabText,
              { color: selectedTab === 'fasts' ? colors.primary : colors.text }
            ]}>
              Fasts
            </Text>
          </TouchableOpacity>
        </View>

        {/* Leaderboard */}
        <View style={styles.leaderboardContainer}>
          <Text style={[styles.leaderboardTitle, { color: colors.text }]}>
            Top Warriors - {getTabLabel()}
          </Text>
          
          <FlatList
            data={getSortedLeaderboard()}
            keyExtractor={(item) => item.id}
            renderItem={renderLeaderboardItem}
            contentContainerStyle={styles.leaderboardList}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  currentUserCard: {
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  currentUserHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  currentUserAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  currentUsername: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  currentUserRank: {
    fontSize: 14,
    fontWeight: '600',
  },
  currentUserPosition: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  positionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  currentUserStats: {
    flexDirection: 'row',
    gap: 20,
  },
  currentUserStat: {
    alignItems: 'center',
    gap: 4,
  },
  currentUserStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  currentUserStatLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  leaderboardContainer: {
    flex: 1,
  },
  leaderboardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  leaderboardList: {
    paddingBottom: 16,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  positionContainer: {
    alignItems: 'center',
  },
  topThreeBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userDetails: {
    flex: 1,
    gap: 2,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  currentUserLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  rank: {
    fontSize: 12,
    fontWeight: '600',
  },
  level: {
    fontSize: 11,
    opacity: 0.8,
  },
  statsContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  additionalStats: {
    alignItems: 'flex-end',
    gap: 2,
  },
  additionalStat: {
    fontSize: 10,
    opacity: 0.7,
  },
  separator: {
    height: 8,
  },
});