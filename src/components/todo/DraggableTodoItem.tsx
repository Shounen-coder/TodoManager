import React, { useCallback } from 'react';
import { StyleSheet, Platform, View, Dimensions } from 'react-native';
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
  scrollY: SharedValue<number>;
  isDragging:SharedValue<number>;
  positions: SharedValue<{ [key: string]: number }>;
  isDragEnabled: boolean;

}

const LONG_PRESS_DURATION = 400;
const LIFT_SCALE = 1.05;
const SHADOW_ELEVATION = 8;



const SMOOTH_TIMING_CONFIG = {
  duration: 200,
  easing: Easing.inOut(Easing.ease),
};

const DraggableTodoItem: React.FC<DraggableTodoItemProps> = ({
  item,
  index,
  data,
  onReorder,
  children,
  itemHeight,
  scrollY,
  isDragging,
  positions,
  isDragEnabled,
}) => {
  const offsetY = useSharedValue(0);
  const isLifted = useSharedValue(false);
  const touchStartTime = useSharedValue(0);
  const touchStartY = useSharedValue(0);

  /**
   * Calculate target position based on drag location
   */
  const getNewIndex = (translationY: number) => {
    'worklet';
    const currentTop = index * itemHeight + translationY;
    const newIndex = Math.round(currentTop / itemHeight);
    return Math.max(0, Math.min(data.length - 1, newIndex));
  };

  /**
   * Update positions map for all items
   */
  const updatePositions = (fromIndex: number, toIndex: number) => {
    'worklet';
    const newPositions = { ...positions.value };
    
    const orderedItems = Object.keys(newPositions).sort(
      (a, b) => newPositions[a] - newPositions[b]
    );

    const movedItemId = orderedItems[fromIndex];
    orderedItems.splice(fromIndex, 1);
    orderedItems.splice(toIndex, 0, movedItemId);

    orderedItems.forEach((id, idx) => {
      newPositions[id] = idx;
    });

    positions.value = newPositions;
  };

  /**
   * Long Press + Pan Gesture with auto-scroll support
   */
  const dragGesture = Gesture.Pan()
    .manualActivation(true)
    .enabled(isDragEnabled)
    .onTouchesDown((event) => {
      if (!isDragEnabled) return;
      touchStartTime.value = Date.now();
      touchStartY.value = event.changedTouches[0].absoluteY;
    })
    .onTouchesMove((event, state) => {
      if (!isDragEnabled) return;
      
      const elapsed = Date.now() - touchStartTime.value;
      const dy = Math.abs(event.changedTouches[0].absoluteY - touchStartY.value);

      if (elapsed > LONG_PRESS_DURATION && dy < 10) {
        state.activate();
      } 
      else if (Math.abs(event.changedTouches[0].absoluteX - event.allTouches[0].absoluteX) > 10) {
        state.fail();
      }
      else if (elapsed < LONG_PRESS_DURATION && dy > 10) {
        state.fail();
      }
    })
    .onStart(() => {
      isDragging.value = index;
      isLifted.value = true;
    })
    .onUpdate((event) => {
      offsetY.value = event.translationY;

      const newIndex = getNewIndex(event.translationY);

      if (newIndex !== positions.value[item.id]) {
        updatePositions(positions.value[item.id], newIndex);
      }
    })
    .onEnd(() => {
      const finalIndex = positions.value[item.id];
      
      
    //   offsetY.value = withTiming(
    //     (finalIndex - index) * itemHeight,
    //     SMOOTH_TIMING_CONFIG
    //   );
    offsetY.value = (finalIndex - index) * itemHeight;

      if (finalIndex !== index) {
        runOnJS(onReorder)(index, finalIndex);
      }
      
      
        offsetY.value = 0;
    });

  /**
   * Animated style for the draggable wrapper
   */
  const animatedStyle = useAnimatedStyle(() => {
    // if this item is being dragged
    if (isDragging.value === index) {
      return {
        transform: [
          { translateY: offsetY.value },
          { scale: withTiming(isLifted.value ? LIFT_SCALE : 1, { duration: 150 }) },
        ],
        zIndex: isLifted.value ? 999 : 1,
        elevation: isLifted.value ? SHADOW_ELEVATION : 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isLifted.value ? 0.3 : 0,
        shadowRadius: isLifted.value ? 8 : 0,
      };
    }

    if (isDragging.value !== -1 && positions.value[item.id] !== undefined) {
      const targetPosition = positions.value[item.id];
    //   const translateY = (targetPosition - index) * itemHeight;
    // Only animate if position actually changed
      if (targetPosition !== index) {
        const translateY = (targetPosition - index) * itemHeight;

        return {
         transform: [
          {
            translateY: withTiming(translateY, SMOOTH_TIMING_CONFIG),
          },
        ],
        zIndex: 1,
      };
    }
}

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
