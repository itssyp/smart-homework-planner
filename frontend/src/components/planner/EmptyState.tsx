import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Box
      sx={{
        py: 5,
        px: 2,
        textAlign: 'center',
        borderRadius: 4,
        border: '1px dashed',
        borderColor: 'divider',
        bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(108, 93, 211, 0.04)',
      }}
    >
      <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: action ? 2 : 0, maxWidth: 360, mx: 'auto' }}>
          {description}
        </Typography>
      )}
      {action}
    </Box>
  );
}
