import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface PlannerPageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PlannerPageHeader({ eyebrow, title, subtitle, action }: PlannerPageHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'flex-start' },
        gap: 2,
        mb: 3,
      }}
    >
      <Box>
        {eyebrow && (
          <Typography
            variant="overline"
            sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.08em' }}
          >
            {eyebrow}
          </Typography>
        )}
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography color="text.secondary" sx={{ mt: 0.5, maxWidth: 520 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action}
    </Box>
  );
}
