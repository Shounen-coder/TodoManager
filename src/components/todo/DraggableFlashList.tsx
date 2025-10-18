import React, { useState, useCallback, useRef } from 'react';
import { View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import DraggableTodoItem from './DraggableTodoItem';
import { Todo } from '../../types/todo.types';

interface DraggableFlashListProps {
  data: Todo[];
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  ListEmptyComponent: React.ReactElement;
  contentContainerStyle?: any;
}

const ITEM_HEIGHT = 140;

/**
 * DraggableFlashList - Fixed layout management
 * 
 * Fixes:
 * 1. Proper scroll preservation
 * 2. No layout breaks on sort/filter
 * 3. Stable key management
 */
const DraggableFlashList: React.FC<DraggableFlashListProps> = ({
  data,
  onEdit,
  onDelete,
  onToggle,
  onReorder,
  ListEmptyComponent,
  contentContainerStyle,
}) => {
  const flashListRef = useRef<any>(null);

  /**
   * Render draggable item
   */
  const renderItem = useCallback(
    ({ item, index }: { item: Todo; index: number }) => (
      <DraggableTodoItem
        todo={item}
        index={index}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggle={onToggle}
        onReorder={onReorder}
        itemHeight={ITEM_HEIGHT}
      />
    ),
    [onEdit, onDelete, onToggle, onReorder]
  );

  /**
   * ✅ CRITICAL: Stable key extractor
   */
  const keyExtractor = useCallback((item: Todo) => item.id, []);

  /**
   * ✅ CRITICAL: Item type for FlashList recycling
   */
  const getItemType = useCallback((item: Todo) => {
    return item.completed ? 'completed' : 'active';
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <FlashList
        ref={flashListRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemType={getItemType}
        // estimatedItemSize={ITEM_HEIGHT}
        contentContainerStyle={contentContainerStyle}
        ListEmptyComponent={ListEmptyComponent}
        // ✅ CRITICAL: Always enable scroll - gestures handle conflicts
        scrollEnabled={true}
        // ✅ CRITICAL: Remove clipped views to prevent layout issues
        removeClippedSubviews={false}
      />
    </View>
  );
};

export default React.memo(DraggableFlashList);
