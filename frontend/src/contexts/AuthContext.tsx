import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';

interface User {
  _id: string;
  name: string;
  email: string;
  googleId?: string;
  avatar?: string;
}

interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    googleId?: string;
    avatar?: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  handleAuthCallback: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  handleAuthCallback: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleAuthCallback = async (token: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.handleGoogleCallback(token);
      if (response.user) {
        const userData: User = {
          _id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          googleId: response.user.googleId,
          avatar: response.user.avatar
        };
        setUser(userData);
      }
    } catch (error: any) {
      console.error('Auth callback error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to handle authentication callback';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('token');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        
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
            googleId: response.user.googleId,
            avatar: response.user.avatar
          };
          setUser(userData);
        }
      } catch (error: any) {
        console.error('Fetch user error:', error);
        const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to fetch user data';
        setError(errorMessage);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, handleAuthCallback, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 