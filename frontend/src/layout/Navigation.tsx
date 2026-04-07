import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Button, Avatar } from '@mui/material';
import { Link } from 'react-router-dom';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppBar, DrawerHeader, DrawerList, drawerWidth } from './NavigationHelper';
import NavigationMenuItem from './NavigationMenuItem';
import { AuthContext } from '../authentication/AuthContext';

interface Props {
  children: React.ReactNode;
}

function Navigation({ children }: Props) {
  const theme = useTheme();
  const { auth, logout } = useContext(AuthContext);
  const [open, setOpen] = useState<boolean>(() => {
    const savedDrawerState = localStorage.getItem('drawerOpen');
    return savedDrawerState ? JSON.parse(savedDrawerState) : false;
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { t } = useTranslation();

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

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          {auth.username && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
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
          <Typography variant="h6" noWrap component="div">
            {t('events.name')}
          </Typography>
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
            {auth.username ? (
              <>
                <IconButton onClick={handleMenuOpen} sx={{ p: 0.5 }}>
                  <Avatar
                    alt={auth.username}
                    src="/path-to-avatar.jpg"
                    sx={{
                      width: 40,
                      height: 40,
                      border: '2px solid #fff',
                    }}
                  />
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
                  <Button variant="text" color="inherit">
                    {t('login')}
                  </Button>
                </Link>
                <Link to="/signup" style={{ textDecoration: 'none' }}>
                  <Button variant="outlined" color="inherit">
                    {t('signup')}
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
          p: 3,
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
    </Box>
  );
}

export default Navigation;
