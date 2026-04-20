import { createTheme } from '@mui/material';

export const classicTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#9c27b0', // Custom theme primary color
    },
    background: {
      default: '#e1f5fe',
      paper: '#ffffff',
    },
    text: {
      primary: '#000000',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          '&.MuiButton-outlined': {
            borderColor: 'inherit',
            '&:hover': {
              borderColor: 'inherit',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          '.MuiButton-outlined': {
            borderColor: 'white',
            color: 'white',
          },
          '.MuiButton-text': {
            color: 'white',
          },
        },
      },
    },
  },
});
