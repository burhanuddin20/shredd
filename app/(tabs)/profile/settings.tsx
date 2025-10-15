import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHaptics } from '@/hooks/use-haptics';
import { clearAllData } from '@/src/lib/db';
import { cancelAllScheduledNotifications, registerForPushNotificationsAsync, schedulePushNotification } from '@/src/services/notifications';
import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import * as Updates from 'expo-updates';
import React, { useState } from 'react';
import * as StoreReview from 'expo-store-review';
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

    // Handle notification settings
    if (key === 'notifications') {
      if (!settings.notifications) { // If turning notifications ON
        registerForPushNotificationsAsync().then(token => {
          if (token) {
            // console.log('[SETTINGS] Push notifications enabled. Token:', token);
            // Re-schedule all sub-notifications that are currently enabled
            if (settings.reminderNotifications) schedulePushNotification('Fast Reminder', 'Time to start your fast!');
            if (settings.achievementNotifications) schedulePushNotification('Achievement Unlocked', 'You earned an achievement!');
            if (settings.streakReminders) schedulePushNotification('Streak Reminder', 'Keep your streak alive!');
          } else {
            // If token not received, turn off the main toggle again as it's not truly enabled
            setSettings(prev => ({ ...prev, notifications: false }));
            Alert.alert('Notifications Error', 'Could not enable push notifications. Please check app permissions.');
          }
        });
      } else { // If turning notifications OFF
        cancelAllScheduledNotifications();
        // console.log('[SETTINGS] Push notifications disabled.');
      }
    } else if (key === 'reminderNotifications' || key === 'achievementNotifications' || key === 'streakReminders') {
      if (settings.notifications) { // Only schedule if main push notifications are enabled
        if (!settings[key]) { // If turning ON a specific notification
          const title = key === 'reminderNotifications' ? 'Fast Reminder' :
            key === 'achievementNotifications' ? 'Achievement Unlocked' :
              'Streak Reminder';
          const body = key === 'reminderNotifications' ? 'Time to start your fast!' :
            key === 'achievementNotifications' ? 'You earned an achievement!' :
              'Keep your streak alive!';
          schedulePushNotification(title, body);
          console.log(`[SETTINGS] ${title} scheduled.`);
        } else { // If turning OFF a specific notification
          // For simplicity, we'll cancel all and reschedule. A more robust solution
          // would involve tracking individual notification IDs.
          cancelAllScheduledNotifications();
          // Re-schedule others if needed (this is a simplified approach)
          if (key !== 'reminderNotifications' && settings.reminderNotifications) schedulePushNotification('Fast Reminder', 'Time to start your fast!');
          if (key !== 'achievementNotifications' && settings.achievementNotifications) schedulePushNotification('Achievement Unlocked', 'You earned an achievement!');
          if (key !== 'streakReminders' && settings.streakReminders) schedulePushNotification('Streak Reminder', 'Keep your streak alive!');
          console.log(`[SETTINGS] ${key} cancelled.`);
        }
      }
    }
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
            try {
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
    Linking.openURL('mailto:shreddfasting@gmail.com?subject=Shredd Support');
  };


  const handleRateApp = async () => {
    try {
      const isAvailable = await StoreReview.isAvailableAsync();
      if (isAvailable) {
        await StoreReview.requestReview();
      } else {
        Alert.alert(
          'Rate Shredd',
          'You can rate us on the App Store — your feedback helps us improve!',
          [
            {
              text: 'Open App Store',
              onPress: () =>
                // todo handle this 
                Linking.openURL('https://apps.apple.com/app/idYOUR_APP_ID?action=write-review'),
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      }
    } catch (error) {
      console.error('Error showing rate prompt:', error);
    }
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://doc-hosting.flycricket.io/shredd-privacy-policy/6d4c7e2c-8dd3-4704-a3b7-a82acfe2e71c/privacy');
  };

  const handleTermsOfService = () => {
    Linking.openURL('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/');
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
          // to do this one is broken
          id: 'appVersion',
          title: 'App Version',
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
              <IconSymbol name={item.icon as any} size={20} color={colors.accent} />
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

