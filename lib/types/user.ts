export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
  created_at: string;
  updated_at: string;
}

export interface UserInput {
  first_name: string;
  last_name: string;
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
}

export interface UserListResponse {
  items: User[];
  total: number;
}