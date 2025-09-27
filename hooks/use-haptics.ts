import * as Haptics from 'expo-haptics';
import { useState } from 'react';

export const useHaptics = () => {
  const [isEnabled, setIsEnabled] = useState(true);

  const light = () => {
    if (isEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const medium = () => {
    if (isEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const heavy = () => {
    if (isEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  };

  const success = () => {
    if (isEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const warning = () => {
    if (isEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  const error = () => {
    if (isEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const selection = () => {
    if (isEnabled) {
      Haptics.selectionAsync();
    }
  };

  const setEnabled = (enabled: boolean) => {
    setIsEnabled(enabled);
  };

  return {
    light,
    medium,
    heavy,
    success,
    warning,
    error,
    selection,
    isEnabled,
    setEnabled,
  };
};
