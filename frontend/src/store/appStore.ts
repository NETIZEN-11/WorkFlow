import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppStore {
  theme: 'light' | 'dark';
  notificationsEnabled: boolean;
  isLoading: boolean;
  setTheme: (theme: 'light' | 'dark') => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      theme: 'light',
      notificationsEnabled: true,
      isLoading: false,

      setTheme: (theme: 'light' | 'dark') => set({ theme }),
      setNotificationsEnabled: (enabled: boolean) => set({ notificationsEnabled: enabled }),
      setIsLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'app-settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ theme, notificationsEnabled }) => ({ theme, notificationsEnabled }),
    }
  )
);
