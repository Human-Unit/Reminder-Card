// types/index.ts
export interface Entry {
  ID: number;
  UserID: number; // Или string, зависит от GORM/SQL
  Situation: string;
  Text: string;
  Colour: string;
  Icon: string;
  CreatedAt: string; // Дата с бэка
}

export interface UserResponse {
  username: string;
}