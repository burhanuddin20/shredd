import { IconSymbol } from '@/components/ui/icon-symbol';
import { MilitaryButton } from '@/components/ui/military-button';
// import { MilitaryCard } from '@/components/ui/military-card';
import { FASTING_PLANS } from '@/constants/game';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PanGestureHandlerGestureEvent
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// const { width } = Dimensions.get('window');

const onboardingSteps = [
  {
    id: 1,
    title: 'WELCOME TO SHREDD',
    subtitle: 'MILITARY-GRADE FASTING PROTOCOL',
    description: 'Transform your intermittent fasting journey. Rise through the ranks get shredded and become a legendary warrior!',
    icon: 'shield',
    color: '#556B2F',
  },
  {
    id: 2,
    title: 'FASTING PROTOCOLS',
    subtitle: 'MISSION PARAMETERS',
    description: '• Fast for the duration of your chosen plan\n• Stay hydrated with water, tea, or coffee\n• Avoid caloric intake during fasting\n• Track your progress and earn XP',
    icon: 'list.bullet',
    color: '#DAA520',
  },
  {
    id: 3,
    title: 'MISSION ADVANTAGES',
    subtitle: 'FASTING BENEFITS',
    description: '• Improved metabolic health\n• Enhanced mental clarity\n• Weight management\n• Cellular repair and longevity\n• Increased energy levels',
    icon: 'heart',
    color: '#556B2F',
  },
  {
    id: 4,
    title: 'MILITARY DECORATIONS',
    subtitle: 'ACHIEVEMENT SYSTEM',
    description: 'Earn badges and XP for completing fasts, maintaining streaks, and reaching milestones. From your first fast to becoming a 365-day veteran!',
    icon: 'medal',
    color: '#DAA520',
  },
  {
    id: 5,
    title: 'SQUAD UP',
    subtitle: 'SHREDD with your friends',
    description: 'Join a squad and partner with your friends or other users and train together.',
    icon: 'person.2',
    color: '#6B705C',
  },
  {
    id: 6,
    title: 'MISSION PLAN',
    subtitle: 'CHOOSE YOUR PROTOCOL',
    description: '',
    icon: 'list.bullet',
    color: '#556B2F',
  },
  {
    id: 7,
    title: 'SOLDIER NAME',
    subtitle: 'IDENTIFY YOURSELF',
    description: '',
    icon: 'person',
    color: '#556B2F',
  },
];

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const nextStep = () => {
    // Haptic feedback for navigation
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // On final step, require name input
      if (userName.trim()) {
        console.log('User name:', userName, 'Selected plan:', selectedPlan);
        startLoadingSequence();
      } else {
        // Could show an alert here asking user to enter their name
        console.log('No name entered');
      }
    }
  };

  const startLoadingSequence = () => {
    setIsLoading(true);

    // Start continuous haptic feedback to simulate building
    const hapticInterval = setInterval(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 200); // Light haptic every 200ms

    // Simulate building personalized plan
    setTimeout(() => {
      clearInterval(hapticInterval);
      // Final completion haptic - like construction finishing
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setShowSubscription(true);
      setIsLoading(false);
    }, 3000); // 3 seconds of loading animation
  };

  const handleSubscriptionComplete = () => {
    setShowSubscription(false);
    // TODO: Save selected plan to user preferences
    router.replace('/(tabs)');
  };

  // Loading Screen Component
  const LoadingScreen = () => {
    const pulseScale = useSharedValue(1);
    const rotationValue = useSharedValue(0);
    const textOpacity = useSharedValue(0);

    useEffect(() => {
      if (isLoading) {
        // Strong haptic feedback on start - like construction beginning
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        // Medium haptic after 500ms - like machinery starting
        setTimeout(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }, 500);

        // Pulse animation
        pulseScale.value = withRepeat(
          withSequence(
            withTiming(1.2, { duration: 800 }),
            withTiming(1, { duration: 800 })
          ),
          -1,
          false
        );

        // Rotation animation
        rotationValue.value = withRepeat(
          withTiming(360, { duration: 2000 }),
          -1,
          false
        );

        // Text fade in
        textOpacity.value = withTiming(1, { duration: 500 });
      }
    }, [pulseScale, rotationValue, textOpacity]);

    const animatedPulseStyle = useAnimatedStyle(() => ({
      transform: [{ scale: pulseScale.value }],
    }));

    const animatedRotationStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: `${rotationValue.value}deg` }],
    }));

    const animatedTextStyle = useAnimatedStyle(() => ({
      opacity: textOpacity.value,
    }));

    if (!isLoading) return null;

    return (
      <View style={styles.loadingOverlay}>
        <View style={styles.loadingContent}>
          <Animated.View style={[styles.loadingIconContainer, animatedPulseStyle]}>
            <Animated.View style={animatedRotationStyle}>
              <IconSymbol name="gearshape" size={60} color={colors.accent} />
            </Animated.View>
          </Animated.View>

          <Animated.View style={animatedTextStyle}>
            <Text style={[styles.loadingTitle, { color: colors.beige }]}>
              BUILDING PERSONALISED PLAN
            </Text>
            <Text style={[styles.loadingSubtitle, { color: colors.accent }]}>
              Starting Mission...
            </Text>
          </Animated.View>
        </View>
      </View>
    );
  };

  // Subscription Overlay Component
  const SubscriptionOverlay = () => {
    const scaleValue = useSharedValue(0);
    const opacityValue = useSharedValue(0);

    useEffect(() => {
      if (showSubscription) {
        // Haptic feedback for gift
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        scaleValue.value = withSequence(
          withTiming(1.1, { duration: 300 }),
          withTiming(1, { duration: 200 })
        );
        opacityValue.value = withTiming(1, { duration: 400 });
      }
    }, [scaleValue, opacityValue]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scaleValue.value }],
      opacity: opacityValue.value,
    }));

    if (!showSubscription) return null;

    return (
      <View style={styles.subscriptionOverlay}>
        <Animated.View style={[styles.subscriptionContent, animatedStyle]}>
          <View style={styles.giftContainer}>
            <IconSymbol name="gift" size={80} color={colors.warning} />
          </View>

          <Text style={[styles.subscriptionTitle, { color: colors.beige }]}>
            FREE GIFT!
          </Text>

          <Text style={[styles.subscriptionSubtitle, { color: colors.accent }]}>
            7-Day Free Trial
          </Text>

          <Text style={[styles.subscriptionPrice, { color: colors.accent }]}>
            then just $2/month
          </Text>

          <View style={styles.subscriptionButtons}>
            <TouchableOpacity
              style={[styles.startTrialButton, { backgroundColor: colors.accent }]}
              onPress={handleSubscriptionComplete}
            >
              <Text style={[styles.startTrialText, { color: colors.background }]}>
                START FREE TRIAL
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    );
  };

  const prevStep = () => {
    // Haptic feedback for navigation
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Swipe gesture handler
  const handleSwipeGesture = (event: PanGestureHandlerGestureEvent) => {
    const { translationX, velocityX } = event.nativeEvent;

    // Swipe right (go back) - minimum distance and velocity
    if (translationX > 50 && velocityX > 300 && currentStep > 0) {
      prevStep();
    }

    // Swipe left (go forward) - minimum distance and velocity
    // Allow swipe forward on all steps except the final name step
    if (translationX < -50 && velocityX < -300 && currentStep < onboardingSteps.length - 1) {
      nextStep();
    }
  };


  const currentStepData = onboardingSteps[currentStep];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <PanGestureHandler onGestureEvent={handleSwipeGesture}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Hero Section for first step */}
            {currentStep === 0 && (
              <View style={styles.heroSection}>
                <View style={styles.warriorSilhouette}>
                  <IconSymbol name="figure.walk" size={120} color={colors.accent} />
                  <View style={[styles.cloak, { backgroundColor: colors.accent + '40' }]} />
                </View>
                <Text style={[styles.heroText, { color: colors.beige }]}>
                  START YOUR TRAINING
                </Text>
              </View>
            )}

            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              {onboardingSteps.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressDot,
                    {
                      backgroundColor: index <= currentStep ? colors.accent : colors.border,
                    },
                  ]}
                />
              ))}
            </View>

            {/* Content */}
            <View style={styles.content}>
              {currentStep !== 0 && currentStep !== 5 && currentStep !== 6 && (
                <View style={styles.iconContainer}>
                  <IconSymbol
                    name={currentStepData.icon as any}
                    size={80}
                    color={currentStepData.color}
                  />
                </View>
              )}
              {(currentStep === 5 || currentStep === 6) && (
                <View style={styles.smallIconContainer}>
                  <IconSymbol
                    name={currentStepData.icon as any}
                    size={40}
                    color={currentStepData.color}
                  />
                </View>
              )}

              <Text style={[styles.title, { color: colors.beige }]}>
                {currentStepData.title}
              </Text>

              <Text style={[
                (currentStep === 5 || currentStep === 6) ? styles.subtitleCompact : styles.subtitle,
                { color: colors.accent }
              ]}>
                {currentStepData.subtitle}
              </Text>

              {currentStepData.description && (
                <Text style={[styles.description, { color: colors.beige }]}>
                  {currentStepData.description}
                </Text>
              )}

              {/* Special content for plan selection */}
              {currentStep === 5 && (
                <View style={styles.plansContainer}>
                  <Text style={{ color: 'white', fontSize: 16, marginBottom: 10 }}>
                  </Text>
                  {FASTING_PLANS.map((plan) => (
                    <TouchableOpacity
                      key={plan.id}
                      onPress={() => setSelectedPlan(plan.id)}
                      style={[
                        styles.planCard,
                        selectedPlan === plan.id && styles.selectedPlanCard,
                        { borderColor: selectedPlan === plan.id ? colors.accent : colors.border }
                      ]}
                    >
                      <View style={styles.planCardContent}>
                        <View style={styles.planInfo}>
                          <Text style={[styles.planName, { color: colors.beige }]}>{plan.name}</Text>
                          <Text style={[styles.planDescription, { color: colors.beige }]}>
                            {plan.fastingHours}h fast / {24 - plan.fastingHours}h eating
                          </Text>
                          <Text style={[styles.planDifficulty, { color: colors.accent }]}>
                            {plan.difficulty}
                          </Text>
                        </View>
                        {selectedPlan === plan.id && (
                          <IconSymbol name="checkmark.circle.fill" size={24} color={colors.accent} />
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Special content for name input */}
              {currentStep === 6 && (
                <View style={styles.nameFormContainer}>
                  <Text style={[styles.nameFormLabel, { color: colors.beige }]}>
                    Enter your soldier name:
                  </Text>
                  <TextInput
                    style={[styles.nameInput, {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.beige
                    }]}
                    value={userName}
                    onChangeText={setUserName}
                    placeholder="Your name"
                    placeholderTextColor={colors.secondary}
                    autoCapitalize="words"
                    autoCorrect={false}
                    maxLength={20}
                  />
                  <Text style={[styles.nameFormHint, { color: colors.secondary }]}>
                    This will be your display name in the app
                  </Text>
                </View>
              )}
            </View>

            {/* Navigation Buttons */}
            <View style={styles.navigation}>
              <View style={styles.navigationLeft}>
                {currentStep > 0 && (
                  <MilitaryButton
                    title="Previous"
                    onPress={prevStep}
                    variant="secondary"
                    size="medium"
                  />
                )}
              </View>

              <View style={styles.navigationRight}>
                <MilitaryButton
                  title={
                    currentStep === onboardingSteps.length - 1
                      ? 'Start Mission'
                      : 'Next'
                  }
                  onPress={nextStep}
                  variant={
                    currentStep === onboardingSteps.length - 1 && !userName.trim()
                      ? "secondary"
                      : "primary"
                  }
                  size="medium"
                />
              </View>
            </View>
          </ScrollView>
        </PanGestureHandler>

        {/* Loading Overlay */}
        <LoadingScreen />

        {/* Subscription Overlay */}
        <SubscriptionOverlay />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  warriorSilhouette: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 20,
  },
  cloak: {
    position: 'absolute',
    top: 20,
    left: -20,
    right: -20,
    height: 80,
    borderRadius: 40,
    opacity: 0.3,
  },
  heroText: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
    fontFamily: 'military',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginBottom: 30,
  },
  smallIconContainer: {
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
    fontFamily: 'military',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.5,
    fontFamily: 'body',
  },
  subtitleCompact: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.5,
    fontFamily: 'body',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
    fontFamily: 'body',
  },
  plansContainer: {
    marginTop: 5,
    width: '100%',
    padding: 5,
  },
  plansTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 1,
    fontFamily: 'military',
  },
  plansSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.5,
    fontFamily: 'body',
    opacity: 0.8,
  },
  planCard: {
    marginBottom: 8,
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 70,
  },
  selectedPlanCard: {
    borderWidth: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  planCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
    letterSpacing: 0.5,
    fontFamily: 'body',
  },
  planDescription: {
    fontSize: 12,
    marginBottom: 2,
    opacity: 0.8,
    fontFamily: 'body',
  },
  planDifficulty: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'body',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  trialInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8,
    marginTop: 12,
    gap: 6,
  },
  trialText: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    fontFamily: 'military',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  navigationLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  navigationRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  // Name Form Styles
  nameFormContainer: {
    marginTop: 15,
    width: '100%',
    padding: 10,
  },
  nameFormLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 1,
    fontFamily: 'military',
  },
  nameInput: {
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'body',
    textAlign: 'center',
    marginBottom: 12,
  },
  nameFormHint: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
    fontFamily: 'body',
  },
  // Loading Overlay Styles
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(11, 12, 12, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIconContainer: {
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 2,
    fontFamily: 'military',
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 1,
    fontFamily: 'body',
  },
  // Subscription Overlay Styles
  subscriptionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(11, 12, 12, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
  },
  subscriptionContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  giftContainer: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscriptionTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 3,
    fontFamily: 'military',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  subscriptionSubtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
    fontFamily: 'military',
    marginBottom: 8,
  },
  subscriptionPrice: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
    fontFamily: 'body',
    marginBottom: 30,
  },
  subscriptionButtons: {
    width: '100%',
  },
  startTrialButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startTrialText: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
    fontFamily: 'military',
    textTransform: 'uppercase',
  },
});
