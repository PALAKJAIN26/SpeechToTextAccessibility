/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#111827',
    background: '#ffffff',
    backgroundElement: '#f3f4f6',
    backgroundSelected: '#e5e7eb',
    textSecondary: '#4b5563',
    primary: '#2563eb',
    primaryText: '#ffffff',
    border: '#d1d5db',
    card: '#f9fafb',
  },
  dark: {
    text: '#f9fafb',
    background: '#0f172a',
    backgroundElement: '#1e293b',
    backgroundSelected: '#334155',
    textSecondary: '#94a3b8',
    primary: '#3b82f6',
    primaryText: '#ffffff',
    border: '#334155',
    card: '#1e293b',
  },
  highContrastDark: {
    text: '#ffff00',
    background: '#000000',
    backgroundElement: '#121212',
    backgroundSelected: '#333333',
    textSecondary: '#ffffff',
    primary: '#00ffff',
    primaryText: '#000000',
    border: '#ffff00',
    card: '#000000',
  },
  highContrastLight: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#ffffff',
    backgroundSelected: '#000000',
    textSecondary: '#000000',
    primary: '#0000cc',
    primaryText: '#ffffff',
    border: '#000000',
    card: '#ffffff',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
