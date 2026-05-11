export type AcademicLevel = 'HS' | 'BSc' | 'MSc';

export type UserProfile = {
  id: string;
  username: string;
  email: string;
  day_streak: number;
  academic_level: AcademicLevel | null;
  degree: string | null;
  specialization: string | null;
  gender: string | null;
};

export type UpdateUserProfileInput = {
  username: string;
  email: string;
  academic_level: AcademicLevel | null;
  degree: string | null;
  specialization: string | null;
  gender: string | null;
};

export type ChangePasswordInput = {
  current_password: string;
  new_password: string;
};
