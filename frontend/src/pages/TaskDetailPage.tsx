import { Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CreateTaskModal } from '../components/planner/CreateTaskModal';
import { EmptyState } from '../components/planner/EmptyState';
import { TaskListSkeleton } from '../components/planner/PlannerSkeletons';
import { PriorityChip } from '../components/planner/PriorityChip';
import { SubjectIcon } from '../components/planner/subjectIcon';
import { useDeleteTaskMutation, useSubjectsQuery, useTasksQuery } from '../query/planner.query';
import { formatDeadlineCountdown, getDeadlineUrgency, urgencyColor } from '../utils/deadlineUrgency';

function TaskDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { taskId } = useParams<{ taskId: string }>();
  const tasksQuery = useTasksQuery();
  const subjectsQuery = useSubjectsQuery();
  const deleteTask = useDeleteTaskMutation();
  const [isEditing, setIsEditing] = useState(false);

  const task = useMemo(
    () => (tasksQuery.data ?? []).find((x) => x.id === taskId),
    [tasksQuery.data, taskId],
  );
  const subject = useMemo(
    () => (subjectsQuery.data ?? []).find((x) => x.id === task?.subject_id),
    [subjectsQuery.data, task?.subject_id],
  );

  if (tasksQuery.isLoading || subjectsQuery.isLoading) {
    return <TaskListSkeleton rows={1} />;
  }

  if (!task) {
    return (
      <Box sx={{ maxWidth: 900, mx: 'auto' }}>
        <Button component={Link} to="/tasks" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
          {t('planner.taskDetail.back')}
        </Button>
        <EmptyState title={t('planner.taskDetail.notFoundTitle')} description={t('planner.taskDetail.notFoundDescription')} />
      </Box>
    );
  }

  const countdown = formatDeadlineCountdown(task.deadline);
  const urgency = getDeadlineUrgency(task.deadline);
  const handleDelete = () => {
    const ok = window.confirm(t('planner.tasks.deleteConfirm', { title: task.title }));
    if (!ok) return;
    deleteTask.mutate(task.id, {
      onSuccess: () => navigate('/tasks'),
    });
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Button component={Link} to="/tasks" startIcon={<ArrowBackIcon />}>
          {t('planner.taskDetail.back')}
        </Button>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setIsEditing(true)}>
            {t('planner.taskDetail.edit')}
          </Button>
          <Button color="error" variant="outlined" startIcon={<DeleteIcon />} onClick={handleDelete}>
            {t('planner.taskDetail.delete')}
          </Button>
        </Stack>
      </Box>

      <Card elevation={0} sx={{ borderRadius: 3, borderLeft: '6px solid', borderLeftColor: 'primary.main' }}>
        <CardContent sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mb: 1.5 }}>
            {subject && <SubjectIcon iconName={subject.icon_name} color={subject.color} />}
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {task.title}
            </Typography>
            <PriorityChip priority={task.priority} />
            <Chip label={t(`planner.tasks.status${task.status === 'not_started' ? 'NotStarted' : task.status === 'in_progress' ? 'InProgress' : 'Done'}`)} size="small" variant="outlined" />
            {countdown && urgency !== 'none' && (
              <Chip
                size="small"
                label={countdown}
                color={urgencyColor(urgency)}
                variant={urgency === 'ok' ? 'outlined' : 'filled'}
              />
            )}
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {subject?.name ?? t('planner.taskDetail.noSubject')}
          </Typography>

          <Typography variant="subtitle2" sx={{ mb: 0.75 }}>
            {t('planner.taskDetail.description')}
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {task.description || t('planner.taskDetail.noDescription')}
          </Typography>
        </CardContent>
      </Card>

      <CreateTaskModal open={isEditing} taskToEdit={task} onClose={() => setIsEditing(false)} />
    </Box>
  );
}

export default TaskDetailPage;
