import { IconSymbol } from '@/components/ui/icon-symbol';
import { MilitaryButton } from '@/components/ui/military-button';
import { MilitaryCard } from '@/components/ui/military-card';
import { FASTING_PLANS } from '@/constants/game';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const onboardingSteps = [
  {
    id: 1,
    title: 'WELCOME TO SHREDD',
    subtitle: 'MILITARY-GRADE FASTING PROTOCOL',
    description: 'Transform your intermittent fasting journey with gamification inspired by Attack on Titan. Rise through the ranks and become a legendary warrior!',
    icon: 'shield.fill',
    color: '#556B2F',
  },
  {
    id: 2,
    title: 'FASTING PROTOCOLS',
    subtitle: 'MISSION PARAMETERS',
    description: '• Fast for the duration of your chosen plan\n• Stay hydrated with water, tea, or coffee\n• Avoid caloric intake during fasting\n• Track your progress and earn XP',
    icon: 'list.bullet.clipboard.fill',
    color: '#DAA520',
  },
  {
    id: 3,
    title: 'MISSION ADVANTAGES',
    subtitle: 'FASTING BENEFITS',
    description: '• Improved metabolic health\n• Enhanced mental clarity\n• Weight management\n• Cellular repair and longevity\n• Increased energy levels',
    icon: 'heart.fill',
    color: '#556B2F',
  },
  {
    id: 4,
    title: 'MILITARY DECORATIONS',
    subtitle: 'ACHIEVEMENT SYSTEM',
    description: 'Earn badges and XP for completing fasts, maintaining streaks, and reaching milestones. From your first fast to becoming a 365-day veteran!',
    icon: 'medal.fill',
    color: '#DAA520',
  },
  {
    id: 5,
    title: 'SURVEY CORPS THEME',
    subtitle: 'MILITARY AESTHETICS',
    description: 'Experience the app with military-grade styling, ranks inspired by the Survey Corps, and a dark theme that reflects the world beyond the walls.',
    icon: 'building.columns.fill',
    color: '#6B705C',
  },
  {
    id: 6,
    title: 'SELECT MISSION PLAN',
    subtitle: 'CHOOSE YOUR PROTOCOL',
    description: 'Start with the 7-day free trial, then continue your journey for just $2/month. Choose from multiple fasting plans to suit your warrior level.',
    icon: 'creditcard.fill',
    color: '#556B2F',
  },
];

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.replace('/(tabs)');
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipOnboarding = () => {
    router.replace('/(tabs)');
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
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

        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton} onPress={skipOnboarding}>
          <Text style={[styles.skipText, { color: colors.beige }]}>SKIP</Text>
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.content}>
          {currentStep !== 0 && (
            <View style={styles.iconContainer}>
              <IconSymbol
                name={currentStepData.icon}
                size={80}
                color={currentStepData.color}
              />
            </View>
          )}

          <Text style={[styles.title, { color: colors.beige }]}>
            {currentStepData.title}
          </Text>

          <Text style={[styles.subtitle, { color: colors.accent }]}>
            {currentStepData.subtitle}
          </Text>

          <Text style={[styles.description, { color: colors.beige }]}>
            {currentStepData.description}
          </Text>

          {/* Special content for plan selection */}
          {currentStep === 5 && (
            <View style={styles.plansContainer}>
              <Text style={[styles.plansTitle, { color: colors.beige }]}>
                AVAILABLE PROTOCOLS:
              </Text>
              {FASTING_PLANS.slice(0, 3).map((plan) => (
                <MilitaryCard key={plan.id} style={styles.planCard}>
                  <Text style={[styles.planName, { color: colors.beige }]}>{plan.name}</Text>
                  <Text style={[styles.planDifficulty, { color: colors.accent }]}>
                    {plan.difficulty}
                  </Text>
                </MilitaryCard>
              ))}
            </View>
          )}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigation}>
          {currentStep > 0 && (
            <MilitaryButton
              title="Previous"
              onPress={prevStep}
              variant="secondary"
              size="medium"
            />
          )}

          <MilitaryButton
            title={currentStep === onboardingSteps.length - 1 ? 'Start Mission' : 'Next'}
            onPress={nextStep}
            variant="primary"
            size="medium"
          />
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
  skipButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 8,
  },
  skipText: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
    fontFamily: 'military',
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
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
    fontFamily: 'body',
  },
  plansContainer: {
    marginTop: 30,
    width: '100%',
  },
  plansTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    letterSpacing: 1,
    fontFamily: 'military',
  },
  planCard: {
    marginBottom: 10,
  },
  planName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    letterSpacing: 0.5,
    fontFamily: 'body',
  },
  planDifficulty: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'body',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 30,
    gap: 15,
  },
});
