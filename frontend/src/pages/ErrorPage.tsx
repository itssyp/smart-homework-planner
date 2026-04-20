import { Box, Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

function ErrorPage() {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary',
        px: 2,
      }}
    >
      <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}>
        {t('errorPage.code')}
      </Typography>
      <Typography variant="h5" sx={{ mt: 2, fontWeight: 700 }}>
        {t('errorPage.title')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: 420, textAlign: 'center' }}>
        {t('errorPage.message')}
      </Typography>
      <Button component={Link} to="/" variant="contained" color="primary" sx={{ mt: 4 }}>
        {t('errorPage.goHome')}
      </Button>
    </Box>
  );
}

export default ErrorPage;
