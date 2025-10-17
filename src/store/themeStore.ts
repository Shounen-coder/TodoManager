import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme } from '../types/todo.types';

interface ThemeStore {
  mode: Theme;
  _hasHydrated: boolean;
  toggleTheme: () => void;
  setTheme: (mode: Theme) => void;
  setHasHydrated: (state: boolean) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: 'dark',
      _hasHydrated: false,

      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },

      toggleTheme: () => {
        set((state) => ({
          mode: state.mode === 'dark' ? 'light' : 'dark',
        }));
      },

      setTheme: (mode) => {
        set({ mode });
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
