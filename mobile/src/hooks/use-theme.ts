/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAccessibility } from '@/context/accessibility-context';

export function useTheme() {
  try {
    const { activeTheme } = useAccessibility();
    if (activeTheme) return activeTheme;
  } catch {
    // Fallback if rendered outside AccessibilityProvider
  }

  const scheme = useColorScheme();
  const theme = scheme === 'unspecified' || !scheme ? 'light' : scheme;

  return Colors[theme as keyof typeof Colors] || Colors.light;
}

