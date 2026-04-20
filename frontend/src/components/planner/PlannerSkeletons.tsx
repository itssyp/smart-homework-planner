import { Box, Card, CardContent, Skeleton, Stack } from '@mui/material';

export function DashboardSkeleton() {
  return (
    <Stack spacing={2}>
      <Skeleton variant="rounded" height={120} />
      <Skeleton variant="rounded" height={200} />
      <Skeleton variant="rounded" height={160} />
    </Stack>
  );
}

export function TaskListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <Stack spacing={1.5}>
      {Array.from({ length: rows }).map((_, i) => (
        <Card key={i} variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center' }}>
              <Skeleton variant="circular" width={40} height={40} />
              <Box sx={{ flex: 1 }}>
                <Skeleton width="60%" />
                <Skeleton width="40%" />
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
