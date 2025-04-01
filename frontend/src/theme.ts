import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2D1B69', // deep-purple-500
      light: '#4527A0', // deep-purple-300
      dark: '#1A0F3D', // deep-purple-700
    },
    secondary: {
      main: '#673AB7', // royal-purple-500
      light: '#8E58E8', // royal-purple-300
      dark: '#482880', // royal-purple-700
    },
    error: {
      main: '#FF1493', // hot-pink-500
      light: '#FF69B4', // hot-pink-300
      dark: '#C71585', // hot-pink-700
    },
    warning: {
      main: '#FF7F50', // coral-orange-500
      light: '#FFA07A', // coral-orange-300
      dark: '#FF6347', // coral-orange-700
    },
    success: {
      main: '#DAA520', // goldenrod-500
      light: '#F0E68C', // goldenrod-300
      dark: '#B8860B', // goldenrod-700
    },
  },
  typography: {
    fontFamily: '"Work Sans", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
          },
        },
      },
    },
  },
});

export default theme; 