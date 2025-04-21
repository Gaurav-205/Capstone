// Environment configuration
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

// Base URLs from environment variables with fallbacks
const API_URL = isDevelopment ? 'http://localhost:5000/api' : 'https://kampuskart.onrender.com/api';
const FRONTEND_URL = isDevelopment ? 'http://localhost:3000' : 'https://kampuskart.netlify.app';
const BACKEND_URL = isDevelopment ? 'http://localhost:5000' : 'https://kampuskart.onrender.com';

// Export URLs
export { API_URL, FRONTEND_URL, BACKEND_URL };

// Other configurations
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
export const DEFAULT_AVATAR = '/images/default-avatar.png';

// Environment information
export const ENV_INFO = {
  isDevelopment,
  nodeEnv: process.env.NODE_ENV,
  apiUrl: API_URL,
  frontendUrl: FRONTEND_URL,
  backendUrl: BACKEND_URL
};

// Debug logging
console.log('Environment Information:', {
  mode: isDevelopment ? 'Development' : 'Production',
  apiUrl: API_URL,
  frontendUrl: FRONTEND_URL,
  backendUrl: BACKEND_URL
});