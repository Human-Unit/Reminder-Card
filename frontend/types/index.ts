// types/index.ts
export interface Entry {
  id: number;
  userId: number;
  situation: string;
  text: string;
  colour: string;
  icon: string;
  createdAt: string;
}
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}
export interface UserResponse {
  username: string;
}