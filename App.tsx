import './global.css';
import React from "react";
import { useThemeStore } from '@/store/themeStore';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import TodoListScreen from '@/screens/TodoListScreen';


export default function App() {
  // Get the current theme mode from the store
  const theme = useThemeStore((state) => state.mode);

  return (
    <GestureHandlerRootView style={{ flex: 1 }} >
      <SafeAreaProvider>
        <StatusBar style={theme==='dark'? 'light':'dark'} />
        <TodoListScreen />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
