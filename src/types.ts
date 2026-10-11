export type TaskStatus = 'pending' | 'completed';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  hasSpecificTime: boolean;
  startTime: string; // HH:mm e.g. "09:00"
  endTime: string; // HH:mm e.g. "10:00"
  category?: string; // e.g. "Trabalho", "Saúde", "Pessoal", "Estudos"
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
}

export type ThemeMode = 'light' | 'dark';

export interface UserPreferences {
  theme: ThemeMode;
  startHour: number; // e.g. 6 (06:00) or 0
  endHour: number; // e.g. 23 (23:00)
  autoScrollToCurrentTime: boolean;
}

export type ActiveTab = 'agenda' | 'foco' | 'respirar' | 'relogio' | 'calendario' | 'ajustes';
