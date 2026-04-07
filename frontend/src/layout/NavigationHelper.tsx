import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, styled } from '@mui/material';
import { Link } from 'react-router-dom';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import QueueOutlinedIcon from '@mui/icons-material/QueueOutlined';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import AddIcon from '@mui/icons-material/Add';
import MuiAppBar, { type AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
import HomeIcon from '@mui/icons-material/Home';
import { AuthContext } from '../authentication/AuthContext';

export const drawerWidth = 240;

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

export function DrawerList() {
  const { t } = useTranslation();
  const { auth } = useContext(AuthContext);

  const menuItems = [];

  if (auth.username) {
    menuItems.push(
      { text: t('home.home'), icon: <HomeIcon />, path: '/' },
      { text: t('events.allEvents'), icon: <CalendarMonthIcon />, path: '/events' },
      { text: t('categories.allCategories'), icon: <ClassOutlinedIcon />, path: '/categories' },
      { text: t('events.newEvent'), icon: <QueueOutlinedIcon />, path: '/addOrEditEvent' },
      { text: t('categories.newCategory'), icon: <AddIcon />, path: '/addOrEditCategory' },
    );

  
  }

  return (
    <List>
      {menuItems.map((item) => (
        <ListItem key={item.text} disablePadding>
          <ListItemButton component={Link} to={item.path}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        </ListItem>
      ))}
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
