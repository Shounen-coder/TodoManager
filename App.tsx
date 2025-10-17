import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import TodoListScreen from './src/screens/TodoListScreen';
import { useThemeStore } from './src/store/themeStore';
import { useTodoStore } from './src/store/todoStore';

// Import global CSS
import './global.css';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const theme = useThemeStore((state) => state.mode);

  useEffect(() => {
    // Manually trigger rehydration
    const rehydrate = async () => {
      try {
        await useTodoStore.persist.rehydrate();
        await useThemeStore.persist.rehydrate();
        setIsReady(true);
      } catch (error) {
        console.error('Rehydration error:', error);
        setIsReady(true); // Still show app even if rehydration fails
      }
    };

    rehydrate();
  }, []);

  if (!isReady) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#323437' }}>
          <ActivityIndicator size="large" color="#e2b714" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        <TodoListScreen />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
