import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

interface MilitaryButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const MilitaryButton: React.FC<MilitaryButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const getButtonColors = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.accent,
          textColor: colors.beige,
        };
      case 'secondary':
        return {
          backgroundColor: colors.accentSecondary,
          textColor: colors.beige,
        };
      case 'danger':
        return {
          backgroundColor: colors.danger,
          textColor: colors.beige,
        };
      case 'success':
        return {
          backgroundColor: colors.success,
          textColor: colors.beige,
        };
      default:
        return {
          backgroundColor: colors.accent,
          textColor: colors.beige,
        };
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: 16,
          paddingVertical: 8,
          fontSize: 14,
        };
      case 'large':
        return {
          paddingHorizontal: 32,
          paddingVertical: 16,
          fontSize: 18,
        };
      default:
        return {
          paddingHorizontal: 24,
          paddingVertical: 12,
          fontSize: 16,
        };
    }
  };

  const buttonColors = getButtonColors();
  const buttonSize = getButtonSize();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: disabled ? colors.border : buttonColors.backgroundColor,
          paddingHorizontal: buttonSize.paddingHorizontal,
          paddingVertical: buttonSize.paddingVertical,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.buttonText,
          {
            color: disabled ? colors.icon : buttonColors.textColor,
            fontSize: buttonSize.fontSize,
            fontFamily: 'military',
          },
          textStyle,
        ]}
      >
        {title.toUpperCase()}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    // Subtle shadow for depth
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontWeight: 'bold',
    letterSpacing: 1,
    textAlign: 'center',
  },
});
