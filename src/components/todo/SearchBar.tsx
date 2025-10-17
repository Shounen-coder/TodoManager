import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';
import { useTodoStore } from '../../store/todoStore';

//Search Bar Component
 //Real-time search with clear functionality
// Search Bar Component for filtering todos
// Includes clear button and theming support
const SearchBar: React.FC = () => {
  const theme = useThemeStore((state) => state.mode);
  const searchQuery = useTodoStore((state) => state.searchQuery);
  const setSearchQuery = useTodoStore((state) => state.setSearchQuery);

  const isDark = theme === 'dark';

  return (
    <View
      className={`mx-4 mb-4 flex-row items-center rounded-lg border-2 border-text-secondary px-4 ${
        isDark ? 'bg-bg-secondary' : 'bg-bg-light-secondary'
      }`}
    >
      <Ionicons
        name="search"
        size={20}
        color={isDark ? '#646669' : '#9ca3af'}
      />
      <TextInput
        className={`flex-1 py-3 px-3 text-base font-mono ${
          isDark ? 'text-text-primary' : 'text-text-light-primary'
        }`}
        placeholder="Search todos..."
        placeholderTextColor={isDark ? '#646669' : '#9ca3af'}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
          <Ionicons
            name="close-circle"
            size={20}
            color={isDark ? '#646669' : '#9ca3af'}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default React.memo(SearchBar);
