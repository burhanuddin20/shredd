import { MilitaryButton } from '@/components/ui/military-button';
import { MilitaryCard } from '@/components/ui/military-card';
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
          <Text style={[styles.headerTitle, { color: colors.beige, fontFamily: 'military' }]}>
            FASTING TIMER
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.accent, fontFamily: 'body' }]}>
            MISSION CONTROL CENTER
          </Text>
      </View>

        {/* Plan Selection */}
        {!currentFast && (
          <MilitaryCard style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.beige, fontFamily: 'military' }]}>
              SELECT MISSION PROTOCOL
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.plansScroll}>
              {FASTING_PLANS.map((planOption) => (
                <TouchableOpacity
                  key={planOption.id}
                  style={[
                    styles.planCard,
                    { 
                      backgroundColor: selectedPlan === planOption.id ? colors.accent : colors.secondary,
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
                    { 
                      color: selectedPlan === planOption.id ? colors.beige : colors.beige,
                      fontFamily: 'body'
                    }
                  ]}>
                    {planOption.name}
                  </Text>
                  <Text style={[
                    styles.planDifficulty,
                    { 
                      color: selectedPlan === planOption.id ? colors.beige : colors.accent,
                      fontFamily: 'body'
                    }
                  ]}>
                    {planOption.difficulty}
                  </Text>
                  <Text style={[
                    styles.planDuration,
                    { 
                      color: selectedPlan === planOption.id ? colors.beige : colors.icon,
                      fontFamily: 'body'
                    }
                  ]}>
                    {planOption.fastingHours}h FAST
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </MilitaryCard>
        )}

        {/* Timer Display */}
        <MilitaryCard style={styles.timerSection}>
          <Text style={[styles.statusText, { color: getStatusColor(), fontFamily: 'military' }]}>
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
              <Text style={[styles.timerText, { color: colors.beige, fontFamily: 'mono' }]}>
                {formatTime(timeRemaining)}
              </Text>
              {plan && (
                <Text style={[styles.planText, { color: colors.accent, fontFamily: 'body' }]}>
                  {plan.name}
                </Text>
              )}
            </View>
          </View>

          {/* Time Remaining */}
          <Text style={[styles.timeRemainingText, { color: colors.beige, fontFamily: 'body' }]}>
            {timeRemaining > 0 ? `${formatTimeShort(timeRemaining)} REMAINING` : 'MISSION COMPLETE!'}
          </Text>
        </MilitaryCard>

        {/* Control Buttons */}
        <MilitaryCard style={styles.controlsSection}>
          {!currentFast ? (
            <MilitaryButton
              title="Start Mission"
              onPress={startFast}
              variant="primary"
              size="large"
            />
          ) : (
            <View style={styles.controlsRow}>
              {currentFast.status === 'in-progress' && (
                <>
                  <MilitaryButton
                    title="Pause"
                    onPress={pauseFast}
                    variant="secondary"
                    size="medium"
                  />
                  
                  <MilitaryButton
                    title="Abort"
                    onPress={stopFast}
                    variant="danger"
                    size="medium"
                  />
                </>
              )}
              
              {isPaused && (
                <MilitaryButton
                  title="Resume"
                  onPress={resumeFast}
                  variant="success"
                  size="medium"
                />
              )}
              
              {(currentFast.status === 'completed' || currentFast.status === 'cancelled') && (
                <MilitaryButton
                  title="New Mission"
                  onPress={resetTimer}
                  variant="primary"
                  size="medium"
                />
              )}
            </View>
          )}
        </MilitaryCard>

        {/* Fast Info */}
        {currentFast && (
          <MilitaryCard style={styles.infoSection}>
            <Text style={[styles.sectionTitle, { color: colors.beige, fontFamily: 'military' }]}>
              MISSION DETAILS
            </Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: colors.icon, fontFamily: 'body' }]}>STARTED</Text>
                <Text style={[styles.infoValue, { color: colors.beige, fontFamily: 'mono' }]}>
                  {currentFast.startTime.toLocaleTimeString()}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: colors.icon, fontFamily: 'body' }]}>PLANNED END</Text>
                <Text style={[styles.infoValue, { color: colors.beige, fontFamily: 'mono' }]}>
                  {currentFast.endTime?.toLocaleTimeString()}
                </Text>
              </View>
              {currentFast.xpEarned && (
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: colors.icon, fontFamily: 'body' }]}>XP EARNED</Text>
                  <Text style={[styles.infoValue, { color: colors.accent, fontFamily: 'body' }]}>
                    +{currentFast.xpEarned} XP
                  </Text>
      </View>
              )}
      </View>
          </MilitaryCard>
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
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  section: {
    padding: 0,
    margin: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    letterSpacing: 1,
  },
  plansScroll: {
    flexDirection: 'row',
  },
  planCard: {
    padding: 16,
    borderRadius: 8,
    marginRight: 12,
    minWidth: 120,
    alignItems: 'center',
    borderWidth: 2,
  },
  planName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  planDifficulty: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
  planDuration: {
    fontSize: 9,
    opacity: 0.8,
  },
  timerSection: {
    padding: 20,
    alignItems: 'center',
    margin: 0,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 20,
    letterSpacing: 1,
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
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  planText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  timeRemainingText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  controlsSection: {
    padding: 20,
    alignItems: 'center',
    margin: 0,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  infoSection: {
    padding: 20,
    margin: 0,
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
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});