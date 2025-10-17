import React, { useState, useCallback, useMemo } from 'react';
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
import { SORT_OPTIONS, FILTER_OPTIONS } from '../utils/constants';

/**
 * Main TodoList Screen
 * Implements all core features:
 * - FlashList with performance optimization
 * - Search, Sort, Filter
 * - Dark/Light mode toggle
 * - Add/Edit/Delete todos
 * - Swipe-to-delete (in TodoItem)
 * - Clear completed
 */
const TodoListScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  // Theme
  const theme = useThemeStore((state) => state.mode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const isDark = theme === 'dark';

  // Todo Store
  const todos = useTodoStore((state) => state.todos);
  const addTodo = useTodoStore((state) => state.addTodo);
  const updateTodo = useTodoStore((state) => state.updateTodo);
  const deleteTodo = useTodoStore((state) => state.deleteTodo);
  const toggleTodo = useTodoStore((state) => state.toggleTodo);
  const clearCompleted = useTodoStore((state) => state.clearCompleted);
  const sortBy = useTodoStore((state) => state.sortBy);
  const filterBy = useTodoStore((state) => state.filterBy);
  const setSortBy = useTodoStore((state) => state.setSortBy);
  const setFilterBy = useTodoStore((state) => state.setFilterBy);
  const getFilteredTodos = useTodoStore((state) => state.getFilteredTodos);
  const getStats = useTodoStore((state) => state.getStats);

  // Local State
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Computed Values
  const filteredTodos = useMemo(() => getFilteredTodos(), [getFilteredTodos]);
  const stats = useMemo(() => getStats(), [getStats]);
  const hasCompletedTodos = stats.completed > 0;

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
        // Update existing todo
        updateTodo(editingTodo.id, data);
      } else {
        // Add new todo
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
    // Simulate refresh delay (in real app, you'd fetch from API)
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  /**
   * Render Todo Item
   * Memoized with useCallback for FlashList performance
   */
  const renderTodoItem = useCallback(
    ({ item }: { item: Todo }) => (
      <TodoItem
        todo={item}
        onEdit={handleEditTodo}
        onDelete={handleDeleteTodo}
        onToggle={handleToggleTodo}
      />
    ),
    [handleEditTodo, handleDeleteTodo, handleToggleTodo]
  );

  /**
   * Get Item Type for FlashList recycling optimization
   */
  const getItemType = useCallback((item: Todo) => {
    return item.completed ? 'completed' : 'active';
  }, []);

  /**
   * Key Extractor for FlashList
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
          {/* Title */}
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

          {/* Theme Toggle */}
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
            onPress={() => setShowFilterMenu(!showFilterMenu)}
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
            <Ionicons
              name="filter"
              size={18}
              color={isDark ? '#e2b714' : '#d97706'}
            />
          </TouchableOpacity>

          {/* Filter Menu */}
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
                  className={`px-4 py-3 ${
                    filterBy === option.value ? 'bg-accent/20' : ''
                  }`}
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
            onPress={() => setShowSortMenu(!showSortMenu)}
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
            <Ionicons
              name="swap-vertical"
              size={18}
              color={isDark ? '#e2b714' : '#d97706'}
            />
          </TouchableOpacity>

          {/* Sort Menu */}
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
                  }}
                  className={`px-4 py-3 ${
                    sortBy === option.value ? 'bg-accent/20' : ''
                  }`}
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
        data={filteredTodos}
        renderItem={renderTodoItem}
        keyExtractor={keyExtractor}
        getItemType={getItemType}
        // estimatedItemSize={120}
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
