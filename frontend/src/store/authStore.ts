import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const secureStorage = {
  getItem: async (name: string) => {
    const storedValue = await SecureStore.getItemAsync(name);
    if (storedValue) return storedValue;

    const legacyValue = await AsyncStorage.getItem(name);
    if (legacyValue) {
      await SecureStore.setItemAsync(name, legacyValue);
      await AsyncStorage.removeItem(name);
      await AsyncStorage.removeItem('auth-token');
    }

    return legacyValue;
  },
  setItem: (name: string, value: string) => SecureStore.setItemAsync(name, value),
  removeItem: (name: string) => SecureStore.deleteItemAsync(name),
};

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  timezone: string;
  theme: 'light' | 'dark';
  notificationsEnabled: boolean;
  createdAt?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setUser: (user: User) =>
        set({
          user,
          isAuthenticated: true,
        }),

      setToken: (token: string) =>
        set({
          token,
          isAuthenticated: true,
        }),

      setTheme: (theme: 'light' | 'dark') =>
        set((state) => ({
          user: state.user ? { ...state.user, theme } : null,
        })),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => Platform.OS === 'web' ? AsyncStorage : secureStorage),
    }
  )
);
