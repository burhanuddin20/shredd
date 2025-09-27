import { FASTING_PLANS, Fast, getXPReward } from '@/constants/game';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.7;
const STROKE_WIDTH = 8;

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
  const circumference = 2 * Math.PI * (CIRCLE_SIZE / 2 - STROKE_WIDTH / 2);

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
      {/* Top Label */}
      <Text style={styles.topLabel}>FASTING</Text>

      {/* Central Progress Ring */}
      <View style={styles.circleContainer}>
        <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} style={styles.circle}>
          {/* Background Circle */}
          <Circle
            cx={CIRCLE_SIZE / 2}
            cy={CIRCLE_SIZE / 2}
            r={CIRCLE_SIZE / 2 - STROKE_WIDTH / 2}
            stroke="#2A2A2A"
            strokeWidth={STROKE_WIDTH}
            fill="transparent"
          />
          {/* Progress Circle */}
          <Circle
            cx={CIRCLE_SIZE / 2}
            cy={CIRCLE_SIZE / 2}
            r={CIRCLE_SIZE / 2 - STROKE_WIDTH / 2}
            stroke="#6B705C"
            strokeWidth={STROKE_WIDTH}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            strokeLinecap="round"
            transform={`rotate(-90 ${CIRCLE_SIZE / 2} ${CIRCLE_SIZE / 2})`}
          />
        </Svg>
        
        {/* Timer Text Inside Circle */}
        <View style={styles.timerTextContainer}>
          <Text style={styles.timerText}>
            {formatTime(timeRemaining)}
          </Text>
          {plan && (
            <Text style={styles.planText}>
              {plan.fastingHours} HR FAST
            </Text>
          )}
        </View>
      </View>

      {/* Bottom Button */}
      <TouchableOpacity 
        style={styles.endButton}
        onPress={endFast}
      >
        <Text style={styles.endButtonText}>END FAST</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0C0C',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  topLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B705C',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 60,
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
  },
  circle: {
    position: 'absolute',
  },
  timerTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#D0C9B3',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  planText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B705C',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 8,
  },
  endButton: {
    backgroundColor: '#556B2F',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  endButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D0C9B3',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});