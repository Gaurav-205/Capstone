import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  IconButton,
  InputAdornment,
  Link,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff, ArrowBack } from '@mui/icons-material';
import authService from '../services/auth.service';

const steps = ['Enter Email', 'Enter OTP', 'Reset Password'];

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpExpiry, setOtpExpiry] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [otpResendDisabled, setOtpResendDisabled] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle form navigation
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError(null);
  };

  // Handle password visibility toggle
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Start countdown timer
  const startCountdown = (seconds: number) => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setCountdown(seconds);
    setOtpResendDisabled(true);
    
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setOtpResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Format countdown time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Clean up timer on component unmount
  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Handle email submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (!email) {
        setError('Email is required');
        setLoading(false);
        return;
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }
      
      const response = await authService.requestPasswordReset(email);
      
      if (response.success) {
        setSuccess(response.message);
        
        // Check for development mode OTP
        if (response.devModeOtp) {
          setOtp(response.devModeOtp);
          console.log('DEV MODE: Auto-filled OTP from server:', response.devModeOtp);
        }
        
        if (response.expiresIn) {
          setOtpExpiry(response.expiresIn);
          startCountdown(response.expiresIn);
        } else {
          startCountdown(600); // Default to 10 minutes
        }
        handleNext();
      } else {
        if (response.errors?.email) {
          setError(response.errors.email);
        } else {
          setError(response.message || 'Failed to send OTP. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('Failed to request password reset:', error);
      // Check if it's a network error
      if (error.message?.includes('Network Error')) {
        setError('Cannot connect to the server. Please check your internet connection and try again.');
      } else {
        setError(error.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP resend
  const handleResendOTP = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await authService.requestPasswordReset(email);
      
      if (response.success) {
        setSuccess('OTP resent successfully. Please check your email.');
        if (response.expiresIn) {
          setOtpExpiry(response.expiresIn);
          startCountdown(response.expiresIn);
        } else {
          startCountdown(600); // Default to 10 minutes
        }
      } else {
        setError(response.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification and password reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Validate password
      if (!newPassword) {
        setError('New password is required');
        setLoading(false);
        return;
      }
      
      if (newPassword.length < 8) {
        setError('Password must be at least 8 characters long');
        setLoading(false);
        return;
      }
      
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      
      const response = await authService.verifyOTPAndResetPassword(
        email,
        otp,
        newPassword
      );
      
      if (response.success) {
        setSuccess('Password reset successful!');
        // Auto redirect to dashboard after successful reset
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        if (response.attemptsLeft) {
          setAttemptsLeft(response.attemptsLeft);
          setError(`${response.message} You have ${response.attemptsLeft} attempts left.`);
        } else {
          setError(response.message || 'Failed to reset password. Please try again.');
        }
      }
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        bgcolor: '#f5f5f5'
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: '100%',
          maxWidth: 500,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 3
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {activeStep > 0 && (
            <IconButton onClick={handleBack} sx={{ mr: 2 }}>
              <ArrowBack />
            </IconButton>
          )}
          <Typography variant="h5" fontWeight="bold">
            Reset Your Password
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {activeStep === 0 && (
          <Box component="form" onSubmit={handleEmailSubmit} noValidate>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Enter your email address and we'll send a one-time password (OTP) to reset your password.
            </Typography>
            
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoFocus
              InputProps={{
                autoComplete: 'email',
              }}
            />
            
            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, mb: 2, height: 48 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Send OTP'}
            </Button>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Link component={RouterLink} to="/login" variant="body2">
                Back to Login
              </Link>
            </Box>
          </Box>
        )}

        {activeStep === 1 && (
          <Box component="form" noValidate>
            <Typography variant="body1" sx={{ mb: 2 }}>
              We've sent a 6-digit OTP to {email}. 
              Please enter it below to continue.
            </Typography>
            
            <TextField
              fullWidth
              label="One-Time Password (OTP)"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').substring(0, 6))}
              margin="normal"
              required
              autoFocus
              inputProps={{ 
                maxLength: 6,
                inputMode: 'numeric',
                pattern: '[0-9]*'
              }}
            />
            
            {countdown > 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                OTP expires in {formatTime(countdown)}
              </Typography>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button
                variant="text"
                disabled={otpResendDisabled}
                onClick={handleResendOTP}
              >
                {otpResendDisabled ? `Resend OTP in ${formatTime(countdown)}` : 'Resend OTP'}
              </Button>
              
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={otp.length !== 6}
              >
                Continue
              </Button>
            </Box>
          </Box>
        )}

        {activeStep === 2 && (
          <Box component="form" onSubmit={handleResetPassword} noValidate>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Create a new password for your account
            </Typography>
            
            <TextField
              fullWidth
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={togglePasswordVisibility} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              fullWidth
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={toggleConfirmPasswordVisibility} edge="end">
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            {attemptsLeft !== null && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                Attempts left: {attemptsLeft}
              </Typography>
            )}
            
            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, mb: 2, height: 48 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Reset Password'}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ForgotPassword; 