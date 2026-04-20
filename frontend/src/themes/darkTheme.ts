import { alpha, createTheme } from '@mui/material/styles';
import { studyeetAppBarDivider, studyeetShadowCard } from '../theme/studyeetTokens';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#9D8BF7',
      light: '#C4B8FF',
      dark: '#6C5DD3',
      contrastText: '#0F1117',
    },
    secondary: {
      main: '#FF8F6B',
      light: '#FFB59E',
      dark: '#E05A32',
      contrastText: '#0F1117',
    },
    background: {
      default: '#0F1117',
      paper: '#171923',
    },
    text: {
      primary: '#F3F4F8',
      secondary: '#9AA0B3',
    },
    divider: 'rgba(243, 244, 248, 0.08)',
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "DM Sans", system-ui, sans-serif',
    h4: { fontWeight: 800, letterSpacing: '-0.03em' },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          boxShadow: studyeetShadowCard,
          border: '1px solid',
          borderColor: alpha('#F3F4F8', 0.08),
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 12, paddingInline: 20 },
        contained: {
          boxShadow: 'none',
          '&.MuiButton-colorPrimary:hover': {
            boxShadow: `0 8px 24px ${alpha('#9D8BF7', 0.35)}`,
          },
        },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'default' },
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
        root: { fontWeight: 600, borderRadius: 999 },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 20 },
      },
    },
  },
});
