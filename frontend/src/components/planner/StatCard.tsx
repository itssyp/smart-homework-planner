import { Card, Typography } from '@mui/material';

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
}

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.03em', mt: 0.5, lineHeight: 1.15 }}>
        {value}
      </Typography>
      {hint && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          {hint}
        </Typography>
      )}
    </Card>
  );
}
