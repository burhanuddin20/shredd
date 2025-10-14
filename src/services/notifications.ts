import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Set notification handler to show notifications even when the app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Registers the device for push notifications and returns the Expo push token.
 * @returns The Expo push token if successful, otherwise null.
 */
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelGroupAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      // console.log('[NOTIFICATIONS] Failed to get push token for push notification!');
      return null;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
    // console.log('[NOTIFICATIONS] Expo Push Token:', token);

  } else {
    console.log('[NOTIFICATIONS] Must use physical device for Push Notifications');
  }

  return token;
}

/**
 * Sets up listeners for incoming notifications.
 */
export function setupNotificationHandlers() {
  // Handle notifications received while the app is foregrounded
  Notifications.addNotificationReceivedListener(notification => {
  });

  // Handle user interaction with notifications (e.g., tap on notification)
  Notifications.addNotificationResponseReceivedListener(response => {
    console.log('[NOTIFICATIONS] Notification response received:', response);
    // You can navigate or perform actions based on the notification data
  });

  console.log('[NOTIFICATIONS] Notification handlers set up.');
}

/**
 * Schedules a local notification.
 * @param title The title of the notification.
 * @param body The body of the notification.
 * @param data Optional data to include with the notification.
 * @returns The ID of the scheduled notification.
 */
export async function schedulePushNotification(title: string, body: string, data?: any, scheduleTime?: Date) {
  const trigger = scheduleTime ? { date: scheduleTime } : { seconds: 1 };
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger,
  });
  console.log('[NOTIFICATIONS] Scheduled notification with ID:', id, 'at:', scheduleTime?.toLocaleString());
  return id;
}

/**
 * Cancels all scheduled notifications.
 */
export async function cancelAllScheduledNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('[NOTIFICATIONS] All scheduled notifications cancelled.');
}
