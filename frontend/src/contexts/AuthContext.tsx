import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';
import { User } from '../types/user';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  updateUserState: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const normalizeUser = (user: any): User => {
  const userId = user.id || user._id;
  return {
    id: userId,
    _id: userId,
    name: user.name,
    email: user.email,
    role: user.role || 'user',
    hasSetPassword: user.hasSetPassword || false,
    avatar: user.avatar,
    phoneNumber: user.phoneNumber || user.phone,
    phone: user.phone || user.phoneNumber,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    address: user.address,
    department: user.department,
    studentId: user.studentId,
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        // First check local storage
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedUser && storedToken) {
          // Set initial user state from storage
          const parsedUser = JSON.parse(storedUser);
          setUser(normalizeUser(parsedUser));

          // Verify token with server
          try {
            const response = await authService.getCurrentUser();
            if (response) {
              setUser(normalizeUser(response));
            } else {
              // If server returns no user, clear auth
              setUser(null);
              localStorage.removeItem('user');
              localStorage.removeItem('token');
            }
          } catch (error) {
            console.error('Failed to verify token:', error);
            // Clear auth on verification failure
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
        } else {
          // No stored credentials
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authService.login({ email, password });
      
      if (!response.success) {
        // If login was not successful, throw an error with the response details
        setLoading(false); // Immediately stop loading on error
        const error = new Error(response.message || 'Login failed');
        (error as any).response = { data: response };
        throw error;
      }
      
      const normalizedUser = normalizeUser(response.user);
      setUser(normalizedUser);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
    } catch (error) {
      console.error('Login failed:', error);
      setLoading(false); // Ensure loading is stopped on error
      throw error;
    } finally {
      // This ensures loading is always turned off eventually
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setLoading(false);
    }
  };

  const updateUserState = (userData: Partial<User>) => {
    if (!user) return;

    // If updating avatar, ensure we're using the latest version
    if (userData.avatar) {
      // Add timestamp to force cache refresh when stored in localStorage
      userData = {
        ...userData,
        avatarTimestamp: new Date().getTime()
      };
    }

    const updatedUser = normalizeUser({ ...user, ...userData });
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    updateUserState,
  };

  // Don't render children until initial auth check is complete
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};