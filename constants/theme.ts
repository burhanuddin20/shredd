/**
 * Attack on Titan inspired military theme colors
 * Military green and black with accent colors
 */

import { Platform } from 'react-native';

const tintColorLight = '#2d5a27'; // Military green
const tintColorDark = '#4ade80'; // Bright military green

export const Colors = {
  light: {
    text: '#1a1a1a',
    background: '#f8fafc',
    tint: tintColorLight,
    icon: '#64748b',
    tabIconDefault: '#64748b',
    tabIconSelected: tintColorLight,
    // Attack on Titan theme colors
    primary: '#1e293b', // Dark slate
    secondary: '#2d5a27', // Military green
    accent: '#4ade80', // Bright green
    surface: '#ffffff',
    surfaceDark: '#f1f5f9',
    border: '#e2e8f0',
    danger: '#dc2626',
    warning: '#f59e0b',
    success: '#10b981',
    rankGold: '#fbbf24',
    rankSilver: '#94a3b8',
    rankBronze: '#cd7c2f',
  },
  dark: {
    text: '#f8fafc',
    background: '#0f172a',
    tint: tintColorDark,
    icon: '#94a3b8',
    tabIconDefault: '#94a3b8',
    tabIconSelected: tintColorDark,
    // Attack on Titan theme colors
    primary: '#020617', // Very dark blue
    secondary: '#1e293b', // Dark slate
    accent: '#4ade80', // Bright green
    surface: '#1e293b',
    surfaceDark: '#0f172a',
    border: '#334155',
    danger: '#ef4444',
    warning: '#fbbf24',
    success: '#22c55e',
    rankGold: '#fbbf24',
    rankSilver: '#94a3b8',
    rankBronze: '#cd7c2f',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** Military/Military-style fonts */
    military: 'Arial-BoldMT',
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    military: 'Arial',
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    military: "'Arial Black', 'Helvetica Neue', Arial, sans-serif",
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
