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

  // Accent
  primary: '#38BDF8',
  primaryDark: '#0EA5E9',

  // Semantic
  profit: '#10B981',
  loss: '#EF4444',

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
};

export const Fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};
