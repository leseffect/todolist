export type UserRole = 'teacher' | 'student';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  userId: string; // ID of the student who owns this todo
  studentName?: string; // Cache the name for teacher dashboard
  createdAt: number; // millisecond timestamp
}
