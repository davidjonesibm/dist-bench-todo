export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  created: string;
  updated: string;
}

export interface CreateTodoDto {
  title: string;
}

export interface UpdateTodoDto {
  title?: string;
  completed?: boolean;
}

export type TodoFilter = 'all' | 'active' | 'completed';
