import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';

interface User {
  _id: string;
  name: string;
  email: string;
  googleId?: string;
}

interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    googleId?: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await authService.getCurrentUser() as AuthResponse;
        if (response.user) {
          const userData: User = {
            _id: response.user.id,
            name: response.user.name,
            email: response.user.email,
            googleId: response.user.googleId
          };
          setUser(userData);
        }
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to fetch user data');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}; 