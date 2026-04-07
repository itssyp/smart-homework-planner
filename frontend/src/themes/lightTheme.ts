import { createTheme } from '@mui/material';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#04aa6d', // Light mode primary color
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#000000', // Dark text for light theme
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
