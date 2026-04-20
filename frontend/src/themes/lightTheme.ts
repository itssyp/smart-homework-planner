import { alpha, createTheme } from '@mui/material/styles';
import { studyeetAppBarDivider, studyeetShadowCard } from '../theme/studyeetTokens';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6C5DD3',
      light: '#A18BFF',
      dark: '#4E3FA8',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FF754C',
      light: '#FFA48E',
      dark: '#E04D2B',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#3FBC7A',
      light: '#E6F9EF',
    },
    warning: {
      main: '#FFBC57',
    },
    error: {
      main: '#FF6B6B',
    },
    info: {
      main: '#5B8CFF',
    },
    background: {
      default: '#F5F6FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1D29',
      secondary: '#6B7285',
    },
    divider: 'rgba(26, 29, 41, 0.08)',
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "DM Sans", system-ui, sans-serif',
    h4: { fontWeight: 800, letterSpacing: '-0.03em' },
    h5: { fontWeight: 700, letterSpacing: '-0.02em' },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          boxShadow: studyeetShadowCard,
          border: '1px solid',
          borderColor: alpha('#1A1D29', 0.06),
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 12,
          paddingInline: 20,
        },
        contained: {
          boxShadow: 'none',
          '&.MuiButton-colorPrimary:hover': {
            boxShadow: `0 8px 24px ${alpha('#6C5DD3', 0.35)}`,
          },
        },
        outlined: {
          borderColor: alpha('#1A1D29', 0.12),
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
        color: 'default',
      },
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: studyeetAppBarDivider,
        }),
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRight: `1px solid ${theme.palette.divider}`,
          backgroundImage: 'none',
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 999,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
        },
      },
    },
  },
});
