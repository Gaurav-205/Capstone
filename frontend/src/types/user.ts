export interface User {
  id: string;
  _id: string; // For MongoDB compatibility
  email: string;
  name: string;
  role: 'admin' | 'user' | 'student';
  avatar?: string;
  profilePicture?: string;
  studentId?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
}

export type UserRole = User['role']; 