import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, styled } from '@mui/material';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MuiAppBar, { type AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import ViewDayOutlinedIcon from '@mui/icons-material/ViewDayOutlined';
import { AuthContext } from '../authentication/AuthContext';

export const drawerWidth = 260;

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

export function DrawerList() {
  const { t } = useTranslation();
  const { auth } = useContext(AuthContext);
  const theme = useTheme();
  const location = useLocation();

  const menuItems: { text: string; icon: ReactNode; path: string }[] = [];

  if (auth.username) {
    menuItems.push(
      { text: t('planner.nav.dashboard'), icon: <DashboardRoundedIcon />, path: '/' },
      { text: t('planner.nav.tasks'), icon: <AssignmentTurnedInOutlinedIcon />, path: '/tasks' },
      { text: t('planner.nav.subjects'), icon: <MenuBookOutlinedIcon />, path: '/subjects' },
      { text: t('planner.nav.studyPlan'), icon: <ViewDayOutlinedIcon />, path: '/study-plan' },
    );
  }

  const pathActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname === path;

  return (
    <List sx={{ px: 1, pt: 1 }}>
      {menuItems.map((item) => {
        const active = pathActive(item.path);
        return (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={active}
              sx={{
                borderRadius: 2,
                py: 1.25,
                '&.Mui-selected': {
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  color: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.18),
                  },
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.main,
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: active ? 'primary.main' : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                slotProps={{
                  primary: {
                    sx: { fontWeight: active ? 700 : 500, fontSize: '0.9375rem' },
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
}

export const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }: { open: boolean }) => open,
      style: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: `${drawerWidth}px`,
        transition: theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}));

export const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));
