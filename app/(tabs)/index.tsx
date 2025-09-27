import { IconSymbol } from '@/components/ui/icon-symbol';
import { MilitaryCard } from '@/components/ui/military-card';
import {
    calculateLevel,
    Fast,
    FASTING_PLANS,
    getRankName,
    UserProfile
} from '@/constants/game';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.4; // Smaller circle for home screen
const STROKE_WIDTH = 6;

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
  achievements: ['first_fast', 'fast_16h', 'total_10'],
  currentPlan: '16:8',
  createdAt: new Date('2024-01-01'),
};

const mockCurrentFast: Fast | null = {
  id: 'current',
  planId: '16:8',
  startTime: new Date(Date.now() - 10 * 60 * 60 * 1000), // Started 10 hours ago
  status: 'in-progress',
};

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const [user] = useState<UserProfile>(mockUser);
  const [currentFast] = useState<Fast | null>(mockCurrentFast);
  const [timeRemaining, setTimeRemaining] = useState('');

  const userLevel = calculateLevel(user.totalXP);
  const rankName = getRankName(userLevel.level);
  const currentPlan = FASTING_PLANS.find(plan => plan.id === user.currentPlan);

  useEffect(() => {
    if (currentFast) {
      const interval = setInterval(() => {
        const now = new Date();
        const endTime = new Date(currentFast.startTime.getTime() + (currentPlan?.fastingHours || 16) * 60 * 60 * 1000);
        const remaining = endTime.getTime() - now.getTime();
        
        if (remaining > 0) {
          const hours = Math.floor(remaining / (1000 * 60 * 60));
          const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
          setTimeRemaining(`${hours}h ${minutes}m`);
        } else {
          setTimeRemaining('Fast Complete!');
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [currentFast, currentPlan]);

  const startNewFast = () => {
    router.push('/timer');
  };

  const viewLeaderboard = () => {
    router.push('/leaderboard');
  };

  const viewProfile = () => {
    router.push('/profile');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <View style={styles.headerTop}>
            <View style={styles.userInfo}>
              <Image source={{ uri: user.profilePicture }} style={styles.avatar} />
              <View>
                <Text style={[styles.username, { color: colors.text }]}>{user.username}</Text>
                <Text style={[styles.rank, { color: colors.accent }]}>{rankName}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={viewProfile} style={styles.profileButton}>
              <IconSymbol name="person.circle" size={24} color={colors.icon} />
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: colors.primary }]}>
              <Text style={styles.statValue}>{user.totalXP}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.secondary }]}>
              <Text style={styles.statValue}>Level {userLevel.level}</Text>
              <Text style={styles.statLabel}>Current Level</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.warning }]}>
              <Text style={styles.statValue}>{user.currentStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>
        </View>

        {/* Current Fast */}
        <MilitaryCard style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.beige, fontFamily: 'military' }]}>
            CURRENT MISSION
          </Text>
          
          {currentFast ? (
            <View style={styles.currentFastCard}>
              <View style={styles.fastHeader}>
                <Text style={[styles.fastPlan, { color: colors.accent, fontFamily: 'body' }]}>
                  {currentPlan?.name}
                </Text>
                <Text style={[styles.fastStatus, { color: colors.success, fontFamily: 'body' }]}>
                  IN PROGRESS
                </Text>
              </View>
              
              {/* Progress Ring */}
              <View style={styles.progressRingContainer}>
                <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} style={styles.progressRing}>
                  {/* Background Circle */}
                  <Circle
                    cx={CIRCLE_SIZE / 2}
                    cy={CIRCLE_SIZE / 2}
                    r={CIRCLE_SIZE / 2 - STROKE_WIDTH / 2}
                    stroke={colors.border}
                    strokeWidth={STROKE_WIDTH}
                    fill="transparent"
                  />
                  {/* Progress Circle */}
                  <Circle
                    cx={CIRCLE_SIZE / 2}
                    cy={CIRCLE_SIZE / 2}
                    r={CIRCLE_SIZE / 2 - STROKE_WIDTH / 2}
                    stroke={colors.accent}
                    strokeWidth={STROKE_WIDTH}
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * (CIRCLE_SIZE / 2 - STROKE_WIDTH / 2)}
                    strokeDashoffset={2 * Math.PI * (CIRCLE_SIZE / 2 - STROKE_WIDTH / 2) * (1 - (10 / (currentPlan?.fastingHours || 16)))}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${CIRCLE_SIZE / 2} ${CIRCLE_SIZE / 2})`}
                  />
                </Svg>
                
                {/* Timer Text in Center */}
                <View style={styles.timerTextContainer}>
                  <Text style={[styles.timeRemaining, { color: colors.beige, fontFamily: 'mono' }]}>
                    {timeRemaining}
                  </Text>
                  <Text style={[styles.timeLabel, { color: colors.icon, fontFamily: 'body' }]}>
                    REMAINING
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: colors.accent }]}
                onPress={() => router.push('/timer')}
              >
                <Text style={[styles.actionButtonText, { color: colors.beige, fontFamily: 'military' }]}>
                  VIEW TIMER
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.noFastCard}>
              <IconSymbol name="timer" size={48} color={colors.icon} />
              <Text style={[styles.noFastText, { color: colors.beige, fontFamily: 'body' }]}>
                NO ACTIVE MISSION
              </Text>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: colors.accent }]}
                onPress={startNewFast}
              >
                <Text style={[styles.actionButtonText, { color: colors.beige, fontFamily: 'military' }]}>
                  START NEW MISSION
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </MilitaryCard>

        {/* Current Plan */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Current Plan</Text>
          <View style={styles.planCard}>
            <Text style={[styles.planName, { color: colors.text }]}>
              {currentPlan?.name}
            </Text>
            <Text style={[styles.planDescription, { color: colors.icon }]}>
              {currentPlan?.fastingHours}h fasting, {currentPlan?.eatingHours}h eating
            </Text>
            <TouchableOpacity 
              style={[styles.changePlanButton, { borderColor: colors.accent }]}
              onPress={() => router.push('/timer')}
            >
              <Text style={[styles.changePlanText, { color: colors.accent }]}>
                Change Plan
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={[styles.quickActionCard, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/leaderboard')}
            >
              <IconSymbol name="trophy.fill" size={24} color={colors.accent} />
              <Text style={[styles.quickActionText, { color: colors.text }]}>Leaderboard</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickActionCard, { backgroundColor: colors.secondary }]}
              onPress={() => router.push('/profile/history')}
            >
              <IconSymbol name="clock.fill" size={24} color={colors.accent} />
              <Text style={[styles.quickActionText, { color: colors.text }]}>History</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickActionCard, { backgroundColor: colors.warning }]}
              onPress={() => router.push('/profile/settings')}
            >
              <IconSymbol name="gearshape.fill" size={24} color={colors.accent} />
              <Text style={[styles.quickActionText, { color: colors.text }]}>Settings</Text>
            </TouchableOpacity>
          </View>
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
    marginBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  rank: {
    fontSize: 14,
    fontWeight: '600',
  },
  profileButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#ccc',
    fontWeight: '600',
  },
  section: {
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  currentFastCard: {
    alignItems: 'center',
    gap: 16,
  },
  fastHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  fastPlan: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  fastStatus: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  progressRingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  progressRing: {
    position: 'absolute',
  },
  timerTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeRemaining: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  timeLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  noFastCard: {
    alignItems: 'center',
    gap: 16,
    padding: 20,
  },
  noFastText: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 120,
    // Subtle shadow for depth
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  planCard: {
    gap: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  planDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  changePlanButton: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  changePlanText: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});