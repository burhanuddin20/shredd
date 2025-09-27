import { IconSymbol } from '@/components/ui/icon-symbol';
import {
    ACHIEVEMENTS,
    calculateLevel,
    getRankName,
    UserProfile
} from '@/constants/game';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Mock user data - in real app this would come from storage/API
const mockUser: UserProfile = {
  id: '1',
  username: 'Scout',
  email: 'scout@surveycorps.com',
  profilePicture: 'https://i.pravatar.cc/100',
  totalXP: 2200,
  currentStreak: 5,
  longestStreak: 12,
  totalFasts: 15,
  achievements: ['first_fast', 'fast_16h', 'total_10', 'fast_18h'],
  currentPlan: '16:8',
  createdAt: new Date('2024-01-01'),
};

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const [user] = useState<UserProfile>(mockUser);

  const userLevel = calculateLevel(user.totalXP);
  const rankName = getRankName(userLevel.level);
  const userAchievements = ACHIEVEMENTS.filter(achievement => 
    user.achievements.includes(achievement.id)
  );

  const getRankBadgeColor = (level: number): string => {
    if (level >= 10) return colors.rankGold;
    if (level >= 5) return colors.rankSilver;
    return colors.rankBronze;
  };

  const getRankBadgeIcon = (level: number): string => {
    if (level >= 15) return 'crown.fill';
    if (level >= 10) return 'star.fill';
    if (level >= 5) return 'medal.fill';
    return 'shield.fill';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: user.profilePicture }} style={styles.avatar} />
              <View style={[styles.rankBadge, { backgroundColor: getRankBadgeColor(userLevel.level) }]}>
                <IconSymbol 
                  name={getRankBadgeIcon(userLevel.level)} 
                  size={16} 
                  color={colors.primary} 
                />
              </View>
            </View>
            
            <View style={styles.userInfo}>
              <Text style={[styles.username, { color: colors.text }]}>{user.username}</Text>
              <Text style={[styles.email, { color: colors.icon }]}>{user.email}</Text>
              <Text style={[styles.rank, { color: colors.accent }]}>{rankName}</Text>
            </View>
          </View>

          {/* Level Progress */}
          <View style={styles.levelSection}>
            <View style={styles.levelInfo}>
              <Text style={[styles.levelText, { color: colors.text }]}>
                Level {userLevel.level}
              </Text>
              <Text style={[styles.xpText, { color: colors.accent }]}>
                {userLevel.currentLevelXP} / {userLevel.nextLevelXP} XP
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    backgroundColor: colors.accent,
                    width: `${(userLevel.currentLevelXP / userLevel.nextLevelXP) * 100}%`
                  }
                ]} 
              />
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={[styles.statsSection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Mission Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.primary }]}>
              <IconSymbol name="trophy.fill" size={24} color={colors.accent} />
              <Text style={styles.statValue}>{user.totalXP}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.secondary }]}>
              <IconSymbol name="flame.fill" size={24} color={colors.accent} />
              <Text style={styles.statValue}>{user.currentStreak}</Text>
              <Text style={styles.statLabel}>Current Streak</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.warning }]}>
              <IconSymbol name="clock.fill" size={24} color={colors.accent} />
              <Text style={styles.statValue}>{user.longestStreak}</Text>
              <Text style={styles.statLabel}>Longest Streak</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.success }]}>
              <IconSymbol name="checkmark.circle.fill" size={24} color={colors.accent} />
              <Text style={styles.statValue}>{user.totalFasts}</Text>
              <Text style={styles.statLabel}>Total Fasts</Text>
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View style={[styles.achievementsSection, { backgroundColor: colors.surface }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Achievements</Text>
            <Text style={[styles.achievementCount, { color: colors.accent }]}>
              {userAchievements.length} / {ACHIEVEMENTS.length}
            </Text>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsScroll}>
            {userAchievements.map((achievement) => (
              <View key={achievement.id} style={[styles.achievementCard, { backgroundColor: colors.primary }]}>
                <IconSymbol name="medal.fill" size={32} color={colors.rankGold} />
                <Text style={[styles.achievementName, { color: colors.text }]}>
                  {achievement.name}
                </Text>
                <Text style={[styles.achievementXP, { color: colors.accent }]}>
                  +{achievement.xpReward} XP
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Quick Actions */}
        <View style={[styles.actionsSection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/profile/history')}
          >
            <IconSymbol name="clock.fill" size={24} color={colors.accent} />
            <View style={styles.actionTextContainer}>
              <Text style={[styles.actionTitle, { color: colors.text }]}>Fast History</Text>
              <Text style={[styles.actionSubtitle, { color: colors.icon }]}>
                View all your fasting records
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={16} color={colors.icon} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.secondary }]}
            onPress={() => router.push('/leaderboard')}
          >
            <IconSymbol name="trophy.fill" size={24} color={colors.accent} />
            <View style={styles.actionTextContainer}>
              <Text style={[styles.actionTitle, { color: colors.text }]}>Leaderboard</Text>
              <Text style={[styles.actionSubtitle, { color: colors.icon }]}>
                See your ranking among warriors
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={16} color={colors.icon} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.warning }]}
            onPress={() => router.push('/profile/settings')}
          >
            <IconSymbol name="gearshape.fill" size={24} color={colors.accent} />
            <View style={styles.actionTextContainer}>
              <Text style={[styles.actionTitle, { color: colors.text }]}>Settings</Text>
              <Text style={[styles.actionSubtitle, { color: colors.icon }]}>
                Customize your experience
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={16} color={colors.icon} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  header: {
    borderRadius: 16,
    padding: 20,
    gap: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  rankBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
    opacity: 0.8,
  },
  rank: {
    fontSize: 16,
    fontWeight: '600',
  },
  levelSection: {
    gap: 8,
  },
  levelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  xpText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsSection: {
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 64) / 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#ccc',
    fontWeight: '600',
    textAlign: 'center',
  },
  achievementsSection: {
    borderRadius: 16,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  achievementCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  achievementsScroll: {
    flexDirection: 'row',
  },
  achievementCard: {
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 120,
    alignItems: 'center',
    gap: 8,
  },
  achievementName: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  achievementXP: {
    fontSize: 10,
    fontWeight: '600',
  },
  actionsSection: {
    borderRadius: 16,
    padding: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionTextContainer: {
    flex: 1,
    gap: 2,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionSubtitle: {
    fontSize: 12,
    opacity: 0.8,
  },
});

