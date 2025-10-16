
// src/utils/constants.ts

// Define sorting and filtering options constants for the todo list
export const SORT_OPTIONS = [
  { label: 'Date', value: 'date' as const },
  { label: 'Name', value: 'name' as const },
  { label: 'Status', value: 'status' as const },
];

export const FILTER_OPTIONS = [
  { label: 'All', value: 'all' as const },
  { label: 'Active', value: 'active' as const },
  { label: 'Completed', value: 'completed' as const },
];

export const ANIMATIONS = {
  SWIPE_THRESHOLD: -100,
  SWIPE_VELOCITY: 500,
  SPRING_CONFIG: {
    damping: 20,
    stiffness: 200,
  },
};
