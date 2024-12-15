// src/hooks/useProjects.js
import { useQuery } from '@tanstack/react-query';
import useHttp from './http-hook';

export const useProjects = () => {
    const { sendRequest } = useHttp();

    const { data: projects = [], isLoading, error } = useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            const response = await sendRequest({
                url: '/api/projects/',
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`
                }
            });
            return response;
        }
    });

    return { projects, isLoading, error };
};

// Hook for single project
export function useProject(id) { // Removed TypeScript annotation
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectsApi.getProject(id)
  });
}