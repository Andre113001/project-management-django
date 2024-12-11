// src/components/ProjectList.tsx
import { useProjects } from '../hooks/useProjects';
import { Card, Text, Group, Button, Stack, Modal, Box } from '@mantine/core';
import { useState } from 'react';
import { ProjectForm } from './ProjectForm';

export function ProjectList() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { projects, isLoading, createProject } = useProjects();

  if (isLoading) {
    return <div>Loading projects...</div>;
  }

  return (
    <>
      <Box mb="md" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text fz="xl" fw={500}>Projects</Text>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          Create Project
        </Button>
      </Box>

      <Box>
        {projects.map((project) => (
          <Card key={project.id} shadow="sm" p="lg" mb="sm">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text fw={500}>{project.title}</Text>
              <Text fz="sm" c="dimmed">
                Owner: {project.owner.username}
              </Text>
            </Box>
            <Text mt="sm" c="dimmed" fz="sm">
              {project.description}
            </Text>
            <Text fz="xs" mt="md" c="dimmed">
              Members: {project.members.map(m => m.username).join(', ')}
            </Text>
          </Card>
        ))}
      </Box>

      <Modal
        opened={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Project"
        centered
        size="md"
      >
        <ProjectForm
          onSubmit={async (data) => {
            try {
              await createProject(data);
              setIsCreateModalOpen(false);
            } catch (error) {
              console.error('Failed to create project:', error);
              // Error handling could be added here
            }
          }}
        />
      </Modal>
    </>
  );
}
