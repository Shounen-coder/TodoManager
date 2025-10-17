import React from 'react';
import { View, TextInput, Text, TextInputProps } from 'react-native';
import { useThemeStore } from '../../store/themeStore';


// Props for the Input component 
interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  required?: boolean;
}

// Reusable Input Component with label, error message, and theming support
const Input: React.FC<InputProps> = ({
  label,
  error,
  required = false,
  className,
  ...props
}) => {
  const theme = useThemeStore((state) => state.mode);
  const isDark = theme === 'dark';

  return (
    <View className="mb-4">
      <Text
        className={`mb-2 text-sm font-medium ${
          isDark ? 'text-text-primary' : 'text-text-light-primary'
        }`}
      >
        {label}
        {required && <Text className="text-error"> *</Text>}
      </Text>
      <TextInput
        className={`rounded-lg border-2 px-4 py-3 text-base font-mono ${
          error ? 'border-error' : 'border-text-secondary'
        } ${
          isDark
            ? 'bg-bg-secondary text-text-primary'
            : 'bg-bg-light-secondary text-text-light-primary'
        } ${className || ''}`}
        placeholderTextColor={isDark ? '#646669' : '#9ca3af'}
        {...props}
      />
      {error && <Text className="mt-1 text-sm text-error">{error}</Text>}
    </View>
  );
};

export default React.memo(Input);
