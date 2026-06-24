import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';

import { ChatFAB } from '@/components/ui/ChatFAB';
import { FinanceTheme } from '@/constants/theme';
import { CurrencyProvider } from '@/contexts/CurrencyContext';

SplashScreen.preventAutoHideAsync();

// Plutos Dark tema — React Navigation'a uyumlu
const PlutosDark = {
  ...DarkTheme,
  dark: true as const,
  colors: {
    ...DarkTheme.colors,
    primary: FinanceTheme.primary,
    background: FinanceTheme.background,
    card: FinanceTheme.tabBar,
    text: FinanceTheme.text,
    border: FinanceTheme.divider,
    notification: FinanceTheme.primary,
  },
};

export const unstable_settings = {
  initialRouteName: 'login',
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <CurrencyProvider>
      <ThemeProvider value={PlutosDark}>
        <View style={{ flex: 1 }}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
              animationDuration: 250,
              contentStyle: { backgroundColor: FinanceTheme.background },
            }}
          >
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="stock/[symbol]"
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="chat"
              options={{
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="list/[id]"
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <ChatFAB />
        </View>
        <StatusBar style="light" />
      </ThemeProvider>
    </CurrencyProvider>
  );
}
