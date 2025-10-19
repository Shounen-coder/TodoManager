import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTodoStore } from '../store/todoStore';
import { useThemeStore } from '../store/themeStore';
import { Todo, TodoFormData, SortOption, FilterOption } from '../types/todo.types';
import TodoItem from '../components/todo/TodoItem';
import TodoForm from '../components/todo/TodoForm';
import SearchBar from '../components/todo/SearchBar';
import EmptyState from '../components/todo/EmptyState';
import Button from '../components/common/Button';
import DraggableTodoItem from '../components/todo/DraggableTodoItem'; // New import
import { useDragList } from '../hooks/useDragList'; // New import
import { SORT_OPTIONS, FILTER_OPTIONS } from '../utils/constants';

// Estimated item height for drag calculations
const ITEM_HEIGHT = 140;

const TodoListScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const flashListRef = useRef<any>(null);

  // Theme
  const theme = useThemeStore((state) => state.mode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const isDark = theme === 'dark';

  // Todo Store
  const todos = useTodoStore((state) => state.todos);
  const searchQuery = useTodoStore((state) => state.searchQuery);
  const sortBy = useTodoStore((state) => state.sortBy);
  const filterBy = useTodoStore((state) => state.filterBy);
  const addTodo = useTodoStore((state) => state.addTodo);
  const updateTodo = useTodoStore((state) => state.updateTodo);
  const deleteTodo = useTodoStore((state) => state.deleteTodo);
  const toggleTodo = useTodoStore((state) => state.toggleTodo);
  const clearCompleted = useTodoStore((state) => state.clearCompleted);
  const setSortBy = useTodoStore((state) => state.setSortBy);
  const setFilterBy = useTodoStore((state) => state.setFilterBy);
  const reorderTodos = useTodoStore((state) => state.reorderTodos); //  New action for reordering

  // ✅ Drag list state
  const dragListState = useDragList(todos);

  // Determine if drag is enabled based on sort option
   const isDragEnabled = sortBy === 'manual';

  // Local State
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Computed Values
  const filteredTodos = useMemo(() => {
    let filtered = todos.filter((todo) => {
      const matchesSearch =
        todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        todo.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (filterBy === 'active') return matchesSearch && !todo.completed;
      if (filterBy === 'completed') return matchesSearch && todo.completed;
      return matchesSearch;
    });

    // Sorting using manual option
    if (sortBy === 'manual') {
      // Return as-is (preserves drag-drop order)
      return filtered; //no sorting applied
    }

//apply automatic sorting for other options
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'date':
          return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
        case 'status':
          return Number(a.completed) - Number(b.completed);
        default:
          return 0;
      }
    });

    return filtered;
  }, [todos, searchQuery, sortBy, filterBy]);

   // ✅ Sync positions when todos change
useEffect(() => {
  dragListState.updatePositions(filteredTodos);
}, [filteredTodos]);

  const stats = useMemo(() => {
    return {
      total: todos.length,
      completed: todos.filter((t) => t.completed).length,
      active: todos.filter((t) => !t.completed).length,
    };
  }, [todos]);

  const hasCompletedTodos = stats.completed > 0;

 

  const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
  reorderTodos(fromIndex, toIndex);
}, [reorderTodos]);

  /**
   * Handle Add Todo
   */
  const handleAddTodo = useCallback(() => {
    setEditingTodo(null);
    setIsFormVisible(true);
  }, []);

  /**
   * Handle Edit Todo
   */
  const handleEditTodo = useCallback((todo: Todo) => {
    setEditingTodo(todo);
    setIsFormVisible(true);
  }, []);

  /**
   * Handle Delete Todo
   */
  const handleDeleteTodo = useCallback(
    (id: string) => {
      deleteTodo(id);
    },
    [deleteTodo]
  );

  /**
   * Handle Toggle Todo
   */
  const handleToggleTodo = useCallback(
    (id: string) => {
      toggleTodo(id);
    },
    [toggleTodo]
  );

  /**
   * Handle Form Submit (Add or Edit)
   */
  const handleFormSubmit = useCallback(
    (data: TodoFormData) => {
      if (editingTodo) {
        updateTodo(editingTodo.id, data);
      } else {
        addTodo(data);
      }
    },
    [editingTodo, addTodo, updateTodo]
  );

  /**
   * Handle Clear Completed
   */
  const handleClearCompleted = useCallback(() => {
    Alert.alert(
      'Clear Completed',
      `Are you sure you want to delete ${stats.completed} completed todo(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => clearCompleted(),
        },
      ]
    );
  }, [clearCompleted, stats.completed]);

  /**
   * Handle Pull to Refresh
   */
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  /**
   * ✅ Render Todo Item with Drag Wrapper
   */
  const renderTodoItem = useCallback(
    ({ item, index }: { item: Todo; index: number }) => (
      <DraggableTodoItem
        item={item}
        index={index}
        data={filteredTodos}
        onReorder={handleReorder}
        itemHeight={ITEM_HEIGHT}
        isDragging={dragListState.isDragging}
        positions={dragListState.positions} 
        isDragEnabled={isDragEnabled} // Pass drag enabled prop
      >
        <TodoItem
          todo={item}
          onEdit={handleEditTodo}
          onDelete={handleDeleteTodo}
          onToggle={handleToggleTodo}
        />
      </DraggableTodoItem>
    ),
    [
      filteredTodos,
      handleReorder,
      handleEditTodo,
      handleDeleteTodo,
      handleToggleTodo,
      dragListState,
      isDragEnabled, // Include in dependencies
    ]
  );

  /**
   * Get Item Type for FlashList recycling
   */
  const getItemType = useCallback((item: Todo) => {
    return item.completed ? 'completed' : 'active';
  }, []);

  /**
   * Key Extractor
   */
  const keyExtractor = useCallback((item: Todo) => item.id, []);

  /**
   * Render Empty State
   */
  const renderEmptyState = useCallback(() => {
    if (filteredTodos.length === 0 && todos.length > 0) {
      return <EmptyState message="No todos match your search or filter" icon="search" />;
    }
    return <EmptyState />;
  }, [filteredTodos.length, todos.length]);

  return (
    <View
      className={`flex-1 ${isDark ? 'bg-bg-primary' : 'bg-bg-light-primary'}`}
      style={{ paddingTop: insets.top }}
    >
      {/* Header */}
      <View className="px-4 py-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text
              className={`text-3xl font-bold font-mono ${
                isDark ? 'text-text-primary' : 'text-text-light-primary'
              }`}
            >
              My Tasks
            </Text>
            <Text
              className={`mt-1 text-sm font-mono ${
                isDark ? 'text-text-secondary' : 'text-text-light-secondary'
              }`}
            >
              {stats.active} active · {stats.completed} completed
            </Text>
          </View>

          <TouchableOpacity
            onPress={toggleTheme}
            className={`rounded-full p-3 ${
              isDark ? 'bg-bg-secondary' : 'bg-bg-light-secondary'
            }`}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isDark ? 'sunny' : 'moon'}
              size={24}
              color={isDark ? '#e2b714' : '#d97706'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <SearchBar />

      {/* Filter & Sort Controls */}
      <View className="mx-4 mb-4 flex-row gap-3">
        {/* Filter Dropdown */}
        <View className="flex-1">
          <TouchableOpacity
            onPress={() => {
              setShowFilterMenu(!showFilterMenu);
              setShowSortMenu(false);
            }}
            className={`flex-row items-center justify-between rounded-lg border-2 border-text-secondary px-4 py-3 ${
              isDark ? 'bg-bg-secondary' : 'bg-bg-light-secondary'
            }`}
            activeOpacity={0.7}
          >
            <Text
              className={`text-sm font-mono ${
                isDark ? 'text-text-primary' : 'text-text-light-primary'
              }`}
            >
              {FILTER_OPTIONS.find((f) => f.value === filterBy)?.label}
            </Text>
            <Ionicons name="filter" size={18} color={isDark ? '#e2b714' : '#d97706'} />
          </TouchableOpacity>

          {showFilterMenu && (
            <View
              className={`absolute top-14 left-0 right-0 z-10 rounded-lg border-2 border-text-secondary ${
                isDark ? 'bg-bg-secondary' : 'bg-bg-light-secondary'
              }`}
            >
              {FILTER_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => {
                    setFilterBy(option.value as FilterOption);
                    setShowFilterMenu(false);
                  }}
                  className={`px-4 py-3 ${filterBy === option.value ? 'bg-accent/20' : ''}`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-sm font-mono ${
                      filterBy === option.value
                        ? 'text-accent font-semibold'
                        : isDark
                        ? 'text-text-primary'
                        : 'text-text-light-primary'
                    }`}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Sort Dropdown */}
        <View className="flex-1">
          <TouchableOpacity
            onPress={() => {
              setShowSortMenu(!showSortMenu);
              setShowFilterMenu(false);
            }}
            className={`flex-row items-center justify-between rounded-lg border-2 border-text-secondary px-4 py-3 ${
              isDark ? 'bg-bg-secondary' : 'bg-bg-light-secondary'
            }`}
            activeOpacity={0.7}
          >
            <Text
              className={`text-sm font-mono ${
                isDark ? 'text-text-primary' : 'text-text-light-primary'
              }`}
            >
              {SORT_OPTIONS.find((s) => s.value === sortBy)?.label}
            </Text>
            <Ionicons name="swap-vertical" size={18} color={isDark ? '#e2b714' : '#d97706'} />
          </TouchableOpacity>

          {showSortMenu && (
            <View
              className={`absolute top-14 left-0 right-0 z-10 rounded-lg border-2 border-text-secondary ${
                isDark ? 'bg-bg-secondary' : 'bg-bg-light-secondary'
              }`}
            >
              {SORT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => {
                    setSortBy(option.value as SortOption);
                    setShowSortMenu(false);
                    
                    setTimeout(() => {
                      flashListRef.current?.scrollToOffset({
                        offset: 0,
                        animated: true,
                      });
                    }, 100);
                  }}
                  className={`px-4 py-3 ${sortBy === option.value ? 'bg-accent/20' : ''}`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-sm font-mono ${
                      sortBy === option.value
                        ? 'text-accent font-semibold'
                        : isDark
                        ? 'text-text-primary'
                        : 'text-text-light-primary'
                    }`}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Clear Completed Button */}
      {hasCompletedTodos && (
        <View className="mx-4 mb-4">
          <Button
            title={`Clear ${stats.completed} Completed`}
            variant="danger"
            onPress={handleClearCompleted}
          />
        </View>
      )}

      
      {/* Todo List with FlashList */}
      <FlashList
        ref={flashListRef}
        data={filteredTodos}
        renderItem={renderTodoItem}
        keyExtractor={keyExtractor}
        getItemType={getItemType}
        // estimatedItemSize={ITEM_HEIGHT} // ✅ Important for drag calculations
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? '#e2b714' : '#d97706'}
          />
        }
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        onPress={handleAddTodo}
        className="absolute bottom-6 right-6 h-16 w-16 items-center justify-center rounded-full bg-accent shadow-lg"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="#323437" />
      </TouchableOpacity>

      {/* Todo Form Modal */}
      <TodoForm
        isVisible={isFormVisible}
        onClose={() => {
          setIsFormVisible(false);
          setEditingTodo(null);
        }}
        onSubmit={handleFormSubmit}
        editingTodo={editingTodo}
      />
    </View>
  );
};

export default TodoListScreen;
