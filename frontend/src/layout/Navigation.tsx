import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import { Avatar, Badge, Button, IconButton, Popover, Tooltip } from '@mui/material';
import { Link } from 'react-router-dom';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { useThemeContext } from '../hooks/useThemeContext';
import { AppBar, DrawerHeader, DrawerList, drawerWidth } from './NavigationHelper';
import NavigationMenuItem from './NavigationMenuItem';
import { AuthContext } from '../authentication/AuthContext';
import { useMarkNotificationsReadMutation, useNotificationsQuery } from '../query/planner.query';
import { dayjs } from '../utils/dayjsSetup';
import type { PlannerNotification } from '../types/planner.types';

interface Props {
  children: React.ReactNode;
}

function Navigation({ children }: Props) {
  const theme = useTheme();
  const { theme: themeName, setTheme } = useThemeContext();
  const { auth, logout } = useContext(AuthContext);
  const notificationsQuery = useNotificationsQuery();
  const markNotificationsRead = useMarkNotificationsReadMutation();
  const [openedNotifications, setOpenedNotifications] = useState<PlannerNotification[]>([]);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState<boolean>(() => {
    const savedDrawerState = localStorage.getItem('drawerOpen');
    return savedDrawerState ? JSON.parse(savedDrawerState) : false;
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { t } = useTranslation();
  const notificationsOpen = Boolean(notificationsAnchorEl);
  const unreadNotifications = notificationsQuery.data ?? [];
  const notificationCount = unreadNotifications.length;
  const displayedNotifications = notificationsOpen ? openedNotifications : unreadNotifications;

  const handleDrawerOpen = () => {
    setOpen(true);
    localStorage.setItem('drawerOpen', JSON.stringify(true)); // Save state to localStorage
  };

  const handleDrawerClose = () => {
    setOpen(false);
    localStorage.setItem('drawerOpen', JSON.stringify(false)); // Save state to localStorage
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const handleBellButtonClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchorEl((prev) => {
      const next = prev ? null : event.currentTarget;
      if (!prev) {
        const currentUnread = notificationsQuery.data ?? [];
        setOpenedNotifications(currentUnread);
        if (currentUnread.length > 0 && !markNotificationsRead.isPending) {
          markNotificationsRead.mutate();
        }
      } else {
        setOpenedNotifications([]);
      }
      return next;
    });
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          {auth.username && (
            <IconButton
              color="inherit"
              aria-label={t('layout.openDrawer')}
              onClick={handleDrawerOpen}
              edge="start"
              sx={{
                marginRight: 2,
                ...(open && { display: 'none' }),
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            {t('app.name')}
          </Typography>
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
            {auth.username ? (
              <>
                <Tooltip title={themeName === 'dark' ? t('layout.toggleThemeLight') : t('layout.toggleThemeDark')}>
                  <IconButton
                    color="inherit"
                    onClick={() => setTheme(themeName === 'dark' ? 'light' : 'dark')}
                    aria-label={themeName === 'dark' ? t('layout.toggleThemeLight') : t('layout.toggleThemeDark')}
                  >
                    {themeName === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('planner.session.notifications')}>
                  <IconButton color="inherit" onClick={handleBellButtonClick} aria-label={t('planner.session.notifications')}>
                    <Badge color="secondary" badgeContent={notificationCount} invisible={notificationCount === 0}>
                      <NotificationsNoneOutlinedIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
                <IconButton onClick={handleMenuOpen} sx={{ p: 0.5 }}>
                  <Avatar
                    alt={auth.username ?? ''}
                    src={undefined}
                    sx={(theme) => ({
                      width: 42,
                      height: 42,
                      fontWeight: 800,
                      fontSize: '1rem',
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      color: theme.palette.primary.contrastText,
                      border: `2px solid ${theme.palette.background.paper}`,
                      boxShadow: '0 4px 14px rgba(108, 93, 211, 0.35)',
                    })}
                  >
                    {auth.username?.charAt(0).toUpperCase() ?? '?'}
                  </Avatar>
                </IconButton>
                <NavigationMenuItem
                  username={auth.username}
                  anchorEl={anchorEl}
                  handleMenuClose={handleMenuClose}
                  handleLogout={handleLogout}
                />
              </>
            ) : (
              <>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <Button variant="text" color="primary">
                    {t('auth.login')}
                  </Button>
                </Link>
                <Link to="/signup" style={{ textDecoration: 'none' }}>
                  <Button variant="contained" color="primary">
                    {t('auth.signup')}
                  </Button>
                </Link>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <DrawerList />
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: open ? `${drawerWidth}px` : 0 },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar />
        {children}
      </Box>
      <Popover
        open={notificationsOpen}
        anchorEl={notificationsAnchorEl}
        onClose={() => {
          setNotificationsAnchorEl(null);
          setOpenedNotifications([]);
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ width: 380, maxWidth: '92vw', p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
            {t('planner.notifications.title')}
          </Typography>
          {displayedNotifications.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {t('planner.notifications.empty')}
            </Typography>
          ) : (
            <List sx={{ p: 0 }}>
              {displayedNotifications.map((item) => (
                <ListItem key={item.id} sx={{ px: 0, py: 0.75, display: 'block' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {t('planner.notifications.itemTitle')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                    {dayjs(item.created_at).format('MMM D, HH:mm')}
                  </Typography>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </Box>
  );
}

export default Navigation;
