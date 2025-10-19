import { useSharedValue } from 'react-native-reanimated';
import { Todo } from '../types/todo.types';

/**
 * Custom hook for managing drag-to-reorder state
 */
export const useDragList = (data: Todo[]) => {
  const isDragging = useSharedValue<number>(-1);

  const positions = useSharedValue<{ [key: string]: number }>(
    data.reduce((acc, item, index) => {
      acc[item.id] = index;
      return acc;
    }, {} as { [key: string]: number })
  );

  // ✅ Update positions when data changes
  const updatePositions = (newData: Todo[]) => {
    positions.value = newData.reduce((acc, item, index) => {
      acc[item.id] = index;
      return acc;
    }, {} as { [key: string]: number });
  };

  return {
    isDragging,
    positions,

    updatePositions,
  };
};