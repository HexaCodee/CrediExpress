// src/shared/store/authStore.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const REFRESH_TOKEN_KEY = 'crediexpress_refresh_token';

export const getRefreshToken = () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,

      login: async (accessToken, user, refreshToken) => {
        if (refreshToken) {
          await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
        }

        set({ token: accessToken, user, isAuthenticated: true });
      },

      logout: async () => {
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        set({ token: null, user: null, isAuthenticated: false });
      },

      setAccessToken: (token) => set({ token }),

      updateUser: (partialUser) =>
        set((state) => ({ user: { ...state.user, ...partialUser } })),

      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: 'crediexpress-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
