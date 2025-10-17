import { useEffect, useState } from 'react';
import { useTodoStore } from '../store/todoStore';
import { useThemeStore } from '../store/themeStore';

/**
 * Custom hook to check if stores have been hydrated
 * Prevents rendering before AsyncStorage data is loaded
 * 
 * This is CRITICAL for React Native + Zustand persistence
 * to avoid race conditions with AsyncStorage
 */
export const useHydration = () => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Check if both stores have hydrated
    const unsubTodo = useTodoStore.subscribe(
      (state) => {
        if (state._hasHydrated && useThemeStore.getState()._hasHydrated) {
          setHydrated(true);
        }
      }
    );

    const unsubTheme = useThemeStore.subscribe(
      (state) => {
        if (state._hasHydrated && useTodoStore.getState()._hasHydrated) {
          setHydrated(true);
        }
      }
    );

    // Check immediately in case already hydrated
    if (
      useTodoStore.getState()._hasHydrated &&
      useThemeStore.getState()._hasHydrated
    ) {
      setHydrated(true);
    }

    return () => {
      unsubTodo();
      unsubTheme();
    };
  }, []);

  return hydrated;
};
