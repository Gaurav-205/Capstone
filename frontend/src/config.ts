// Environment configuration
const isDevelopment = process.env.NODE_ENV === 'development';

// Base URLs with environment variable overrides
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

// Environment information
export const ENV_INFO = {
  isDevelopment,
  nodeEnv: process.env.NODE_ENV,
  apiUrl: API_URL,
  frontendUrl: FRONTEND_URL
};

// Debug logging
if (isDevelopment || process.env.VITE_DEBUG === 'true') {
  console.log('Environment Information:', {
    mode: isDevelopment ? 'Development' : 'Production',
    nodeEnv: process.env.NODE_ENV,
    apiUrl: API_URL,
    frontendUrl: FRONTEND_URL,
    debug: process.env.VITE_DEBUG
  });
}