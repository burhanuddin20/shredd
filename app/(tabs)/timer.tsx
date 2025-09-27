import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  FASTING_PLANS,
  Fast,
  getXPReward
} from '@/constants/game';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHaptics } from '@/hooks/use-haptics';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.6;
const STROKE_WIDTH = 8;

export default function TimerScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const haptics = useHaptics();
  
  const [selectedPlan, setSelectedPlan] = useState<string>('16:8');
  const [currentFast, setCurrentFast] = useState<Fast | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  const plan = FASTING_PLANS.find(p => p.id === selectedPlan);
  const totalSeconds = (plan?.fastingHours || 16) * 60 * 60;
  const progress = totalSeconds > 0 ? (totalSeconds - timeRemaining) / totalSeconds : 0;
  const circumference = 2 * Math.PI * (CIRCLE_SIZE / 2 - STROKE_WIDTH / 2);

  useEffect(() => {
    if (isRunning && !isPaused && timeRemaining > 0) {
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
  }, [isRunning, isPaused, timeRemaining, completeFast]);

  const startFast = () => {
    if (!plan) return;
    
    haptics.success();
    
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
    setTimeRemaining(totalSeconds);
    setIsRunning(true);
    setIsPaused(false);
    startTimeRef.current = now;
  };

  const pauseFast = () => {
    haptics.light();
    setIsPaused(true);
    if (currentFast) {
      setCurrentFast({ ...currentFast, status: 'paused' });
    }
  };

  const resumeFast = () => {
    haptics.success();
    setIsPaused(false);
    if (currentFast) {
      setCurrentFast({ ...currentFast, status: 'in-progress' });
    }
  };

  const stopFast = () => {
    Alert.alert(
      'Stop Fast',
      'Are you sure you want to stop this fast? You will not earn XP.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Stop', 
          style: 'destructive',
          onPress: () => {
            if (currentFast) {
              setCurrentFast({ ...currentFast, status: 'cancelled', actualEndTime: new Date() });
            }
            setIsRunning(false);
            setIsPaused(false);
            setTimeRemaining(0);
          }
        },
      ]
    );
  };

  const completeFast = useCallback(() => {
    if (currentFast && plan) {
      haptics.success();
      const xpEarned = getXPReward(plan.fastingHours);
      const completedFast: Fast = {
        ...currentFast,
        status: 'completed',
        actualEndTime: new Date(),
        xpEarned,
      };
      
      setCurrentFast(completedFast);
      setIsRunning(false);
      setIsPaused(false);
      
      Alert.alert(
        'Fast Complete!',
        `Congratulations! You earned ${xpEarned} XP.`,
        [{ text: 'OK', onPress: () => router.push('/(tabs)') }]
      );
    }
  }, [currentFast, plan, haptics]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeShort = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const resetTimer = () => {
    setCurrentFast(null);
    setIsRunning(false);
    setIsPaused(false);
    setTimeRemaining(0);
    startTimeRef.current = null;
  };

  const getStatusText = (): string => {
    if (!currentFast) return 'Ready to Start';
    if (isPaused) return 'Paused';
    if (currentFast.status === 'completed') return 'Completed';
    if (currentFast.status === 'cancelled') return 'Cancelled';
    return 'In Progress';
  };

  const getStatusColor = (): string => {
    if (!currentFast) return colors.icon;
    if (isPaused) return colors.warning;
    if (currentFast.status === 'completed') return colors.success;
    if (currentFast.status === 'cancelled') return colors.danger;
    return colors.accent;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Fasting Timer</Text>
          <Text style={[styles.headerSubtitle, { color: colors.icon }]}>
            Mission Control Center
          </Text>
        </View>

        {/* Plan Selection */}
        {!currentFast && (
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Choose Your Mission</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.plansScroll}>
              {FASTING_PLANS.map((planOption) => (
                <TouchableOpacity
                  key={planOption.id}
                  style={[
                    styles.planCard,
                    { 
                      backgroundColor: selectedPlan === planOption.id ? colors.accent : colors.primary,
                      borderColor: selectedPlan === planOption.id ? colors.accent : colors.border,
                    }
                  ]}
                  onPress={() => {
                    haptics.selection();
                    setSelectedPlan(planOption.id);
                  }}
                >
                  <Text style={[
                    styles.planName,
                    { color: selectedPlan === planOption.id ? colors.primary : colors.text }
                  ]}>
                    {planOption.name}
                  </Text>
                  <Text style={[
                    styles.planDifficulty,
                    { color: selectedPlan === planOption.id ? colors.primary : colors.accent }
                  ]}>
                    {planOption.difficulty}
                  </Text>
                  <Text style={[
                    styles.planDuration,
                    { color: selectedPlan === planOption.id ? colors.primary : colors.icon }
                  ]}>
                    {planOption.fastingHours}h fast
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Timer Display */}
        <View style={[styles.timerSection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>

          {/* Progress Circle */}
          <View style={styles.circleContainer}>
            <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} style={styles.circle}>
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
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress)}
                strokeLinecap="round"
                transform={`rotate(-90 ${CIRCLE_SIZE / 2} ${CIRCLE_SIZE / 2})`}
              />
            </Svg>
            
            {/* Timer Text */}
            <View style={styles.timerTextContainer}>
              <Text style={[styles.timerText, { color: colors.text }]}>
                {formatTime(timeRemaining)}
              </Text>
              {plan && (
                <Text style={[styles.planText, { color: colors.icon }]}>
                  {plan.name}
                </Text>
              )}
            </View>
          </View>

          {/* Time Remaining */}
          <Text style={[styles.timeRemainingText, { color: colors.text }]}>
            {timeRemaining > 0 ? `${formatTimeShort(timeRemaining)} remaining` : 'Time\'s up!'}
          </Text>
        </View>

        {/* Control Buttons */}
        <View style={[styles.controlsSection, { backgroundColor: colors.surface }]}>
          {!currentFast ? (
            <TouchableOpacity
              style={[styles.startButton, { backgroundColor: colors.accent }]}
              onPress={startFast}
            >
              <IconSymbol name="play.fill" size={24} color={colors.primary} />
              <Text style={[styles.buttonText, { color: colors.primary }]}>Start Fast</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.controlsRow}>
              {currentFast.status === 'in-progress' && (
                <>
                  <TouchableOpacity
                    style={[styles.controlButton, { backgroundColor: colors.warning }]}
                    onPress={pauseFast}
                  >
                    <IconSymbol name="pause.fill" size={20} color={colors.primary} />
                    <Text style={[styles.controlButtonText, { color: colors.primary }]}>Pause</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.controlButton, { backgroundColor: colors.danger }]}
                    onPress={stopFast}
                  >
                    <IconSymbol name="stop.fill" size={20} color="#fff" />
                    <Text style={[styles.controlButtonText, { color: '#fff' }]}>Stop</Text>
                  </TouchableOpacity>
                </>
              )}
              
              {isPaused && (
                <TouchableOpacity
                  style={[styles.controlButton, { backgroundColor: colors.success }]}
                  onPress={resumeFast}
                >
                  <IconSymbol name="play.fill" size={20} color={colors.primary} />
                  <Text style={[styles.controlButtonText, { color: colors.primary }]}>Resume</Text>
                </TouchableOpacity>
              )}
              
              {(currentFast.status === 'completed' || currentFast.status === 'cancelled') && (
                <TouchableOpacity
                  style={[styles.controlButton, { backgroundColor: colors.accent }]}
                  onPress={resetTimer}
                >
                  <IconSymbol name="arrow.clockwise" size={20} color={colors.primary} />
                  <Text style={[styles.controlButtonText, { color: colors.primary }]}>New Fast</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Fast Info */}
        {currentFast && (
          <View style={[styles.infoSection, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Fast Details</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: colors.icon }]}>Started</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {currentFast.startTime.toLocaleTimeString()}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: colors.icon }]}>Planned End</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {currentFast.endTime?.toLocaleTimeString()}
                </Text>
              </View>
              {currentFast.xpEarned && (
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: colors.icon }]}>XP Earned</Text>
                  <Text style={[styles.infoValue, { color: colors.accent }]}>
                    +{currentFast.xpEarned} XP
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  plansScroll: {
    flexDirection: 'row',
  },
  planCard: {
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 120,
    alignItems: 'center',
    borderWidth: 2,
  },
  planName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  planDifficulty: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  planDuration: {
    fontSize: 11,
    opacity: 0.8,
  },
  timerSection: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  circle: {
    position: 'absolute',
  },
  timerTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  planText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  timeRemainingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  controlsSection: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoSection: {
    borderRadius: 16,
    padding: 20,
  },
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
});