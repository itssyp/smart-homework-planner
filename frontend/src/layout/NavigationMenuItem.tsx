import { Avatar, Box, Menu, MenuItem, Typography, Divider } from '@mui/material';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';

interface NavigationMenuItemProps {
  username: string;
  anchorEl: HTMLElement | null;
  handleMenuClose: () => void;
  handleLogout: () => void;
}

function NavigationMenuItem({ username, anchorEl, handleMenuClose, handleLogout }: NavigationMenuItemProps) {
  const { t } = useTranslation();

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
      slotProps={{
        paper: {
          sx: {
            mt: 1,
            minWidth: 200,
            borderRadius: 2,
            bgcolor: 'background.paper',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          },
        },
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar
          alt={username}
          sx={(theme) => ({
            width: 52,
            height: 52,
            mb: 1,
            fontWeight: 800,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            color: theme.palette.primary.contrastText,
          })}
        >
          {username.charAt(0).toUpperCase()}
        </Avatar>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 'bold',
            color: 'text.primary',
          }}
        >
          {username}
        </Typography>
      </Box>
      <Divider />
      <MenuItem
        component={Link}
        to="/settings"
        sx={{
          py: 1.5,
          color: 'text.primary',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <SettingsIcon fontSize="small" />
        {t('menu.settings')}
      </MenuItem>
      <MenuItem
        onClick={handleLogout}
        sx={{
          py: 1.5,
          color: 'text.primary',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <LogoutIcon fontSize="small" />
        {t('menu.signOut')}
      </MenuItem>
    </Menu>
  );
}

export default NavigationMenuItem;
