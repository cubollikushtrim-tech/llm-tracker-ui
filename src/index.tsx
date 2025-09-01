import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0052cc',
      contrastText: '#fff',
    },
    secondary: {
      main: '#00b8d9',
      contrastText: '#fff',
    },
    background: {
      default: '#f4f6fb',
      paper: '#fff',
    },
    success: {
      main: '#36b37e',
    },
    error: {
      main: '#ff5630',
    },
    warning: {
      main: '#ffab00',
    },
    info: {
      main: '#00b8d9',
    },
    text: {
      primary: '#172b4d',
      secondary: '#6b778c',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, fontSize: '2.5rem', letterSpacing: '-1px' },
    h2: { fontWeight: 700, fontSize: '2rem', letterSpacing: '-1px' },
    h3: { fontWeight: 700, fontSize: '1.5rem' },
    h4: { fontWeight: 700, fontSize: '1.25rem' },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    body1: { fontSize: '1rem' },
    body2: { fontSize: '0.95rem' },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.5px' },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 24px rgba(0,82,204,0.08)',
          borderRadius: 16,
          transition: 'box-shadow 0.3s',
          '&:hover': {
            boxShadow: '0 8px 32px rgba(0,82,204,0.16)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          boxShadow: 'none',
          transition: 'background 0.2s',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: '1rem',
        },
        head: {
          fontWeight: 700,
          background: '#f4f6fb',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
