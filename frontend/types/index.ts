// types/index.ts
interface User {
  ID: number;        // Must be ID (uppercase)
  name: string;      // Must be name (lowercase)
  email: string;
  role?: string;
  CreatedAt: string; // Required by BaseItem
}

interface Entry {
  ID: number;
  Situation: string; // Must match EntryItem casing
  Text: string;
  Colour: string;
  Icon: string;
  CreatedAt: string;
}
export interface UserResponse {
  username: string;
}