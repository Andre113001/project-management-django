// src/hooks/useProjects.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../lib/projects';

export function useProjects() {
  const queryClient = useQueryClient();

  // Query for fetching all projects
  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getProjects
  });

  // Mutation for creating a project
  const createProjectMutation = useMutation({
    mutationFn: projectsApi.createProject,
    onSuccess: () => {
      // Invalidate and refetch projects list
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Mutation for adding a member
  const addMemberMutation = useMutation({
    mutationFn: ({ projectId, userId }: { projectId: number; userId: number }) =>
      projectsApi.addMember(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return {
    projects: projectsQuery.data ?? [],
    isLoading: projectsQuery.isLoading,
    error: projectsQuery.error,
    createProject: createProjectMutation.mutate,
    addMember: addMemberMutation.mutate,
  };
}

// Hook for single project
export function useProject(id: number) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectsApi.getProject(id)
  });
}