import { Box, Button, Card, CardActionArea, CardContent, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSubjectsQuery } from '../query/planner.query';
import { SubjectIcon } from '../components/planner/subjectIcon';
import { TaskListSkeleton } from '../components/planner/PlannerSkeletons';
import { PlannerPageHeader } from '../components/planner/PlannerPageHeader';
import { CreateSubjectModal } from '../components/planner/CreateSubjectModal';
import { usePlannerUiStore } from '../store/plannerUiStore';

function SubjectsPage() {
  const { t } = useTranslation();
  const setCreateSubjectOpen = usePlannerUiStore((s) => s.setCreateSubjectOpen);
  const { data: subjects = [], isLoading } = useSubjectsQuery();

  if (isLoading) {
    return <TaskListSkeleton rows={3} />;
  }

  return (
    <Box sx={{ maxWidth: 1160, mx: 'auto' }}>
      <PlannerPageHeader
        eyebrow={t('planner.subjects.eyebrow')}
        title={t('planner.subjects.title')}
        subtitle={t('planner.subjects.subtitle')}
        action={
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setCreateSubjectOpen(true)}>
            {t('planner.subjects.newSubject')}
          </Button>
        }
      />

      <Stack spacing={2}>
        {subjects.map((s) => (
          <Card key={s.id} elevation={0} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <CardActionArea
              component={Link}
              to={`/subjects/${s.id}`}
              sx={{
                borderLeft: '6px solid',
                borderLeftColor: s.color ?? 'primary.main',
                '&:hover .subjects-chevron': { opacity: 1, transform: 'translateX(4px)' },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2.5 }}>
                <SubjectIcon iconName={s.icon_name} color={s.color} sx={{ fontSize: 28 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {s.name}
                  </Typography>
                  {s.difficulty_level != null && (
                    <Typography variant="body2" color="text.secondary">
                      {t('planner.subjects.difficulty', { level: s.difficulty_level })}
                    </Typography>
                  )}
                </Box>
                <ChevronRightIcon
                  className="subjects-chevron"
                  sx={{
                    color: 'text.secondary',
                    opacity: 0.6,
                    transition: 'opacity 0.2s, transform 0.2s',
                  }}
                />
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Stack>

      <CreateSubjectModal />
    </Box>
  );
}

export default SubjectsPage;
