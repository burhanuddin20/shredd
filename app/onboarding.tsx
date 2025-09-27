import { IconSymbol } from '@/components/ui/icon-symbol';
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
    title: 'Welcome to Shredd',
    subtitle: 'Your Military-Grade Fasting Companion',
    description: 'Transform your intermittent fasting journey with gamification inspired by Attack on Titan. Rise through the ranks and become a legendary warrior!',
    icon: 'shield.fill',
    color: Colors.light.accent,
  },
  {
    id: 2,
    title: 'The Rules of Fasting',
    subtitle: 'Mission Parameters',
    description: '• Fast for the duration of your chosen plan\n• Stay hydrated with water, tea, or coffee\n• Avoid caloric intake during fasting\n• Track your progress and earn XP',
    icon: 'list.bullet.clipboard.fill',
    color: Colors.light.warning,
  },
  {
    id: 3,
    title: 'Benefits of Fasting',
    subtitle: 'Your Mission Advantages',
    description: '• Improved metabolic health\n• Enhanced mental clarity\n• Weight management\n• Cellular repair and longevity\n• Increased energy levels',
    icon: 'heart.fill',
    color: Colors.light.success,
  },
  {
    id: 4,
    title: 'Achievement System',
    subtitle: 'Military Decorations',
    description: 'Earn badges and XP for completing fasts, maintaining streaks, and reaching milestones. From your first fast to becoming a 365-day veteran!',
    icon: 'medal.fill',
    color: Colors.light.rankGold,
  },
  {
    id: 5,
    title: 'Attack on Titan Theme',
    subtitle: 'Military Aesthetics',
    description: 'Experience the app with military-grade styling, ranks inspired by the Survey Corps, and a dark theme that reflects the world beyond the walls.',
    icon: 'building.columns.fill',
    color: Colors.light.secondary,
  },
  {
    id: 6,
    title: 'Choose Your Plan',
    subtitle: 'Select Your Mission',
    description: 'Start with the 7-day free trial, then continue your journey for just $2/month. Choose from multiple fasting plans to suit your warrior level.',
    icon: 'creditcard.fill',
    color: Colors.light.primary,
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
          <Text style={[styles.skipText, { color: colors.icon }]}>Skip</Text>
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <IconSymbol
              name={currentStepData.icon}
              size={80}
              color={currentStepData.color}
            />
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            {currentStepData.title}
          </Text>

          <Text style={[styles.subtitle, { color: colors.accent }]}>
            {currentStepData.subtitle}
          </Text>

          <Text style={[styles.description, { color: colors.text }]}>
            {currentStepData.description}
          </Text>

          {/* Special content for plan selection */}
          {currentStep === 5 && (
            <View style={styles.plansContainer}>
              <Text style={[styles.plansTitle, { color: colors.text }]}>
                Available Plans:
              </Text>
              {FASTING_PLANS.slice(0, 3).map((plan) => (
                <View key={plan.id} style={[styles.planCard, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.planName, { color: colors.text }]}>{plan.name}</Text>
                  <Text style={[styles.planDifficulty, { color: colors.accent }]}>
                    {plan.difficulty}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigation}>
          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: colors.surface }]}
            onPress={prevStep}
            disabled={currentStep === 0}
          >
            <Text style={[styles.navButtonText, { color: colors.text }]}>Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: colors.accent }]}
            onPress={nextStep}
          >
            <Text style={[styles.navButtonText, { color: colors.primary }]}>
              {currentStep === onboardingSteps.length - 1 ? 'Start Mission' : 'Next'}
            </Text>
          </TouchableOpacity>
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
    fontSize: 16,
    fontWeight: '600',
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
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
  },
  plansContainer: {
    marginTop: 30,
    width: '100%',
  },
  plansTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  planCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.2)',
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  planDifficulty: {
    fontSize: 14,
    fontWeight: '500',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 30,
    gap: 15,
  },
  navButton: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
