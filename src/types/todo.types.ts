// Each todo item structure
export interface Todo {
    id: string;
    title: string;
    description: string;
    dateTime: string;
    location: string;
    completed: boolean;
    createdAt: string;
    updatedAt: string;

}

// custom create Todo type without id, createdAt, updatedAt
export type TodoFormData = Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'completed'>;

// // custom update Todo type with optional fields
// export type UpdateTodo = Partial<Omit<Todo, 'id' | 'createdAt'>> & { id: string };


//custom sorting options type
export type SortOption = 'name' | 'date' | 'status';

// custom filter options type
export type FilterOption = 'all' | 'completed' | 'active';

//custom theme type
export type Theme = 'light' | 'dark';