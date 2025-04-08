import React, { createContext, useContext, useState, useEffect } from 'react';
import authService, { AuthResponse } from '../services/auth.service';
import profileService from '../services/profileService';
import { User } from '../types/user';
import { getAvatarUrl } from '../utils/avatarUtils';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  updateUserState: (userData: Partial<User>) => void;
  handleGoogleCallback: (token: string) => Promise<void>;
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
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (user) {
      console.log('AuthContext: User state updated', {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        hasAvatar: !!user.avatar,
        avatarUrl: user.avatar ? getAvatarUrl(user.avatar) : 'none'
      });
    }
  }, [user]);

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
          setIsAuthenticated(true);

          // Verify token with server and get latest user data
          try {
            const response = await authService.getCurrentUser();
            if (response) {
              setUser(normalizeUser(response));
              setIsAuthenticated(true);
              
              // Immediately fetch complete profile data after auth check
              try {
                console.log('Fetching complete profile data on auth initialization...');
                const profileData = await profileService.refreshProfile();
                if (profileData) {
                  console.log('Profile data fetched on auth initialization:', profileData);
                  const updatedUser = normalizeUser({ ...response, ...profileData });
                  setUser(updatedUser);
                  localStorage.setItem('user', JSON.stringify(updatedUser));
                }
              } catch (profileError) {
                console.error('Failed to fetch complete profile on auth initialization:', profileError);
                // Continue with basic user data if profile fetch fails
              }
            } else {
              // If server returns no user, clear auth
              setUser(null);
              setIsAuthenticated(false);
              localStorage.removeItem('user');
              localStorage.removeItem('token');
            }
          } catch (error) {
            console.error('Failed to verify token:', error);
            // Clear auth on verification failure
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
        } else {
          // No stored credentials
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleGoogleCallback = async (token: string) => {
    try {
      setLoading(true);
      const response = await authService.handleGoogleCallback(token);
      if (response.success && response.user) {
        // Ensure we have a properly formatted user with a name
        const userWithName = {
          ...response.user,
          name: response.user.name || (response.user.email ? response.user.email.split('@')[0] : 'User')
        };
        
        // Log the user data we're setting
        console.log('Setting user data after Google login:', userWithName);
        
        const normalizedUser = normalizeUser(userWithName);
        
        // Force user name to display correctly
        if (!normalizedUser.name || normalizedUser.name.trim() === '') {
          console.log('Name is missing in normalized user, using fallback');
          if (normalizedUser.email) {
            normalizedUser.name = normalizedUser.email.split('@')[0]
              .charAt(0).toUpperCase() + normalizedUser.email.split('@')[0].slice(1)
              .replace(/[._]/g, ' ');
          } else {
            normalizedUser.name = 'User';
          }
        }
        
        console.log('Final normalized user:', normalizedUser);
        
        // Update state and localStorage
        setUser(normalizedUser);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        
        // Immediately fetch profile data
        try {
          console.log('Fetching profile data after Google login');
          const profileData = await profileService.refreshProfile();
          console.log('Profile data fetched after Google login:', profileData);
          
          // Ensure we keep the name if it's not provided in profile data
          const mergedData = {
            ...profileData,
            name: profileData.name || normalizedUser.name
          };
          
          console.log('Merged profile data:', mergedData);
          
          // Update user state with additional profile data
          updateUserState(mergedData);
          
          // Force a re-render by updating user state again to ensure UI reflects changes
          setTimeout(() => {
            const currentUser = localStorage.getItem('user');
            if (currentUser) {
              const parsedUser = JSON.parse(currentUser);
              console.log('Re-setting user from localStorage:', parsedUser);
              setUser(normalizeUser(parsedUser));
            }
          }, 100);
        } catch (profileError) {
          console.error('Failed to fetch profile after Google login:', profileError);
        }
      } else {
        throw new Error('Failed to get user data from Google callback');
      }
    } catch (error) {
      console.error('Google callback error:', error);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("AuthContext: Starting login process");
      const response = await authService.login({ email, password });
      
      // If login failed, throw error immediately
      if (!response.success) {
        console.log("AuthContext: Login failed", response);
        
        // Create an error object that mimics an axios error
        const error = new Error(response.message || 'Login failed');
        
        // Add response property to error object for consistent error handling
        Object.defineProperty(error, 'response', {
          value: { 
            status: 401, 
            data: { 
              message: response.message,
              errors: response.errors 
            } 
          },
          writable: false
        });
        
        // Don't continue with login flow
        throw error;
      }
      
      // Login successful, update state
      console.log("AuthContext: Login successful");
      const normalizedUser = normalizeUser(response.user);
      setUser(normalizedUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      
      // After login, try to get the full profile data
      try {
        const profileData = await profileService.refreshProfile();
        console.log('Profile data fetched after login:', profileData);
        
        // Update the user state with additional profile data
        if (profileData) {
          updateUserState(profileData);
        }
      } catch (profileError) {
        console.error('Failed to fetch profile after login:', profileError);
        // Continue anyway, as basic login was successful
      }
      
      return response;
    } catch (error: any) {
      console.error("AuthContext: Login error caught", error);
      
      // Make sure we're in a clean state
      setLoading(false);
      setError(error.message || 'An error occurred during login');
      
      // Re-throw to allow the Login component to handle it
      throw error;
    } finally {
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
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setLoading(false);
    }
  };

  const updateUserState = (userData: Partial<User>) => {
    if (!user) return;

    console.log('AuthContext: Updating user state with:', userData);
    const updatedUser = normalizeUser({ ...user, ...userData });
    
    // Log any avatar changes
    if (userData.avatar && userData.avatar !== user.avatar) {
      console.log('AuthContext: Avatar updated from', user.avatar, 'to', userData.avatar);
      console.log('AuthContext: New avatar URL:', getAvatarUrl(userData.avatar));
    }
    
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated,
    isAdmin: user?.role === 'admin',
    updateUserState,
    handleGoogleCallback,
  };

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