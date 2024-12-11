// src/components/TaskList.tsx
import { useProtectedQuery } from '../hooks/useProtectedQuery';
import { useAuth } from '../context/AuthContext';
import { Card, Badge, Text, Group, Stack } from '@mantine/core';

interface Task {
  id: number;
  title: string;
  status: string;
  assigned_to: {
    id: number;
    username: string;
  } | null;
}

export function TaskList() {
  const { user } = useAuth();
  const { data: tasks, isLoading } = useProtectedQuery<Task[]>(
    ['tasks'],
    '/tasks/'
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Stack>
      {tasks?.map(task => (
        <Card key={task.id} shadow="sm" padding="lg">
          <Group position="apart">
            <Text weight={500}>{task.title}</Text>
            <Badge color={task.status === 'DONE' ? 'green' : 'blue'}>
              {task.status}
            </Badge>
          </Group>
          {task.assigned_to?.id === user?.id && (
            <Text size="sm" color="dimmed">
              Assigned to you
            </Text>
          )}
        </Card>
      ))}
    </Stack>
  );
}