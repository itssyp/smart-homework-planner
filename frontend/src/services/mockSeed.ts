import type { Subject, Task } from '../types/planner.types';
import { dayjs } from '../utils/dayjsSetup';
import { getOrCreateMockUserId, markSeeded, readSubjects, readTasks, writeSubjects, writeTasks, isSeeded } from './plannerStorage';

function iso(d: dayjs.Dayjs) {
  return d.toISOString();
}

export function seedPlannerDemoData(): void {
  if (isSeeded()) return;

  const userId = getOrCreateMockUserId();
  const now = dayjs();

  const subjects: Subject[] = [
    { id: 'subj-math', name: 'Mathematics', difficulty_level: 3, color: '#5B8DEF', icon_name: 'Calculate' },
    { id: 'subj-cs', name: 'Computer Science', difficulty_level: 2, color: '#7C4DFF', icon_name: 'Code' },
    { id: 'subj-phys', name: 'Physics', difficulty_level: 4, color: '#26A69A', icon_name: 'Science' },
    { id: 'subj-lit', name: 'Literature', difficulty_level: 2, color: '#EC407A', icon_name: 'MenuBook' },
  ];

  const tasks: Task[] = [
    {
      id: 'task-1',
      user_id: userId,
      subject_id: 'subj-math',
      title: 'Problem set: differential equations',
      description: 'Chapters 4–5, show all steps.',
      deadline: iso(now.add(1, 'day').hour(23).minute(59)),
      priority: 'high',
      estimated_time_minutes: 150,
      status: 'not_started',
      created_at: iso(now.subtract(2, 'day')),
    },
    {
      id: 'task-2',
      user_id: userId,
      subject_id: 'subj-cs',
      title: 'Implement planner API client',
      description: 'Swap mock for fetch when backend is ready.',
      deadline: iso(now.add(3, 'day')),
      priority: 'high',
      estimated_time_minutes: 120,
      status: 'in_progress',
      created_at: iso(now.subtract(1, 'day')),
    },
    {
      id: 'task-3',
      user_id: userId,
      subject_id: 'subj-phys',
      title: 'Lab report draft',
      deadline: iso(now.add(6, 'day')),
      priority: 'medium',
      estimated_time_minutes: 90,
      status: 'not_started',
      created_at: iso(now.subtract(3, 'day')),
    },
    {
      id: 'task-4',
      user_id: userId,
      subject_id: 'subj-lit',
      title: 'Read chapters 2–3',
      deadline: iso(now.add(14, 'day')),
      priority: 'low',
      estimated_time_minutes: 60,
      status: 'not_started',
      created_at: iso(now.subtract(1, 'day')),
    },
    {
      id: 'task-5',
      user_id: userId,
      subject_id: 'subj-math',
      title: 'Quiz revision',
      deadline: iso(now.add(2, 'hour')),
      priority: 'medium',
      estimated_time_minutes: 45,
      status: 'not_started',
      created_at: iso(now),
    },
  ];

  writeSubjects([...readSubjects(), ...subjects]);
  writeTasks([...readTasks(), ...tasks]);
  markSeeded();
}
