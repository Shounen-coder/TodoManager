// Each todo item structure
export interface Todo {
    id: string;
    title: string;
    description: string;
    dateTime: Date;
    location: string;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;

}

// custom create Todo type without id, createdAt, updatedAt
export type CreateTodo = Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>;

// custom update Todo type with optional fields
export type UpdateTodo = Partial<Omit<Todo, 'id' | 'createdAt'>> & { id: string };


//custom sorting options type
export type SortOption = 'name' | 'date' | 'status';

//custom theme type
export type Theme = 'light' | 'dark';