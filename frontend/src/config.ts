// Environment variables
const isDevelopment = process.env.NODE_ENV === 'development';

// Base URLs
const PROD_API_URL = 'https://kampuskart.onrender.com/api';
const PROD_FRONTEND_URL = 'https://kampuskart.netlify.app';
const DEV_API_URL = 'http://localhost:5000/api';
const DEV_FRONTEND_URL = 'http://localhost:3000';

// Export URLs based on environment
export const API_URL = isDevelopment ? DEV_API_URL : PROD_API_URL;
export const FRONTEND_URL = isDevelopment ? DEV_FRONTEND_URL : PROD_FRONTEND_URL;

// Other configurations
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
export const DEFAULT_AVATAR = '/images/default-avatar.png';

// For debugging
if (isDevelopment) {
  console.log('Running in development mode');
  console.log('API URL:', API_URL);
  console.log('Frontend URL:', FRONTEND_URL);
} 