import { FASTING_PLANS, Fast, getXPReward } from '@/constants/game';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

// 🎨 Theme constants (centralized for consistency)
const COLORS = {
  background: '#0B0C0C',
  textPrimary: '#726a50',
  textSecondary: '#2e3a18',
  buttonBg: '#4B5320',
  progressTrack: '#1A1A1A',
  progressFill: '#2e3a18',
  buttonText: '#0B0C0C',
};

const SIZES = {
  circle: 300,
  stroke: 16,
  padding: 24,
  buttonHeight: 56,
  buttonRadius: 10,
};

const FONTS = {
  oswaldBold: Platform.OS === 'ios' ? 'Oswald-Bold' : 'Oswald_Bold',
  oswaldMedium: Platform.OS === 'ios' ? 'Oswald-Medium' : 'Oswald_Medium',
  oswaldSemiBold: Platform.OS === 'ios' ? 'Oswald-SemiBold' : 'Oswald_SemiBold',
  monoBold: Platform.OS === 'ios' ? 'RobotoMono-Bold' : 'RobotoMono_Bold',
};

// Mock current fast - in real app this would come from storage/state
const mockCurrentFast: Fast | null = {
  id: '1',
  planId: '16:8',
  startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // Started 2 hours ago
  endTime: new Date(Date.now() + 14 * 60 * 60 * 1000), // 14 hours remaining
  status: 'in-progress',
};

export default function TimerScreen() {
  const [currentFast, setCurrentFast] = useState<Fast | null>(mockCurrentFast);
  const [timeRemaining, setTimeRemaining] = useState(14 * 60 * 60); // 14 hours in seconds
  const [isRunning, setIsRunning] = useState(true);
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const plan = FASTING_PLANS.find(p => p.id === currentFast?.planId || '16:8');
  const totalSeconds = (plan?.fastingHours || 16) * 60 * 60;
  const progress = totalSeconds > 0 ? (totalSeconds - timeRemaining) / totalSeconds : 0;
  const circumference = 2 * Math.PI * (SIZES.circle / 2 - SIZES.stroke / 2);

  const completeFast = useCallback(() => {
    if (currentFast && plan) {
      const xpEarned = getXPReward(plan.fastingHours);
      const completedFast: Fast = {
        ...currentFast,
        status: 'completed',
        actualEndTime: new Date(),
        xpEarned,
      };
      
      setCurrentFast(completedFast);
      setIsRunning(false);
      
      Alert.alert(
        'Fast Complete!',
        `Congratulations! You earned ${xpEarned} XP.`,
        [{ text: 'OK', onPress: () => router.push('/(tabs)') }]
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
            if (currentFast) {
              setCurrentFast({ ...currentFast, status: 'cancelled', actualEndTime: new Date() });
            }
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
      <View style={styles.mainContainer}>
        <Text style={styles.topLabel}>FASTING</Text>

        {/* Progress Ring */}
        <View style={styles.circleContainer}>
          <Svg width={SIZES.circle} height={SIZES.circle} style={styles.circle}>
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
            <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
            {plan && (
              <Text style={styles.planText}>{plan.fastingHours} HR FAST</Text>
            )}
          </View>
        </View>

        {/* Button - 20px below circle */}
        <TouchableOpacity style={styles.endButton} onPress={endFast}>
          <Text style={styles.endButtonText}>END FAST</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.padding,
  },
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topLabel: {
    fontSize: 26,
    fontFamily: FONTS.oswaldBold,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 120, 
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 120, // 20px below circle
  },
  circle: {
    position: 'absolute',
  },
  timerTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 48,
    fontFamily: FONTS.oswaldBold,
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
  endButton: {
    backgroundColor: COLORS.buttonBg,
    width: width * 0.8,
    height: SIZES.buttonHeight,
    borderRadius: SIZES.buttonRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endButtonText: {
    fontSize: 18,
    fontFamily: FONTS.oswaldSemiBold,
    color: COLORS.buttonText,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: 'bold',
  },
});