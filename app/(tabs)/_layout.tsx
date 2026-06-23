import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { FinanceTheme, Fonts } from '@/constants/theme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  // Android'de sistem navigation bar'ı (geri/home/recent butonları) varsa
  // bottom inset sıfır gelir ama extra padding gerekir.
  // Oppo A9 2020 gibi cihazlarda soft navigation buttons UI ile çakışıyor.
  const androidBottomPad = Platform.OS === 'android'
    ? Math.max(insets.bottom, 8)   // en az 8px, soft nav varsa daha fazla
    : 0;

  const tabBarHeight = Platform.OS === 'ios'
    ? 88
    : 56 + androidBottomPad;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: FinanceTheme.tabActive,
        tabBarInactiveTintColor: FinanceTheme.tabInactive,
        tabBarStyle: [
          styles.tabBar,
          {
            height: tabBarHeight,
            paddingBottom: Platform.OS === 'ios' ? 24 : androidBottomPad + 4,
          },
        ],
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Piyasa',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trending-up" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Keşfet',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: 'Portföy',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: 'Haberler',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="newspaper-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: FinanceTheme.tabBar,
    borderTopColor: FinanceTheme.tabBarBorder,
    borderTopWidth: 1,
    paddingTop: 6,
    elevation: 0,
  },
  tabLabel: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    marginTop: 1,
  },
  tabItem: {
    paddingTop: 4,
    paddingBottom: 2,
    minHeight: 44, // iOS HIG & Android Material minimum dokunma alanı
  },
});
