import { IconSymbol } from '@/components/ui/icon-symbol';
import { MilitaryButton } from '@/components/ui/military-button';
// import { MilitaryCard } from '@/components/ui/military-card';
import { FASTING_PLANS } from '@/constants/game';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FLAGS } from '@/src/config/flags';
import { useUserProfile } from '@/src/lib/UserProfileProvider';
import { saveUser } from '@/src/lib/db';
import { revenueCatService } from '@/src/services/revenuecat';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
// import Purchases from 'react-native-purchases';
import PaywallScreen from '@/screens/PaywallScreen';
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
    subtitle: 'YOUR TRANSFORMATION STARTS NOW',
    description: 'Millions around the world practice intermittent fasting. With Shredd, you’ll gamify your discipline, track progress, and unlock your ultimate potential!',
    icon: 'shield',
    color: '#FF6B35',
    stat: 'Millions fast worldwide',
  },
  {
    id: 2,
    title: 'THE SCIENCE',
    subtitle: 'BACKED BY RESEARCH',
    description: 'Research from leading institutions like Harvard and Johns Hopkins shows intermittent fasting can support metabolic health, cellular repair, and overall wellness.',
    icon: 'brain.head.profile',
    color: '#4ECDC4',
    stat: '2,000+ studies on fasting',
  },
  {
    id: 3,
    title: 'PROVEN BENEFITS',
    subtitle: 'REAL TRANSFORMATIONS',
    description: 'Intermittent fasting is linked to weight management, improved insulin sensitivity, boosted energy, and sharper mental clarity. Many people report lasting lifestyle changes.',
    icon: 'chart.line.uptrend.xyaxis',
    color: '#95E1D3',
    stat: 'Most feel results in weeks',
  },
  {
    id: 4,
    title: 'GAMIFIED PROGRESS',
    subtitle: 'EVERY FAST COUNTS',
    description: 'Earn XP, unlock achievements, and climb military-inspired ranks from Cadet to Legendary Warrior. Track streaks, chase milestones, and make fasting addictively fun.',
    icon: 'medal',
    color: '#FFD700',
    stat: 'Average streak: 28 days',
  },
  {
    id: 5,
    title: 'SQUAD UP',
    subtitle: '🚀 FEATURE PLANNED',
    description: 'Form squads with friends, compete as a team, and climb global leaderboards. Train together, win together — squad features are on the way!',
    icon: 'person.2',
    color: '#9B59B6',
    stat: 'squad features planned',
  },
  {
    id: 6,
    title: 'CHOOSE YOUR MISSION',
    subtitle: 'SELECT YOUR PROTOCOL',
    description: '',
    icon: 'list.bullet',
    color: '#556B2F',
  },
  {
    id: 7,
    title: 'SOLDIER NAME',
    subtitle: 'CLAIM YOUR IDENTITY',
    description: '',
    icon: 'person',
    color: '#556B2F',
  },
];

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<string | null>('16:8'); // Default to 16:8
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Controls the animation for 'Preparing Plan'
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevents multiple submissions
  const [showPaywall, setShowPaywall] = useState(false);

  // Get refreshUserData from UserProfileProvider
  const { refreshUserData } = useUserProfile();

  // Animation values for slide transitions
  const slideOpacity = useSharedValue(0);
  const slideTranslateY = useSharedValue(50);
  const iconScale = useSharedValue(0);
  const iconRotation = useSharedValue(-180);
  const statBadgeScale = useSharedValue(0);
  const statBadgeOpacity = useSharedValue(0);
  const shimmerOpacity = useSharedValue(0.3);

  // Animate on step change

  useEffect(() => {
    // Haptic feedback on slide change
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Reset and animate slide content
    slideOpacity.value = 0;
    slideTranslateY.value = 50;
    iconScale.value = 0;
    iconRotation.value = -180;
    statBadgeScale.value = 0;
    statBadgeOpacity.value = 0;

    // Staggered animation sequence
    slideOpacity.value = withTiming(1, { duration: 600 });
    slideTranslateY.value = withTiming(0, { duration: 600 });

    iconScale.value = withSequence(
      withTiming(0, { duration: 200 }),
      withTiming(1.2, { duration: 400 }),
      withTiming(1, { duration: 200 })
    );

    iconRotation.value = withTiming(0, { duration: 600 });

    // Stat badge pops in after content
    setTimeout(() => {
      statBadgeScale.value = withSequence(
        withTiming(1.3, { duration: 300 }),
        withTiming(1, { duration: 200 })
      );
      statBadgeOpacity.value = withTiming(1, { duration: 400 });
    }, 400);
  }, [currentStep, slideOpacity, slideTranslateY, iconScale, iconRotation, statBadgeScale, statBadgeOpacity]);

  // Continuous pulse animation for icon

  useEffect(() => {
    iconScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    );

    // Shimmer effect for stat badges
    shimmerOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1200 }),
        withTiming(0.3, { duration: 1200 })
      ),
      -1,
      true
    );
  }, [currentStep, iconScale, shimmerOpacity]);

  // Validate and sanitize username
  const validateAndSanitizeName = (name: string): string => {
    // Remove any potential SQL injection characters and limit length
    const sanitized = name
      .replace(/[<>'"&]/g, '') // Remove potentially dangerous characters
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim()
      .substring(0, 10); // Limit to 10 characters

    return sanitized; // Return empty string if no valid name provided
  };
  // const [isSubscribing, setIsSubscribing] = useState(false); // Commented out - not needed for placeholder
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];


  // Animated styles
  const slideAnimatedStyle = useAnimatedStyle(() => ({
    opacity: slideOpacity.value,
    transform: [{ translateY: slideTranslateY.value }],
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: iconScale.value },
      { rotate: `${iconRotation.value}deg` }
    ],
  }));

  const statBadgeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: statBadgeScale.value }],
    opacity: statBadgeOpacity.value,
  }));

  const shimmerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: shimmerOpacity.value,
  }));

  const nextStep = () => {
    // Prevent multiple submissions
    if (isSubmitting) return;

    // Medium haptic feedback for navigation - more satisfying
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (currentStep < onboardingSteps.length - 1) {
      // Check if we're on the plan selection step (step 5, index 5)
      if (currentStep === 5) {
        if (selectedPlan) {
          setCurrentStep(currentStep + 1);
        } else {
          // Show error feedback for no plan selected
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          Alert.alert('Error', 'Please select a fasting plan');
        }
      } else {
        setCurrentStep(currentStep + 1);
      }
    } else {
      // On final step, require name input
      const trimmedName = userName.trim();
      if (trimmedName.length > 0) {
        console.log('User name:', trimmedName, 'Selected plan:', selectedPlan || '16:8');
        startLoadingSequence();
      } else {
        // Show error feedback for empty name
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Error', 'Please enter a valid name');
      }
    }
  };

  const startLoadingSequence = async () => {
    //animation
    setIsLoading(true);
    // stop multiple submissions
    setIsSubmitting(true);

    const hapticInterval = setInterval(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 200);

    try {
      const validatedName = validateAndSanitizeName(userName);
      const finalPlan = selectedPlan || '16:8';

      if (!validatedName || validatedName.trim().length === 0) {
        throw new Error('Valid name is required');
      }

      //todo userName is being saved
      await saveUser({
        id: `user_${Date.now()}`,
        username: validatedName,
        email: undefined,
        totalXP: 0,
        streak: 0,
        currentPlan: finalPlan,
        createdAt: new Date().toISOString(),
        synced: false,
      });

      await refreshUserData();

      await new Promise(resolve => setTimeout(resolve, 2000));

      clearInterval(hapticInterval);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setIsLoading(false);

      // Check if RevenueCat is enabled
      if (FLAGS.ENABLE_REVENUECAT) {
        console.log('[Onboarding] Initializing RevenueCat...');
        await revenueCatService.initialize(`user_${Date.now()}`); // Use new user ID for RevenueCat

        console.log('[Onboarding] Checking subscription status...');
        const subscriptionStatus = await revenueCatService.checkSubscriptionStatus();

        if (subscriptionStatus.isSubscribed) {
          console.log('[Onboarding] User already subscribed, navigating to main app.');
          router.replace('/(tabs)');
        } else {
          console.log('[Onboarding] User not subscribed, showing paywall.');
          setShowPaywall(true); // This will render PaywallScreen
        }
      } else {
        console.log('[Onboarding] RevenueCat disabled, skipping paywall.');
        if (FLAGS.BYPASS_PAYWALL) {
          console.log('[Onboarding] Paywall bypassed, navigating to main app.');
          handlePaywallSkip();
        }
      }
    } catch (error) {
      clearInterval(hapticInterval);
      console.error('[Onboarding] Failed to complete onboarding:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to complete setup. Please try again later.');
      setIsLoading(false); // Stop animation on error
      setIsSubmitting(false); // Allow resubmission on error
      // don't skip paywall if error
    }
  };

  // Handle paywall completion
  const handlePaywallComplete = () => {
    console.log('[Onboarding] Paywall completed, navigating to main app.');
    setShowPaywall(false);
    // stop loading animation
    setIsLoading(false);
    setIsSubmitting(false);
    router.replace('/(tabs)');
  };

  const handlePaywallSkip = () => {
    console.log('[Onboarding] Paywall skipped, navigating to main app.');
    setShowPaywall(false);
    setIsLoading(false);
    setIsSubmitting(false);
    router.replace('/(tabs)');
  };

  const prevStep = () => {
    // Haptic feedback for navigation
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };



  const currentStepData = onboardingSteps[currentStep];

  // If paywall should be shown, render it as a full screen replacement
  if (showPaywall) {
    return (
      <PaywallScreen
        onSubscriptionComplete={handlePaywallComplete}
        onSkip={handlePaywallSkip}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Only show tap areas when not on plan selection or name entry steps */}
      {currentStep !== 5 && currentStep !== 6 && !isSubmitting && (
        <View style={styles.tapAreas}>
          {/* Left tap area for going back */}
          <TouchableOpacity
            style={styles.leftTapArea}
            onPress={prevStep}
            disabled={currentStep === 0 || isSubmitting}
          />

          {/* Right tap area for going forward */}
          <TouchableOpacity
            style={styles.rightTapArea}
            onPress={() => {
              // Only allow forward navigation if conditions are met
              if (currentStep === onboardingSteps.length - 1 && !userName.trim()) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                Alert.alert('Error', 'Please enter a valid name');
              } else {
                nextStep();
              }
            }}
            disabled={isSubmitting}
          />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} scrollEnabled={!isSubmitting}>
        {/* Hero Section for first step with animation */}
        {currentStep === 0 && (
          <Animated.View style={[styles.heroSection, slideAnimatedStyle]}>
            <Animated.View style={[styles.warriorSilhouette, iconAnimatedStyle]}>
              <IconSymbol name="figure.walk" size={120} color={colors.accent} />
              <View style={[styles.cloak, { backgroundColor: colors.accent + '40' }]} />
            </Animated.View>
            <Text style={[styles.heroText, { color: colors.beige }]}>
              START YOUR TRAINING
            </Text>
          </Animated.View>
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

        {/* Content with animations */}
        <Animated.View style={[styles.content, slideAnimatedStyle]}>
          {currentStep !== 0 && currentStep !== 5 && currentStep !== 6 && (
            <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
              <IconSymbol
                name={currentStepData.icon as any}
                size={80}
                color={currentStepData.color}
              />
            </Animated.View>
          )}
          {(currentStep === 5 || currentStep === 6) && (
            <Animated.View style={[styles.smallIconContainer, iconAnimatedStyle]}>
              <IconSymbol
                name={currentStepData.icon as any}
                size={40}
                color={currentStepData.color}
              />
            </Animated.View>
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

          {/* Stats badge for social proof with animation and shimmer */}
          {currentStepData.stat && currentStep < 5 && (
            <Animated.View style={[
              styles.statBadge,
              statBadgeAnimatedStyle,
              {
                backgroundColor: currentStepData.color + '20',
                borderColor: currentStepData.color,
              }
            ]}>
              {/* Shimmer overlay */}
              <Animated.View style={[
                styles.shimmerOverlay,
                shimmerAnimatedStyle,
                { backgroundColor: currentStepData.color }
              ]} />
              <Text style={[styles.statText, { color: currentStepData.color }]}>
                {currentStepData.stat}
              </Text>
            </Animated.View>
          )}

          {/* Special content for plan selection */}
          {currentStep === 5 && (
            <View style={styles.plansContainer}>
              <Text style={{ color: 'white', fontSize: 16, marginBottom: 10 }}>
              </Text>
              {FASTING_PLANS.map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setSelectedPlan(plan.id);
                  }}
                  style={[
                    styles.planCard,
                    selectedPlan === plan.id && styles.selectedPlanCard,
                    { borderColor: selectedPlan === plan.id ? colors.accent : colors.border }
                  ]}
                  disabled={isSubmitting}
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
                onChangeText={(text) => {
                  // Light haptic on each character
                  if (text.length > userName.length) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }

                  // Limit input to 10 characters and sanitize in real-time
                  const sanitized = text
                    .replace(/[<>'"&]/g, '')
                    .replace(/\s+/g, ' ')
                    .substring(0, 10);
                  setUserName(sanitized);
                }}
                onFocus={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                placeholder="Your name (required, max 10 chars)"
                placeholderTextColor={colors.accentSecondary}
                autoCapitalize="words"
                autoCorrect={false}
                maxLength={10}
                editable={!isSubmitting} // Disable input during submission
              />
              <Text style={[styles.nameFormHint, { color: colors.accentSecondary }]}>
                This will be your display name in the app (required)
              </Text>

              {/* Start Mission Button - only on name entry step */}
              <View style={styles.nameFormButtonContainer}>
                <MilitaryButton
                  title="Start Mission"
                  onPress={nextStep}
                  variant={!userName.trim() ? "secondary" : "primary"}
                  size="medium"
                  disabled={isSubmitting || !userName.trim()} // Disable during submission or if name is empty
                  loading={isSubmitting} // Show loading state on button
                />
              </View>
            </View>
          )}
        </Animated.View>

        {/* Navigation Buttons */}
        <View style={styles.navigation}>
          <View style={styles.navigationLeft}>
            {currentStep > 0 && (
              <MilitaryButton
                title="Previous"
                onPress={prevStep}
                variant="secondary"
                size="medium"
                disabled={isSubmitting}
              />
            )}
          </View>

          {/* Only show Next button when not on name entry step */}
          {currentStep !== 6 && (
            <View style={styles.navigationRight}>
              <MilitaryButton
                title="Next"
                onPress={nextStep}
                variant={
                  (currentStep === 5 && !selectedPlan)
                    ? "secondary"
                    : "primary"
                }
                size="medium"
                disabled={isSubmitting || (currentStep === 5 && !selectedPlan)} // Disable during submission or if plan not selected
                loading={isSubmitting} // Show loading state on button if applicable
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Loading Overlay */}
      <LoadingScreen isLoading={isLoading} colors={colors} />
    </SafeAreaView>
  );
}

interface LoadingScreenProps {
  isLoading: boolean;
  colors: typeof Colors['light'];
}

const LoadingScreen = ({ isLoading, colors }: LoadingScreenProps) => {
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
  }, [pulseScale, rotationValue, textOpacity, isLoading]);

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tapAreas: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    zIndex: 1,
  },
  leftTapArea: {
    flex: 1,
    height: '100%',
  },
  rightTapArea: {
    flex: 1,
    height: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    zIndex: 2,
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
  statBadge: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 2,
    alignSelf: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  statText: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: 'military',
    zIndex: 1,
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
  nameFormButtonContainer: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
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
});
