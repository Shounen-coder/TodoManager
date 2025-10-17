import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';

interface EmptyStateProps {
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

//Empty State Component
 // Shown when todo list is empty
// Empty State Component for displaying when there are no todos
// Includes theming support
const EmptyState: React.FC<EmptyStateProps> = ({
  message = 'No todos yet. Start by adding one!',
  icon = 'checkmark-done-circle-outline',
}) => {
  const theme = useThemeStore((state) => state.mode);
  const isDark = theme === 'dark';

  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <Ionicons
        name={icon}
        size={80}
        color={isDark ? '#646669' : '#9ca3af'}
      />
      <Text
        className={`mt-4 text-center text-lg font-mono ${
          isDark ? 'text-text-secondary' : 'text-text-light-secondary'
        }`}
      >
        {message}
      </Text>
    </View>
  );
};

export default React.memo(EmptyState);
