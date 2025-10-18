import React from 'react';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import TodoItem from './TodoItem';
import { Todo } from '../../types/todo.types';

interface DraggableTodoItemProps {
  todo: Todo;
  index: number;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  itemHeight: number;
}

/**
 * DraggableTodoItem - Fixed implementation
 * 
 * Fixes:
 * 1. Long press MUST complete before drag activates
 * 2. Reorder persists after release
 * 3. No interference with scroll
 */
const DraggableTodoItem: React.FC<DraggableTodoItemProps> = ({
  todo,
  index,
  onEdit,
  onDelete,
  onToggle,
  onReorder,
  itemHeight,
}) => {
  // Animation values
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const shadowOpacity = useSharedValue(0);
  
  // Drag state
  const isDragging = useSharedValue(false);
  const startIndex = useSharedValue(index);
  const currentIndex = useSharedValue(index);

  /**
   * CRITICAL FIX: Long press that BLOCKS scroll
   */
  const longPressGesture = Gesture.LongPress()
    .minDuration(700)
    .onStart(() => {
      'worklet';
      isDragging.value = true;
      startIndex.value = index;
      currentIndex.value = index;
      
      // Visual feedback
      scale.value = withSpring(1.05, { damping: 15, stiffness: 150 });
      shadowOpacity.value = withTiming(0.3, { duration: 200 });
    })
    .onFinalize(() => {
      'worklet';
      // Don't reset here - let pan handle it
    });

  /**
   * CRITICAL FIX: Pan only works AFTER long press completes
   */
  const panGesture = Gesture.Pan()
    .manualActivation(true)
    .onTouchesDown((event, state) => {
      'worklet';
      // ONLY activate pan if long press has activated drag mode
      if (isDragging.value) {
        state.activate();
      } else {
        state.fail(); // ✅ FAIL pan to allow scroll
      }
    })
    .onUpdate((event) => {
      'worklet';
      if (isDragging.value) {
        translateY.value = event.translationY;
        
        // Calculate target index
        const newY = index * itemHeight + translateY.value;
        const targetIndex = Math.round(newY / itemHeight);
        currentIndex.value = targetIndex;
      }
    })
    .onEnd(() => {
      'worklet';
      if (isDragging.value) {
        const finalIndex = currentIndex.value;
        
        // Reset visuals
        translateY.value = withTiming(0, { duration: 300 });
        scale.value = withTiming(1, { duration: 300 });
        shadowOpacity.value = withTiming(0, { duration: 200 });
        
        // ✅ CRITICAL: Execute reorder BEFORE resetting drag state
        if (finalIndex !== startIndex.value) {
          runOnJS(onReorder)(startIndex.value, finalIndex);
        }
        
        // Reset drag state
        isDragging.value = false;
      }
    });

  /**
   * ✅ CRITICAL: Race gesture (not Simultaneous)
   * Long press must WIN before pan can activate
   */
  const composedGesture = Gesture.Race(longPressGesture, panGesture);

  /**
   * Animated styles
   */
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      zIndex: isDragging.value ? 999 : 1,
      elevation: isDragging.value ? 8 : 0,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: shadowOpacity.value,
      shadowRadius: 12,
    };
  });

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <TodoItem
          todo={todo}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggle={onToggle}
        />
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 12,
  },
});

export default React.memo(DraggableTodoItem);
