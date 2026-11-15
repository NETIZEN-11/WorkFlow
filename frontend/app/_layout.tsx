import { useEffect, useState } from 'react';
import { Stack, SplashScreen, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform } from 'react-native';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../src/store/authStore';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import * as Notifications from 'expo-notifications';

void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true,
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const { token } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setIsReady(true);
    });

    if (useAuthStore.persist.hasHydrated()) {
      setIsReady(true);
    }

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!token && !inAuthGroup) {
      router.replace('/(auth)');
    } else if (token && inAuthGroup) {
      router.replace('/(app)/(home)');
    }
  }, [token, segments, isReady]);

  useEffect(() => {
    if (!token) {
      queryClient.clear();
    }
  }, [token]);

  useEffect(() => {
    if (Platform.OS !== 'android' || __DEV__) return;

    void Notifications.setNotificationChannelAsync('default', {
      name: 'DailyFlow reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    }).catch((error) => {
      console.warn('Unable to configure the Android notification channel', error);
    });
  }, []);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(app)" />
          </Stack>
        </QueryClientProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
