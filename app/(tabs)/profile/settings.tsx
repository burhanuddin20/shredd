import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHaptics } from '@/hooks/use-haptics';
import { clearAllData } from '@/src/lib/db';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import * as Updates from 'expo-updates';
import {
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

interface SettingsSection {
  id: string;
  title: string;
  items: SettingsItem[];
}

interface SettingsItem {
  id: string;
  title: string;
  subtitle?: string;
  type: 'toggle' | 'action' | 'info';
  value?: boolean;
  icon?: string;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const haptics = useHaptics();
  
  const [settings, setSettings] = useState({
    notifications: true,
    haptics: true,
    soundEffects: false,
    darkMode: colorScheme === 'dark',
    autoStartTimer: false,
    reminderNotifications: true,
    achievementNotifications: true,
    streakReminders: true,
  });

  const handleToggle = (key: keyof typeof settings) => {
    haptics.light();
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    
    // Update haptic settings when haptics toggle changes
    if (key === 'haptics') {
      haptics.setEnabled(!settings.haptics);
    }
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Export your fasting data as a CSV file?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => {
          // In a real app, this would export user data
          Alert.alert('Success', 'Data exported successfully!');
        }},
      ]
    );
  };

  const handleResetProgress = () => {
    Alert.alert(
      'Reset Progress',
      'Are you sure you want to reset all your progress? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: async () => {
            try{
              await clearAllData();
              Alert.alert('Progress Reset', 'All progress has been reset.');
              await restartApp();

            } catch (error) {
              console.error('Failed to reset progress:', error);
              Alert.alert('Error', 'Failed to reset progress');
            }
          }
        },
      ]
    );
  };

  const restartApp = async () => {
    try {
      await Updates.reloadAsync();
    } catch (error) {
      console.error('Failed to restart app:', error);
    }
  };


  const handleContactSupport = () => {
    // todo handle this 
    Linking.openURL('mailto:support@shredd.com?subject=Shredd Support');
  };

  const handleRateApp = () => {
    // todo handle this 
    Alert.alert('Rate App', 'Thank you for using Shredd! Rating feature coming soon.');
  };

  const handlePrivacyPolicy = () => {
    // todo handle this 
    Linking.openURL('https://shredd.com/privacy');
  };

  const handleTermsOfService = () => {
    // todo handle this 
    Linking.openURL('https://shredd.com/terms');
  };

  const settingsSections: SettingsSection[] = [
    {
      id: 'notifications',
      title: 'Notifications',
      items: [
        {
          id: 'notifications',
          title: 'Push Notifications',
          subtitle: 'Receive notifications for fast reminders and achievements',
          type: 'toggle',
          value: settings.notifications,
          icon: 'bell.fill',
          onToggle: (value) => handleToggle('notifications'),
        },
        {
          id: 'reminderNotifications',
          title: 'Fast Reminders',
          subtitle: 'Remind me when to start and end my fasts',
          type: 'toggle',
          value: settings.reminderNotifications,
          icon: 'clock.fill',
          onToggle: (value) => handleToggle('reminderNotifications'),
        },
        {
          id: 'achievementNotifications',
          title: 'Achievement Alerts',
          subtitle: 'Notify me when I earn achievements',
          type: 'toggle',
          value: settings.achievementNotifications,
          icon: 'trophy.fill',
          onToggle: (value) => handleToggle('achievementNotifications'),
        },
        {
          id: 'streakReminders',
          title: 'Streak Reminders',
          subtitle: 'Keep your fasting streak alive',
          type: 'toggle',
          value: settings.streakReminders,
          icon: 'flame.fill',
          onToggle: (value) => handleToggle('streakReminders'),
        },
      ],
    },
    {
      id: 'preferences',
      title: 'Preferences',
      items: [
        {
          id: 'haptics',
          title: 'Haptic Feedback',
          subtitle: 'Vibration feedback for interactions',
          type: 'toggle',
          value: settings.haptics,
          icon: 'iphone.radiowaves.left.and.right',
          onToggle: (value) => handleToggle('haptics'),
        },
        {
          id: 'soundEffects',
          title: 'Sound Effects',
          subtitle: 'Audio feedback for timer and achievements',
          type: 'toggle',
          value: settings.soundEffects,
          icon: 'speaker.wave.2.fill',
          onToggle: (value) => handleToggle('soundEffects'),
        },
        {
          id: 'autoStartTimer',
          title: 'Auto-Start Timer',
          subtitle: 'Automatically start timer when fast begins',
          type: 'toggle',
          value: settings.autoStartTimer,
          icon: 'play.circle.fill',
          onToggle: (value) => handleToggle('autoStartTimer'),
        },
      ],
    },
    {
      id: 'data',
      title: 'Data & Privacy',
      items: [
        {
          id: 'exportData',
          title: 'Export Data',
          subtitle: 'Download your fasting data',
          type: 'action',
          icon: 'square.and.arrow.up.fill',
          onPress: handleExportData,
        },
        {
          id: 'resetProgress',
          title: 'Reset Progress',
          subtitle: 'Clear all your fasting history and progress. Subscriptions can be restored anytime',
          type: 'action',
          icon: 'trash.fill',
          onPress: handleResetProgress,
        },
        {
          id: 'privacyPolicy',
          title: 'Privacy Policy',
          subtitle: 'How we protect your data',
          type: 'action',
          icon: 'hand.raised.fill',
          onPress: handlePrivacyPolicy,
        },
        {
          id: 'termsOfService',
          title: 'Terms of Service',
          subtitle: 'Terms and conditions',
          type: 'action',
          icon: 'doc.text.fill',
          onPress: handleTermsOfService,
        },
      ],
    },
    {
      id: 'support',
      title: 'Support',
      items: [
        {
          id: 'contactSupport',
          title: 'Contact Support',
          subtitle: 'Get help with the app',
          type: 'action',
          icon: 'envelope.fill',
          onPress: handleContactSupport,
        },
        {
          id: 'rateApp',
          title: 'Rate App',
          subtitle: 'Share your experience',
          type: 'action',
          icon: 'star.fill',
          onPress: handleRateApp,
        },
        {
          id: 'appVersion',
          title: 'App Version',
          // todo handle this 
          // maybe show the app version and build number
          subtitle: `Version ${Constants.expoConfig?.version} (Build ${Constants.expoConfig?.ios?.buildNumber})`,
          type: 'info',
          icon: 'info.circle.fill',
        },
      ],
    },
  ];

  const renderSettingsItem = (item: SettingsItem) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.settingsItem, { backgroundColor: colors.surface }]}
        onPress={item.onPress}
        disabled={item.type === 'toggle' || item.type === 'info'}
      >
        <View style={styles.itemLeft}>
          {item.icon && (
            <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
              <IconSymbol name={item.icon} size={20} color={colors.accent} />
            </View>
          )}
          <View style={styles.itemText}>
            <Text style={[styles.itemTitle, { color: colors.text }]}>
              {item.title}
            </Text>
            {item.subtitle && (
              <Text style={[styles.itemSubtitle, { color: colors.icon }]}>
                {item.subtitle}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.itemRight}>
          {item.type === 'toggle' && (
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor={colors.primary}
            />
          )}
          {item.type === 'action' && (
            <IconSymbol name="chevron.right" size={16} color={colors.icon} />
          )}
          {item.type === 'info' && (
            <Text style={[styles.infoText, { color: colors.icon }]}>
              {item.subtitle}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{ 
          title: 'Settings',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {settingsSections.map((section) => (
          <View key={section.id} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {section.title}
            </Text>
            <View style={styles.sectionContent}>
              {section.items.map(renderSettingsItem)}
            </View>
          </View>
        ))}

        {/* Subscription Info */}
        <View style={[styles.subscriptionCard, { backgroundColor: colors.accent + '20' }]}>
          <View style={styles.subscriptionHeader}>
            <IconSymbol name="crown.fill" size={24} color={colors.accent} />
            <Text style={[styles.subscriptionTitle, { color: colors.text }]}>
              Shredd Premium
            </Text>
          </View>
          <Text style={[styles.subscriptionSubtitle, { color: colors.icon }]}>
            Unlock advanced features and track unlimited fasts
          </Text>
          <TouchableOpacity 
            style={[styles.subscriptionButton, { backgroundColor: colors.accent }]}
            onPress={() => Alert.alert('Premium', 'Premium features coming soon!')}
          >
            <Text style={[styles.subscriptionButtonText, { color: colors.primary }]}>
              Upgrade Now - $2/month
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
    padding: 16,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 4,
  },
  sectionContent: {
    gap: 8,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemSubtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  itemRight: {
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
  },
  subscriptionCard: {
    padding: 20,
    borderRadius: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.2)',
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  subscriptionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subscriptionSubtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  subscriptionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  subscriptionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

