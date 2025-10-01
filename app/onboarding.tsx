import { IconSymbol } from '@/components/ui/icon-symbol';
import { MilitaryButton } from '@/components/ui/military-button';
// import { MilitaryCard } from '@/components/ui/military-card';
import { FASTING_PLANS } from '@/constants/game';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
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
  const [isLoading, setIsLoading] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false); // For legacy subscription overlay
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

  // todo should be removed

  // Initialize RevenueCat - COMMENTED OUT FOR NOW
  // useEffect(() => {
  //   const initializeRevenueCat = async () => {
  //     try {
  //       // TODO: Replace with your actual RevenueCat API key
  //       await Purchases.configure({
  //         apiKey: 'your_revenue_cat_api_key_here', // iOS/Android
  //       });

  //       // Set user ID if needed
  //       if (userName.trim()) {
  //         await Purchases.logIn(userName.trim());
  //       }
  //     } catch (error) {
  //       console.error('RevenueCat initialization failed:', error);
  //     }
  //   };

  //   initializeRevenueCat();
  // }, [userName]);

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
    setIsLoading(true);

    // Start continuous haptic feedback to simulate building
    const hapticInterval = setInterval(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 200); // Light haptic every 200ms

    try {
      // Save user data first
      const validatedName = validateAndSanitizeName(userName);
      const finalPlan = selectedPlan || '16:8';

      if (!validatedName || validatedName.trim().length === 0) {
        throw new Error('Valid name is required');
      }

      // Save user data to SQLite
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

      // Initialize RevenueCat with user ID
      await revenueCatService.initialize(`user_${Date.now()}`);

      // Refresh user data in UserProfileProvider
      await refreshUserData();

      // Check if user is already subscribed
      const subscriptionStatus = await revenueCatService.checkSubscriptionStatus();

      clearInterval(hapticInterval);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setIsLoading(false);

      if (subscriptionStatus.isSubscribed) {
        // User is already subscribed, go to main app
        router.replace('/(tabs)');
      } else {
        // Show paywall
        setShowPaywall(true);
      }
    } catch (error) {
      clearInterval(hapticInterval);
      console.error('Failed to complete onboarding:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to complete setup. Please try again.');
      setIsLoading(false);
    }
  };

  // Handle paywall completion
  const handlePaywallComplete = () => {
    setShowPaywall(false);
    router.replace('/(tabs)');
  };

  // Handle paywall skip (for testing)
  const handlePaywallSkip = () => {
    setShowPaywall(false);
    router.replace('/(tabs)');
  };

  // Handle subscription purchase - COMMENTED OUT FOR NOW
  // const handleStartFreeTrial = async () => {
  //   setIsSubscribing(true);

  //   try {
  //     // Haptic feedback for subscription start
  //     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

  //     // TODO: Replace with your actual product ID in RevenueCat dashboard

  //     // Check if user is eligible for free trial
  //     const offerings = await Purchases.getOfferings();
  //     const monthlyOffering = offerings.current?.monthly;

  //     if (monthlyOffering) {
  //       // Start the subscription with free trial
  //       const purchaseResult = await Purchases.purchasePackage(monthlyOffering);

  //       if (purchaseResult.customerInfo.entitlements.active['premium']) {
  //         // Subscription successful
  //         console.log('Subscription successful:', purchaseResult);

  //         // Success haptic
  //         Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

  //         // Save user data
  //         console.log('User:', userName, 'Plan:', selectedPlan);

  //         // Navigate to main app
  //         router.replace('/(tabs)');
  //       } else {
  //         throw new Error('Subscription not active');
  //       }
  //     } else {
  //       throw new Error('Monthly offering not available');
  //     }
  //   } catch (error: any) {
  //     console.error('Subscription failed:', error);

  //     // Error haptic
  //     Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

  //     // Handle different error types
  //     if (error.code === 'PURCHASES_ERROR_PRODUCT_NOT_AVAILABLE_FOR_PURCHASE') {
  //       console.log('Product not available for purchase');
  //     } else if (error.code === 'PURCHASES_ERROR_PAYMENT_PENDING') {
  //       console.log('Payment pending');
  //     } else {
  //       console.log('Subscription error:', error.message);
  //     }
  //   } finally {
  //     setIsSubscribing(false);
  //   }
  // };

  // Temporary placeholder function for subscription
  const handleStartFreeTrial = async () => {
    try {
      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Validate and sanitize the username
      const validatedName = validateAndSanitizeName(userName);
      const finalPlan = selectedPlan || '16:8'; // Default plan if none selected

      // Ensure we have a valid name
      if (!validatedName || validatedName.trim().length === 0) {
        throw new Error('Valid name is required');
      }

      // Save user data to SQLite
      await saveUser({
        id: `user_${Date.now()}`, // Generate unique user ID
        username: validatedName,
        email: undefined, // No email collected in onboarding
        totalXP: 0,
        streak: 0,
        currentPlan: finalPlan,
        createdAt: new Date().toISOString(),
        synced: false,
      });

      // Log user data
      console.log('User saved to database:', validatedName, 'Plan:', finalPlan);

      // Refresh user data in UserProfileProvider
      await refreshUserData();

      // Success haptic
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Navigate to main app (bypassing subscription for now)
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to save user data:', error);
      // Still navigate even if save fails
      router.replace('/(tabs)');
    }
  };

  // Legacy function - keeping for potential future use
  // const handleSubscriptionComplete = () => {
  //   setShowSubscription(false);
  //   // TODO: Save selected plan to user preferences
  //   router.replace('/(tabs)');
  // };

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
            then just $4/month
          </Text>

          <View style={styles.subscriptionButtons}>
            <TouchableOpacity
              style={[styles.startTrialButton, { backgroundColor: colors.accent }]}
              onPress={handleStartFreeTrial}
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



  const currentStepData = onboardingSteps[currentStep];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Only show tap areas when not on plan selection or name entry steps */}
      {currentStep !== 5 && currentStep !== 6 && (
        <View style={styles.tapAreas}>
          {/* Left tap area for going back */}
          <TouchableOpacity
            style={styles.leftTapArea}
            onPress={prevStep}
            disabled={currentStep === 0}
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
          />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
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
                placeholderTextColor={colors.secondary}
                autoCapitalize="words"
                autoCorrect={false}
                maxLength={10}
              />
              <Text style={[styles.nameFormHint, { color: colors.secondary }]}>
                This will be your display name in the app (required)
              </Text>

              {/* Start Mission Button - only on name entry step */}
              <View style={styles.nameFormButtonContainer}>
                <MilitaryButton
                  title="Start Mission"
                  onPress={nextStep}
                  variant={!userName.trim() ? "secondary" : "primary"}
                  size="medium"
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
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Loading Overlay */}
      <LoadingScreen />

      {/* Subscription Overlay */}
      <SubscriptionOverlay />

      {/* Paywall Screen */}
      {showPaywall && (
        <PaywallScreen
          onSubscriptionComplete={handlePaywallComplete}
          onSkip={handlePaywallSkip}
        />
      )}
    </SafeAreaView>
  );
}

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
    textAlign: 'center',
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
