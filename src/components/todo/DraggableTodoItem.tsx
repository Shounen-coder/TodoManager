import React from 'react';
import { Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    SharedValue,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Todo } from '../../types/todo.types';

interface DraggableTodoItemProps {
  item: Todo;
  index: number;
  data: Todo[];
  onReorder: (fromIndex: number, toIndex: number) => void;
  children: React.ReactNode;
  itemHeight: number;
  isDragEnabled: boolean;
  positions: SharedValue<{ [key: string]: number }>;
  isDragging: SharedValue<number>;
}

const LONG_PRESS_DURATION = 400;
const LIFT_SCALE = 1.05;

const SMOOTH_TIMING_CONFIG = {
  duration: 200,
  easing: Easing.inOut(Easing.ease),
};

/**
 * DraggableTodoItem - Smooth scroll-following drag
 * No auto-scroll, naturally follows finger like scrolling
 */
const DraggableTodoItem: React.FC<DraggableTodoItemProps> = ({
  item,
  index,
  data,
  onReorder,
  children,
  itemHeight,
  isDragEnabled,
  positions,
  isDragging,
}) => {
  const offsetY = useSharedValue(0);
  const isLifted = useSharedValue(false);
  const touchStartTime = useSharedValue(0);
  const dragStartIndex = useSharedValue(index);

  /**
   * Calculate target index from absolute offset
   */
  const getNewIndex = (totalOffset: number) => {
    'worklet';
    const itemTop = dragStartIndex.value * itemHeight;
    const currentPosition = itemTop + totalOffset;
    const newIndex = Math.round(currentPosition / itemHeight);
    return Math.max(0, Math.min(data.length - 1, newIndex));
  };

  /**
   * Update all item positions
   */
  const updatePositions = (draggedIndex: number, targetIndex: number) => {
    'worklet';
    
    if (draggedIndex === targetIndex) return;

    const newPositions = { ...positions.value };
    const draggedItemId = data[draggedIndex]?.id;
    
    if (!draggedItemId) return;

    // Get current order
    const orderedIds = Object.keys(newPositions).sort(
      (a, b) => newPositions[a] - newPositions[b]
    );

    // Remove dragged item
    const draggedId = orderedIds[draggedIndex];
    orderedIds.splice(draggedIndex, 1);
    
    // Insert at new position
    orderedIds.splice(targetIndex, 0, draggedId);

    // Update positions
    orderedIds.forEach((id, idx) => {
      newPositions[id] = idx;
    });

    positions.value = newPositions;
  };

  /**
   * Long press + Pan gesture
   */
  const dragGesture = Gesture.Pan()
    .manualActivation(true)
    .enabled(isDragEnabled)
    .onTouchesDown(() => {
      if (!isDragEnabled) return;
      touchStartTime.value = Date.now();
    })
    .onTouchesMove((event, state) => {
      if (!isDragEnabled) return;
      
      const elapsed = Date.now() - touchStartTime.value;
      const dy = Math.abs(event.changedTouches[0].y - event.allTouches[0].y);

      if (elapsed > LONG_PRESS_DURATION && dy < 10) {
        state.activate();
      } 
      else if (Math.abs(event.changedTouches[0].x - event.allTouches[0].x) > 10) {
        state.fail();
      }
      else if (elapsed < LONG_PRESS_DURATION && dy > 10) {
        state.fail();
      }
    })
    .onStart(() => {
      isDragging.value = index;
      isLifted.value = true;
      dragStartIndex.value = positions.value[item.id] || index;
    })
    .onUpdate((event) => {
      // Update offset directly from gesture translation
      offsetY.value = event.translationY;

      // Calculate new index
      const currentIndex = positions.value[item.id] || index;
      const newIndex = getNewIndex(event.translationY);

      // Update positions if changed
      if (newIndex !== currentIndex) {
        updatePositions(currentIndex, newIndex);
      }
    })
    .onEnd(() => {
      // ✅ Get final position and commit immediately (no snap-back)
      const finalIndex = positions.value[item.id] || index;
      // ✅ Calculate final offset to stay in place
      const finalOffset = (finalIndex - index) * itemHeight;
      
      // ✅ Move directly to final position (no intermediate animation)
      offsetY.value = finalOffset;
      
      // Stop lift effect
      isLifted.value = false;
      isDragging.value = -1;

      

      // Trigger reorder
        runOnJS(onReorder)(index, finalIndex);

      // Reset offset after a frame (list has reordered)
      setTimeout(() => {
        offsetY.value = 0;
      }, 50);
    });

  /**
   * Animated style
   */
  const animatedStyle = useAnimatedStyle(() => {
    // This item is being dragged
    if (isDragging.value === index) {
      return {
        transform: [
          { translateY: offsetY.value },
          { scale: withTiming(isLifted.value ? LIFT_SCALE : 1, { duration: 150 }) },
        ],
        zIndex: 999,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      };
    }

    // Another item is being dragged - shift this one
    if (isDragging.value !== -1 && positions.value[item.id] !== undefined) {
      const currentPosition = positions.value[item.id];
      const translateY = (currentPosition - index) * itemHeight;

      return {
        transform: [
          { translateY: withTiming(translateY, SMOOTH_TIMING_CONFIG) },
        ],
        zIndex: 1,
      };
    }

    // Normal state
    return {
      transform: [{ translateY: 0 }],
      zIndex: 1,
    };
  });

  return (
    <GestureDetector gesture={dragGesture}>
      <Animated.View style={[animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
};

export default React.memo(DraggableTodoItem);
