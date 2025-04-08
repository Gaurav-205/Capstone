import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  Stack,
  Divider,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Google as GoogleIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { styled, keyframes } from '@mui/material/styles';

// Shake animation for error feedback
const shakeAnimation = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
`;

// Styled password field
const AnimatedTextField = styled(TextField)(({ theme, error }) => ({
  animation: error ? `${shakeAnimation} 0.5s` : 'none',
}));

const Login = () => {
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs for form inputs
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  
  // Clear redirects on mount
  useEffect(() => {
    if (window.location.search) {
      window.history.replaceState({}, document.title, '/login');
    }
  }, []);
  
  // Toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Handle Google login
  const handleGoogleLogin = () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      window.location.href = `${apiUrl}/auth/google`;
    } catch (error) {
      setError('Failed to initiate Google login');
    }
  };
  
  // Show error with animation
  const shakeElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.style.animation = 'none';
      setTimeout(() => {
        element.style.animation = `${shakeAnimation} 0.5s`;
      }, 10);
    }
  };
  
  // Handle login form submission
  const handleLogin = (e: React.MouseEvent) => {
    // Prevent any default actions and propagation
    e.preventDefault();
    e.stopPropagation();
    
    // Don't continue if already loading
    if (isLoading) return;
    
    // Get input values
    const email = emailRef.current?.value || '';
    const password = passwordRef.current?.value || '';
    
    // Clear previous errors
    setError('');
    setEmailError('');
    setPasswordError('');
    
    // Validation
    if (!email) {
      setEmailError('Email is required');
      shakeElement('email-container');
      return;
    }
    
    if (!password) {
      setPasswordError('Password is required');
      shakeElement('password-container');
      return;
    }
    
    // Set loading state
    setIsLoading(true);
    
    // Use the browser's fetch API directly
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    
    console.log('Attempting direct fetch login with:', email);
    
    // Make login request using fetch instead of axios
    fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    })
    .then(response => {
      // Check if response is not ok
      if (!response.ok) {
        return response.json().then(data => {
          throw { status: response.status, data };
        });
      }
      return response.json();
    })
    .then(data => {
      console.log('Login success:', data);
      
      // Store credentials
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Navigate to dashboard directly through window location
      const user = data.user;
      window.location.href = user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
    })
    .catch(err => {
      console.error('Login error:', err);
      setIsLoading(false);
      
      // Handle specific error status codes
      if (err.status === 401) {
        const errorData = err.data;
        
        if (errorData.errors?.email || errorData.message?.includes('No account')) {
          setEmailError(errorData.errors?.email || 'No account found with this email');
          shakeElement('email-container');
        } 
        else if (errorData.errors?.password || errorData.message?.includes('password')) {
          setPasswordError(errorData.errors?.password || 'Incorrect password');
          shakeElement('password-container');
        } 
        else {
          setError(errorData.message || 'Authentication failed');
        }
      } 
      else {
        setError('Login failed. Please try again later.');
      }
    });
  };
  
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        bgcolor: '#fff',
      }}
    >
      <Box
        sx={{
          width: '50%',
          display: { xs: 'none', md: 'block' },
          backgroundImage: 'url(/images/nature-leaves.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <Box
        sx={{
          width: '50%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 4, md: 8 },
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: '400px',
          }}
        >
          <Box sx={{ mb: 6, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.25)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(25, 118, 210, 0.3)',
                },
                overflow: 'hidden'
              }}
            >
              <Box
                component="img"
                src="/images/logo.png"
                alt="KampusKart Logo"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  p: 0.5
                }}
              />
            </Box>
            <Box>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '0.5px',
                  mb: 0.5
                }}
              >
                KampusKart
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'text.secondary',
                  display: 'block',
                  letterSpacing: '0.5px',
                  fontSize: '0.75rem',
                  fontWeight: 500
                }}
              >
                Your Toolkit for College
              </Typography>
            </Box>
          </Box>

          <Typography variant="h3" component="h1" gutterBottom sx={{ 
            fontWeight: 800, 
            letterSpacing: '0.5px',
            background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Welcome Back
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', maxWidth: 400 }}>
            A modern, vibrant web portal designed for MIT ADT students, faculty, and visitors.
          </Typography>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2, 
                animation: 'fadeIn 0.3s',
                '@keyframes fadeIn': {
                  '0%': { opacity: 0, transform: 'translateY(-10px)' },
                  '100%': { opacity: 1, transform: 'translateY(0)' }
                },
                display: 'flex',
                alignItems: 'center',
                borderLeft: '4px solid #f44336',
                bgcolor: 'rgba(244, 67, 54, 0.1)',
              }}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => setError('')}
                >
                  <Box component="span" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>×</Box>
                </IconButton>
              }
            >
              {error}
            </Alert>
          )}

          {/* Replace form with div */}
          <Box component="div" sx={{ mt: 1 }}>
            <Stack spacing={2.5}>
              <Box id="email-container">
                <TextField
                  fullWidth
                  id="email"
                  label="Email Address"
                  inputRef={emailRef}
                  autoComplete="email"
                  error={!!emailError}
                  helperText={emailError}
                  disabled={isLoading}
                  onChange={() => setEmailError('')}
                />
              </Box>
              
              <Box id="password-container">
                <AnimatedTextField
                  fullWidth
                  id="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  inputRef={passwordRef}
                  autoComplete="current-password"
                  error={!!passwordError}
                  helperText={passwordError}
                  disabled={isLoading}
                  onChange={() => setPasswordError('')}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Box>

              <Box sx={{ textAlign: 'right' }}>
                <Link
                  component={RouterLink}
                  to="/forgot-password"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  Forgot your password?
                </Link>
              </Box>

              <Button
                type="button" 
                onClick={handleLogin}
                variant="contained"
                disabled={isLoading}
                sx={{
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.25)',
                  position: 'relative',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 16px rgba(25, 118, 210, 0.3)',
                  },
                }}
              >
                {isLoading ? (
                  <>
                    <Box 
                      component="span" 
                      sx={{ 
                        display: 'inline-block',
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        border: '2px solid currentColor',
                        borderTopColor: 'transparent',
                        mr: 1,
                        animation: 'spin 1s linear infinite',
                        '@keyframes spin': {
                          '0%': { transform: 'rotate(0deg)' },
                          '100%': { transform: 'rotate(360deg)' }
                        }
                      }} 
                    />
                    Logging in...
                  </>
                ) : 'Login'}
              </Button>

              <Box sx={{ position: 'relative', my: 1 }}>
                <Divider>
                  <Typography variant="body2" sx={{ px: 2, color: 'text.secondary' }}>
                    or
                  </Typography>
                </Divider>
              </Box>

              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={handleGoogleLogin}
                startIcon={<GoogleIcon />}
                sx={{
                  py: 1.5,
                  color: 'text.primary',
                  borderColor: '#E0E0E0',
                  bgcolor: '#fff',
                  '&:hover': {
                    bgcolor: '#F8F9FA',
                    borderColor: '#E0E0E0',
                  }
                }}
              >
                Continue with Google
              </Button>
            </Stack>
          </Box>

          <Typography variant="body2" sx={{ mt: 4, textAlign: 'center', color: 'text.secondary' }}>
            Don't have an account?{' '}
            <Link
              component={RouterLink}
              to="/signup"
              sx={{
                color: '#4CAF50',
                textDecoration: 'none',
                fontWeight: 500,
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Sign up
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Login; 