import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { DatabaseProvider } from '@/src/lib/DatabaseProvider';
import { FastingProvider } from '@/src/lib/FastingProvider';
import { UserProfileProvider } from '@/src/lib/UserProfileProvider';
import {
  registerForPushNotificationsAsync,
  setupNotificationHandlers
} from '@/src/services/notifications';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Register for push notifications
    registerForPushNotificationsAsync().then((token) => {
      if (!token) {
        console.log('[NOTIFICATIONS] Failed to get push token.');
      } 
    });

    // Set up notification handlers
    setupNotificationHandlers();

    return () => {
   
    };
  }, []);

  return (
    <DatabaseProvider>
      <UserProfileProvider>
        <FastingProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </FastingProvider>
      </UserProfileProvider>
    </DatabaseProvider>
  );
}
