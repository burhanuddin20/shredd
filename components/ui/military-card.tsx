import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface MilitaryCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'surface' | 'primary';
}

export const MilitaryCard: React.FC<MilitaryCardProps> = ({
  children,
  style,
  variant = 'surface',
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const getCardColors = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary,
          borderColor: colors.accent,
        };
      case 'surface':
        return {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        };
      default:
        return {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        };
    }
  };

  const cardColors = getCardColors();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: cardColors.backgroundColor,
          borderColor: cardColors.borderColor,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    // Subtle drop shadow for depth
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});
