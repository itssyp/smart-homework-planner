export interface AuthState {
  id?: string | null;
  username: string | null;
  theme: string;
  day_streak?: number;
}