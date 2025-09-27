import {
  calculateLevel,
  Fast,
  FASTING_PLANS,
  getXPReward,
  UserProfile
} from '@/constants/game';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

// 🎨 Theme constants (matching the timer design)
const COLORS = {
  background: '#0B0C0C',
  textPrimary: '#D0C9B3',
  textSecondary: '#6B705C',
  buttonBg: '#556B2F',
  progressTrack: '#1A1A1A',
  progressFill: '#6B705C',
  buttonText: '#D0C9B3',
  surface: '#111111',
  border: '#2A2A2A',
};

const SIZES = {
  circle: 240, // 240px diameter as per specs
  stroke: 12,  // 12px stroke width as per specs
  buttonHeight: 56,
  buttonRadius: 8,
};

const FONTS = {
  oswaldBold: Platform.OS === 'ios' ? 'Oswald-Bold' : 'Oswald_Bold',
  oswaldMedium: Platform.OS === 'ios' ? 'Oswald-Medium' : 'Oswald_Medium',
  oswaldSemiBold: Platform.OS === 'ios' ? 'Oswald-SemiBold' : 'Oswald_SemiBold',
  monoBold: Platform.OS === 'ios' ? 'RobotoMono-Bold' : 'RobotoMono_Bold',
};

// Mock user data - in real app this would come from storage/API
const mockUser: UserProfile = {
  id: '1',
  username: 'Scout',
  email: 'scout@surveycorps.com',
  profilePicture: 'https://i.pravatar.cc/100',
  totalXP: 250,
  currentStreak: 5,
  longestStreak: 12,
  totalFasts: 15,
  achievements: ['first_fast', 'fast_16h', 'total_10'],
  currentPlan: '16:8',
  createdAt: new Date('2024-01-01'),
};

export default function HomeScreen() {
  // Timer state
  const [currentFast, setCurrentFast] = useState<Fast | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedPlan] = useState('16:8');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // User data
  const [user] = useState<UserProfile>(mockUser);

  const userLevel = calculateLevel(user.totalXP);
  const plan = FASTING_PLANS.find(p => p.id === (currentFast?.planId || selectedPlan));
  const totalSeconds = (plan?.fastingHours || 16) * 60 * 60;
  const progress = totalSeconds > 0 ? (totalSeconds - timeRemaining) / totalSeconds : 0;
  const circumference = 2 * Math.PI * (SIZES.circle / 2 - SIZES.stroke / 2);

  const completeFast = useCallback(() => {
    if (currentFast && plan) {
      const xpEarned = getXPReward(plan.fastingHours);

      // Reset state to allow starting a new fast
      setCurrentFast(null);
      setIsRunning(false);
      setTimeRemaining(0);

      Alert.alert(
        'Fast Complete!',
        `Congratulations! You earned ${xpEarned} XP.`,
        [{ text: 'OK' }]
      );
    }
  }, [currentFast, plan]);

  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            completeFast();
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeRemaining, completeFast]);

  const startFast = () => {
    if (!plan) return;

    const now = new Date();
    const endTime = new Date(now.getTime() + plan.fastingHours * 60 * 60 * 1000);

    const newFast: Fast = {
      id: Date.now().toString(),
      planId: selectedPlan,
      startTime: now,
      endTime: endTime,
      status: 'in-progress',
    };

    setCurrentFast(newFast);
    setTimeRemaining(plan.fastingHours * 60 * 60);
    setIsRunning(true);
  };

  const endFast = () => {
    Alert.alert(
      'End Fast',
      'Are you sure you want to end this fast?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Fast',
          style: 'destructive',
          onPress: () => {
            // Reset all state to allow starting a new fast
            setCurrentFast(null);
            setIsRunning(false);
            setTimeRemaining(0);
          }
        },
      ]
    );
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.homeTitle}>HOME</Text>
          <Text style={styles.username}>{user.username}</Text>
        </View>

        {/* Current Fast Section */}
        <View style={styles.currentFastSection}>
          <Text style={styles.sectionLabel}>CURRENT FAST</Text>

          {/* Progress Ring */}
          <View style={styles.progressRingContainer}>
            <Svg width={SIZES.circle} height={SIZES.circle} style={styles.progressRing}>
              {/* Background Circle */}
              <Circle
                cx={SIZES.circle / 2}
                cy={SIZES.circle / 2}
                r={SIZES.circle / 2 - SIZES.stroke / 2}
                stroke={COLORS.progressTrack}
                strokeWidth={SIZES.stroke}
                fill="transparent"
              />
              {/* Progress Circle */}
              <Circle
                cx={SIZES.circle / 2}
                cy={SIZES.circle / 2}
                r={SIZES.circle / 2 - SIZES.stroke / 2}
                stroke={COLORS.progressFill}
                strokeWidth={SIZES.stroke}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress)}
                strokeLinecap="round"
                transform={`rotate(-90 ${SIZES.circle / 2} ${SIZES.circle / 2})`}
              />
            </Svg>

            {/* Timer Text Inside Circle */}
            <View style={styles.timerTextContainer}>
              <Text style={styles.timerText}>
                {currentFast ? formatTime(timeRemaining) : '00:00:00'}
              </Text>
              {plan && (
                <Text style={styles.planText}>
                  {plan.fastingHours} HR FAST
                </Text>
              )}
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Plan</Text>
              <Text style={styles.statValue}>{plan?.id || '16:8'}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>XP</Text>
              <Text style={styles.statValue}>{user.totalXP}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Level</Text>
              <Text style={styles.statValue}>{userLevel.level}</Text>
            </View>
          </View>
        </View>

        {/* Leaderboard Section */}
        <View style={styles.leaderboardSection}>
          <Text style={styles.leaderboardLabel}>LEADERBOARD</Text>
          <Text style={styles.leaderboardPosition}>5th PLACE</Text>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={currentFast ? endFast : startFast}
        >
          <Text style={styles.actionButtonText}>
            {currentFast ? 'END FAST' : 'START FAST'}
          </Text>
        </TouchableOpacity>

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
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  homeTitle: {
    fontSize: 28,
    fontFamily: FONTS.oswaldBold,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  username: {
    fontSize: 18,
    fontFamily: FONTS.oswaldMedium,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginTop: 8,
  },
  currentFastSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 14,
  },
  sectionLabel: {
    fontSize: 16,
    fontFamily: FONTS.oswaldBold,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
    alignSelf: 'flex-start',
    marginBottom: 12,
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
  timerText: {
    fontSize: 48,
    fontFamily: FONTS.monoBold,
    lineHeight: 56,
    color: COLORS.textPrimary,
    letterSpacing: 1,
    fontWeight: 'bold',
  },
  planText: {
    fontSize: 16,
    fontFamily: FONTS.oswaldMedium,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 48,
    backgroundColor: COLORS.border,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: FONTS.oswaldMedium,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 20,
    fontFamily: FONTS.oswaldBold,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  leaderboardSection: {
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  leaderboardLabel: {
    fontSize: 16,
    fontFamily: FONTS.oswaldBold,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  leaderboardPosition: {
    fontSize: 18,
    fontFamily: FONTS.oswaldBold,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  actionButton: {
    backgroundColor: COLORS.buttonBg,
    width: width - 32,
    height: SIZES.buttonHeight,
    borderRadius: SIZES.buttonRadius,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  actionButtonText: {
    fontSize: 18,
    fontFamily: FONTS.oswaldSemiBold,
    color: COLORS.buttonText,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: 'bold',
  },
});