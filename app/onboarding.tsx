import { IconSymbol } from '@/components/ui/icon-symbol';
import { MilitaryButton } from '@/components/ui/military-button';
// import { MilitaryCard } from '@/components/ui/military-card';
import { FASTING_PLANS } from '@/constants/game';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
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
    title: 'SUBSCRIPTION',
    subtitle: 'JOIN THE ARMY',
    description: 'Start with the 7-day free trial, then continue your journey for just $2/month.',
    icon: 'creditcard.fill',
    color: '#556B2F',
  },
];

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // On final step, require plan selection
      if (selectedPlan) {
        // TODO: Save selected plan to user preferences
        console.log('Selected plan:', selectedPlan);
        router.replace('/(tabs)');
      } else {
        // Could show an alert here asking user to select a plan
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
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

        {/* Content */}
        <View style={styles.content}>
          {currentStep !== 0 && currentStep !== 5 && (
            <View style={styles.iconContainer}>
              <IconSymbol
                name={currentStepData.icon as any}
                size={80}
                color={currentStepData.color}
              />
            </View>
          )}
          {currentStep === 5 && (
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
            currentStep === 5 ? styles.subtitleCompact : styles.subtitle,
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
            title={
              currentStep === onboardingSteps.length - 1
                ? (selectedPlan ? 'Start Mission' : 'Select Plan to Continue')
                : 'Next'
            }
            onPress={nextStep}
            variant={currentStep === onboardingSteps.length - 1 && !selectedPlan ? "secondary" : "primary"}
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
    marginTop: 15,
    width: '100%',
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  selectedPlanCard: {
    borderWidth: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    paddingHorizontal: 20,
    paddingVertical: 30,
    gap: 15,
  },
});
