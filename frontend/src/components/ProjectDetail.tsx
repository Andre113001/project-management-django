import { useProject } from '../hooks/useProjects';
import { useParams } from 'react-router-dom';
import { Card, Text, Group, Stack } from '@mantine/core';

export function ProjectDetail() {
  const { id } = useParams();
  const { data: project, isLoading } = useProject(Number(id));

  if (isLoading) {
    return <div>Loading project...</div>;
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <Card shadow="sm" p="lg">
      <Stack>
        <Group position="apart">
          <Text size="xl" weight={500}>{project.title}</Text>
          <Text size="sm" color="dimmed">
            Created by: {project.owner.username}
          </Text>
        </Group>
        
        <Text>{project.description}</Text>

        <Card withBorder>
          <Text weight={500} mb="sm">Members</Text>
          {project.members.map(member => (
            <Text key={member.id} size="sm">
              {member.username}
            </Text>
          ))}
        </Card>
      </Stack>
    </Card>
  );
}