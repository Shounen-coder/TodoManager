import { useSharedValue } from 'react-native-reanimated';
import { Todo } from '../types/todo.types';

/**
 * Custom hook for managing drag-to-reorder state
 * Provides shared values for coordinating all draggable items
 */
export const useDragList = (data: Todo[]) => {
  // Shared value: which item is currently being dragged (-1 = none)
  const isDragging = useSharedValue<number>(-1);

  // Shared value: current scroll position
  const scrollY = useSharedValue<number>(0);

  // Shared value: positions map for all items
  const positions = useSharedValue<{ [key: string]: number }>(
    data.reduce((acc, item, index) => {
      acc[item.id] = index;
      return acc;
    }, {} as { [key: string]: number })
  );

  return {
    isDragging,
    scrollY,
    positions,
  };
};
