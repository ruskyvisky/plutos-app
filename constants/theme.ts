/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */


const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

/**
 * Finance app theme colors — 60-30-10 rule
 * 60%: background (Deep Navy)
 * 30%: card / surfaces (Slate)
 * 10%: primary accent (Sky Blue)
 */
export const FinanceTheme = {
  // Core palette
  background: '#0F172A',
  backgroundLight: '#162036',
  card: '#1E293B',
  cardBorder: '#334155',
  surface: '#334155',
  tabBar: '#1E293B',
  divider: '#334155',

  // Accent
  primary: '#38BDF8',
  primaryDark: '#0EA5E9',

  // Semantic
  profit: '#10B981',
  loss: '#EF4444',
  profitBg: 'rgba(16, 185, 129, 0.15)',
  lossBg: 'rgba(239, 68, 68, 0.15)',

  // Text
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',

  // Inputs
  inputBg: '#1E293B',
  inputBorder: '#334155',
  inputBorderFocus: '#38BDF8',
  inputPlaceholder: '#64748B',

  // Social buttons
  googleBg: '#FFFFFF',
  googleText: '#1F2937',
  appleBg: '#000000',
  appleText: '#FFFFFF',

  // Tab bar
  tabActive: '#38BDF8',
  tabInactive: '#64748B',
  tabBarBorder: '#1E293B',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.6)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 56,
};

export const Radii = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardLight: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bottomSheet: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 16,
  },
};

export const Fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

export const FontSizes = {
  h1: 32,
  h2: 24,
  h3: 20,
  body: 16,
  bodySmall: 14,
  caption: 12,
};
