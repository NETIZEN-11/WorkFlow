jest.mock('react-native', () => ({
  Platform: { OS: 'web' },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

const { useAuthStore } = require('./authStore');

describe('auth store', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  test('setting a user and token establishes an authenticated session', () => {
    const user = {
      id: 'user-1',
      email: 'user@example.com',
      firstName: 'Daily',
      lastName: 'Flow',
      timezone: 'UTC',
      theme: 'light',
      notificationsEnabled: true,
    };

    useAuthStore.getState().setUser(user);
    useAuthStore.getState().setToken('signed-token');

    expect(useAuthStore.getState()).toMatchObject({
      user,
      token: 'signed-token',
      isAuthenticated: true,
    });
  });

  test('theme changes preserve the rest of the user profile', () => {
    const user = {
      id: 'user-1',
      email: 'user@example.com',
      firstName: 'Daily',
      lastName: 'Flow',
      timezone: 'UTC',
      theme: 'light',
      notificationsEnabled: true,
    };
    useAuthStore.getState().setUser(user);

    useAuthStore.getState().setTheme('dark');

    expect(useAuthStore.getState()).toMatchObject({
      user: { ...user, theme: 'dark' },
      isAuthenticated: true,
    });
  });

  test('logout clears the complete authenticated session', () => {
    useAuthStore.getState().setToken('signed-token');
    useAuthStore.getState().logout();

    expect(useAuthStore.getState()).toMatchObject({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  });
});
