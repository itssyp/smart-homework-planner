import { createTheme } from '@mui/material';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#04aa6d', // Dark mode primary color
    },
    background: {
      default: '#121212',
      paper: '#1c1c1c',
    },
    text: {
      primary: '#ffffff', // White text for dark theme
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
