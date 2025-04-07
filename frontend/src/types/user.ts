export interface User {
  id: string;
  _id: string; // MongoDB ID
  name: string;
  email: string;
  role: 'admin' | 'user';
  hasSetPassword: boolean;
  avatar?: string;
  avatarTimestamp?: number; // Timestamp for cache busting avatar images
  dateOfBirth?: string;
  gender?: string;
  phoneNumber?: string;
  phone?: string; // Alias for phoneNumber for backward compatibility
  address?: string;
  department?: string;
  studentId?: string;
}

export type UserRole = User['role'];