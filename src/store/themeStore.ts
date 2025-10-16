import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Theme} from '../types/todo.types';

interface ThemeStore {
    mode: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeStore>()(
    persist(
        (set) => ({
            mode: 'dark',
            toggleTheme: () => set((state) => ({mode: state.mode === 'dark' ? 'light' : 'dark'})),
            setTheme: (theme: Theme) => set({mode: theme}),
        }),
        {
            name: 'theme-storage',
            storage: createJSONStorage(() => AsyncStorage),
        },
    ),
)