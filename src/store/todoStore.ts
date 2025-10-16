import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Todo, SortOption, FilterOption } from '../types/todo.types';

/**
 * Todo Store Interface
 * Manages all todo-related state and operations
 */
interface TodoStore {
  // State
  todos: Todo[];
  searchQuery: string;
  sortBy: SortOption;
  filterBy: FilterOption;
  
  // Actions
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'completed'>) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
  toggleTodo: (id: string) => void;
  clearCompleted: () => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: SortOption) => void;
  setFilterBy: (filterBy: FilterOption) => void;
  
  // Computed getters
  getFilteredTodos: () => Todo[];
  getStats: () => { total: number; completed: number; active: number };
}

/**
 * Generate unique ID using timestamp and random string
 */
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Main Todo Store
 * Persists to AsyncStorage automatically
 */
export const useTodoStore = create<TodoStore>()(
  persist(
    (set, get) => ({
      // Initial State
      todos: [],
      searchQuery: '',
      sortBy: 'date',
      filterBy: 'all',

      // Add new todo
      addTodo: (todoData) => {
        const newTodo: Todo = {
          ...todoData,
          id: generateId(),
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          todos: [newTodo, ...state.todos],
        }));
      },

      // Update existing todo
      updateTodo: (id, updates) => {
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id
              ? { ...todo, ...updates, updatedAt: new Date().toISOString() }
              : todo
          ),
        }));
      },

      // Delete todo
      deleteTodo: (id) => {
        set((state) => ({
          todos: state.todos.filter((todo) => todo.id !== id),
        }));
      },

      // Toggle completion status
      toggleTodo: (id) => {
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id
              ? {
                  ...todo,
                  completed: !todo.completed,
                  updatedAt: new Date().toISOString(),
                }
              : todo
          ),
        }));
      },

      // Clear all completed todos
      clearCompleted: () => {
        set((state) => ({
          todos: state.todos.filter((todo) => !todo.completed),
        }));
      },

      // Set search query
      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },

      // Set sort option
      setSortBy: (sortBy) => {
        set({ sortBy });
      },

      // Set filter option
      setFilterBy: (filterBy) => {
        set({ filterBy });
      },

      // Get filtered and sorted todos
      getFilteredTodos: () => {
        const { todos, searchQuery, sortBy, filterBy } = get();
        
        // Filter by search query
        let filtered = todos.filter((todo) => {
          const matchesSearch =
            todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            todo.description.toLowerCase().includes(searchQuery.toLowerCase());
          
          // Filter by completion status
          if (filterBy === 'active') return matchesSearch && !todo.completed;
          if (filterBy === 'completed') return matchesSearch && todo.completed;
          return matchesSearch;
        });

        // Sort
        filtered = filtered.sort((a, b) => {
          switch (sortBy) {
            case 'name':
              return a.title.localeCompare(b.title);
            case 'date':
              return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
            case 'status':
              return Number(a.completed) - Number(b.completed);
            default:
              return 0;
          }
        });

        return filtered;
      },

      // Get statistics
      getStats: () => {
        const { todos } = get();
        return {
          total: todos.length,
          completed: todos.filter((t) => t.completed).length,
          active: todos.filter((t) => !t.completed).length,
        };
      },
    }),
    {
      name: 'todo-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
