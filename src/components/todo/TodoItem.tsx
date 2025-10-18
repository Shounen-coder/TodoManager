import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Todo } from '../../types/todo.types';
import { useThemeStore } from '../../store/themeStore';
import { formatDateTime } from '../../utils/dateHelpers';

interface TodoItemProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const TRANSLATE_X_THRESHOLD = -SCREEN_WIDTH * 0.3; // 30% - Show alert
const MAX_TRANSLATE_X = -SCREEN_WIDTH * 0.7; // 70% - Maximum swipe (clamped)

/**
 * TodoItem Component with Perfect Gmail-Style Swipe-to-Delete
 * 
 * Features:
 * - Smooth swipe gesture with visible delete icon
 * - Clamped swipe distance (can't swipe past 70%)
 * - Smooth deceleration on cancel (no spring bounce)
 * - Automatic alert on release after threshold
 * - No interference with vertical scroll
 * - Reanimated v3/v4 optimized
 */
const TodoItem: React.FC<TodoItemProps> = ({ todo, onEdit, onDelete, onToggle }) => {
  const theme = useThemeStore((state) => state.mode);
  const isDark = theme === 'dark';

  // Shared values for animation
  const translateX = useSharedValue(0);
  const itemHeight = useSharedValue(1);
  const opacity = useSharedValue(1);

  /**
   * Clamp function to limit swipe distance
   */
  const clamp = (value: number, min: number, max: number) => {
    'worklet';
    return Math.min(Math.max(value, min), max);
  };

  /**
   * Show delete confirmation
   */
  const showDeleteConfirmation = useCallback(() => {
    Alert.alert(
      'Delete Todo',
      'Are you sure you want to delete this todo?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            // ✅ Smooth deceleration back (no spring bounce)
            translateX.value = withTiming(0, {
              duration: 250,
            });
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Animate out before deleting
            opacity.value = withTiming(0, { duration: 200 });
            itemHeight.value = withTiming(0, { duration: 250 }, () => {
              runOnJS(onDelete)(todo.id);
            });
          },
        },
      ],
      { cancelable: true }
    );
  }, [todo.id, onDelete, translateX, opacity, itemHeight]);

  /**
   * Pan Gesture Handler with clamping and smooth animations
   */
  const panGesture = Gesture.Pan()
    // ✅ Only activate for horizontal swipes (prevents scroll interference)
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10])
    // ✅ Smooth gesture handling with clamping
    .onUpdate((event) => {
      // Only allow left swipe and clamp to maximum distance
      if (event.translationX < 0) {
        // ✅ Clamp the swipe to prevent unlimited swiping
        translateX.value = clamp(event.translationX, MAX_TRANSLATE_X, 0);
      } else {
        translateX.value = 0;
      }
    })
    // ✅ On release: check threshold and trigger action
    .onEnd(() => {
      const shouldShowAlert = translateX.value < TRANSLATE_X_THRESHOLD;

      if (shouldShowAlert) {
        // Keep at swiped position and show alert
        runOnJS(showDeleteConfirmation)();
      } else {
        // ✅ Smooth deceleration back to original position (no spring)
        translateX.value = withTiming(0, {
          duration: 250,
        });
      }
    });

  /**
   * Animated style for the swipeable container
   */
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  /**
   * Animated style for the delete background
   * Progressive red color as swipe increases
   */
  const deleteBackgroundStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [MAX_TRANSLATE_X, TRANSLATE_X_THRESHOLD, 0],
      [1, 0.9, 0],
      Extrapolation.CLAMP
    );

    return {
      opacity,
    };
  });

  /**
   * Animated style for container (for delete animation)
   */
  const containerStyle = useAnimatedStyle(() => {
    return {
      height: itemHeight.value === 1 ? undefined : itemHeight.value,
      opacity: opacity.value,
      marginBottom: itemHeight.value === 1 ? 12 : 0,
    };
  });

  /**
   * Animated style for delete icon and text
   * Scale up as swipe progresses
   */
  const deleteIconStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      translateX.value,
      [MAX_TRANSLATE_X, TRANSLATE_X_THRESHOLD, 0],
      [1.2, 1, 0.7],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }],
    };
  });

  return (
    <Animated.View style={[{ marginHorizontal: 16 }, containerStyle]}>
      {/* Delete Background (reveals on swipe) */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: SCREEN_WIDTH,
            justifyContent: 'center',
            alignItems: 'flex-end',
            paddingRight: 32,
            borderRadius: 12,
            backgroundColor: '#ca4754', // Solid red background
          },
          deleteBackgroundStyle,
        ]}
      >
        {/* ✅ Delete Icon and Text - Always visible when swiping */}
        <Animated.View
          style={[
            {
              alignItems: 'center',
              justifyContent: 'center',
            },
            deleteIconStyle,
          ]}
        >
          <Ionicons name="trash-outline" size={32} color="#fff" />
          <Text
            style={{
              color: '#fff',
              fontSize: 14,
              fontWeight: '600',
              marginTop: 4,
              fontFamily: 'monospace',
            }}
          >
            Delete
          </Text>
        </Animated.View>
      </Animated.View>

      {/* Swipeable Todo Item */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            {
              borderRadius: 12,
              borderWidth: 2,
              padding: 16,
              borderColor: todo.completed ? '#47ca4b' : isDark ? '#646669' : '#9ca3af',
              backgroundColor: isDark ? '#2c2e31' : '#d5d5d5',
              opacity: todo.completed ? 0.6 : 1,
            },
            animatedStyle,
          ]}
        >
          {/* Header: Checkbox + Title + Edit */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
            <TouchableOpacity
              onPress={() => onToggle(todo.id)}
              style={{ marginRight: 12, marginTop: 4 }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={todo.completed ? 'checkbox' : 'square-outline'}
                size={24}
                color={todo.completed ? '#47ca4b' : isDark ? '#646669' : '#9ca3af'}
              />
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  fontFamily: 'monospace',
                  textDecorationLine: todo.completed ? 'line-through' : 'none',
                  color: isDark ? '#d1d0c5' : '#323437',
                }}
                numberOfLines={2}
              >
                {todo.title}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => onEdit(todo)}
              style={{ marginLeft: 8 }}
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
              style={{
                fontSize: 14,
                fontFamily: 'monospace',
                color: isDark ? '#646669' : '#6b7280',
                marginBottom: 12,
              }}
              numberOfLines={3}
            >
              {todo.description}
            </Text>
          )}

          {/* Metadata: Date, Time, Location */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {/* Date & Time */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color={isDark ? '#646669' : '#9ca3af'}
              />
              <Text
                style={{
                  marginLeft: 4,
                  fontSize: 12,
                  fontFamily: 'monospace',
                  color: isDark ? '#646669' : '#6b7280',
                }}
              >
                {formatDateTime(todo.dateTime)}
              </Text>
            </View>

            {/* Location */}
            {todo.location && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons
                  name="location-outline"
                  size={14}
                  color={isDark ? '#646669' : '#9ca3af'}
                />
                <Text
                  style={{
                    marginLeft: 4,
                    fontSize: 12,
                    fontFamily: 'monospace',
                    color: isDark ? '#646669' : '#6b7280',
                  }}
                  numberOfLines={1}
                >
                  {todo.location}
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
};

/**
 * Memoization with custom comparison
 * Only re-render if todo data actually changes
 */
export default React.memo(
  TodoItem,
  (prevProps, nextProps) =>
    prevProps.todo.id === nextProps.todo.id &&
    prevProps.todo.updatedAt === nextProps.todo.updatedAt &&
    prevProps.todo.completed === nextProps.todo.completed
);
