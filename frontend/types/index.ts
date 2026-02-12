// types/index.ts
export interface User {
  ID: number;        // Must be ID (uppercase)
  name: string;      // Must be name (lowercase)
  email: string;
  role?: string;
  CreatedAt: string; // Required by BaseItem
}

export interface Entry {
  ID: number;
  situation: string;
  text: string;
  colour: string;
  icon: string;
  CreatedAt: string;
  user_id?: number;
}
export interface UserResponse {
  username: string;
}

export type TableItem = User | Entry;