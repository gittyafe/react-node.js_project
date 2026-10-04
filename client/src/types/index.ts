export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  _id?: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export type ExamDifficulty = 'easy' | 'medium' | 'hard';

export interface Exam {
  id?: string;
  _id?: string;
  title: string;
  subject?: string;
  difficulty?: ExamDifficulty;
  description?: string;
  duration: number;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Question {
  id?: string;
  _id?: string;
  examId: string;
  questionText: string;
  options: string[];
  correctAnswer?: string;
  points: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Result {
  id?: string;
  _id?: string;
  studentId: string;
  examId: string;
  score: number;
  submittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  updateProfile: (updates: { fullName?: string; email?: string; password?: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAuthReady: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role?: string;
}
