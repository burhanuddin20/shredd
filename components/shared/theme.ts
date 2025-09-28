import { Platform } from 'react-native';

// 🎨 Theme constants (military/AOT enhanced)
export const COLORS = {
  background: '#0B0C0C',
  textPrimary: '#D4C5A9', // warmer military beige
  textSecondary: '#6B705C', // military green
  buttonBg: '#556B2F', // deeper military green
  progressTrack: '#1A1A1A',
  progressFill: '#6B705C', // military green progress
  buttonText: '#F5F5DC', // cream button text
  border: '#2A2A2A',
  accent: '#B22222', // military red accent
  warning: '#DAA520', // military gold
  surface: '#111111', // card backgrounds
  // Achievement colors
  bronze: '#CD7F32', // Bronze
  silver: '#C0C0C0', // Silver
  gold: '#DAA520', // Gold
};

export const FONTS = {
  heading: Platform.OS === 'ios' ? 'Anton-Regular' : 'Anton_400Regular',
  monoBold: Platform.OS === 'ios' ? 'RobotoMono-Bold' : 'RobotoMono_Bold',
};

export const SIZES = {
  circle: 280, // larger ring
  stroke: 14, // thicker stroke
  buttonHeight: 56,
  buttonRadius: 8,
};
