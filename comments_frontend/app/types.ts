export interface User {
  id: number;
  username: string;
}

export interface Comment {
  id: number;
  text: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}
