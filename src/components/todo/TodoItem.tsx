import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import { Todo } from '../../types/todo.types';
import { useThemeStore } from '../../store/themeStore';
import { formatDateTime } from '../../utils/dateHelpers';

interface TodoItemProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}


// TodoItem Component
// Renders individual todo item with swipe-to-delete, edit, and toggle complete functionalities
// with Swipe-to-Delete
// Highly optimized with React.memo and proper memoization
 
const TodoItem: React.FC<TodoItemProps> = ({ todo, onEdit, onDelete, onToggle }) => {
  const theme = useThemeStore((state) => state.mode);
  const swipeableRef = useRef<React.ElementRef<typeof Swipeable> | null>(null);
  const isDark = theme === 'dark';

  // Render right swipe action (Delete button)
  const renderRightActions = (
    _progress: SharedValue<number>,
    drag: SharedValue<number>
  ) => {
    const styleAnimation = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: drag.value + 100 }],
      };
    });

    return (
      <Reanimated.View
        style={[styleAnimation]}
        className="flex-row items-center justify-end"
      >
        <TouchableOpacity
          onPress={handleDeletePress}
          className="h-full items-center justify-center bg-error px-8"
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </Reanimated.View>
    );
  };

 // Handle delete button press with confirmation alert
  const handleDeletePress = () => {
    Alert.alert(
      'Delete Todo',
      'Are you sure you want to delete this todo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            swipeableRef.current?.close();
            onDelete(todo.id);
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
    >
      <View
        className={`mx-4 mb-3 rounded-lg border-2 p-4 ${
          todo.completed ? 'border-success opacity-60' : 'border-text-secondary'
        } ${isDark ? 'bg-bg-secondary' : 'bg-bg-light-secondary'}`}
      >
        {/* Header: Checkbox + Title + Edit */}
        <View className="mb-2 flex-row items-start justify-between">
          <TouchableOpacity
            onPress={() => onToggle(todo.id)}
            className="mr-3 mt-1"
            activeOpacity={0.7}
          >
            <Ionicons
              name={todo.completed ? 'checkbox' : 'square-outline'}
              size={24}
              color={todo.completed ? '#47ca4b' : isDark ? '#646669' : '#9ca3af'}
            />
          </TouchableOpacity>

          <View className="flex-1">
            <Text
              className={`text-lg font-semibold font-mono ${
                todo.completed ? 'line-through' : ''
              } ${isDark ? 'text-text-primary' : 'text-text-light-primary'}`}
              numberOfLines={2}
            >
              {todo.title}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => onEdit(todo)}
            className="ml-2"
            activeOpacity={0.7}
          >
            <Ionicons
              name="create-outline"
              size={22}
              color={isDark ? '#e2b714' : '#d97706'}
            />
          </TouchableOpacity>
        </View>

        {/* Description */}
        {todo.description && (
          <Text
            className={`mb-3 text-sm font-mono ${
              isDark ? 'text-text-secondary' : 'text-text-light-secondary'
            }`}
            numberOfLines={3}
          >
            {todo.description}
          </Text>
        )}

        {/* Metadata: Date, Time, Location */}
        <View className="flex-row flex-wrap gap-2">
          {/* Date & Time */}
          <View className="flex-row items-center">
            <Ionicons
              name="calendar-outline"
              size={14}
              color={isDark ? '#646669' : '#9ca3af'}
            />
            <Text
              className={`ml-1 text-xs font-mono ${
                isDark ? 'text-text-secondary' : 'text-text-light-secondary'
              }`}
            >
              {formatDateTime(todo.dateTime)}
            </Text>
          </View>

          {/* Location */}
          {todo.location && (
            <View className="flex-row items-center">
              <Ionicons
                name="location-outline"
                size={14}
                color={isDark ? '#646669' : '#9ca3af'}
              />
              <Text
                className={`ml-1 text-xs font-mono ${
                  isDark ? 'text-text-secondary' : 'text-text-light-secondary'
                }`}
                numberOfLines={1}
              >
                {todo.location}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Swipeable>
  );
};


// Exporting memoized TodoItem to prevent unnecessary re-renders
// Only re-renders if id, updatedAt, or completed status changes
export default React.memo(
  TodoItem,
  (prevProps, nextProps) =>
    prevProps.todo.id === nextProps.todo.id &&
    prevProps.todo.updatedAt === nextProps.todo.updatedAt &&
    prevProps.todo.completed === nextProps.todo.completed
);
