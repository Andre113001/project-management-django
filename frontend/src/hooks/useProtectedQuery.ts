// src/hooks/useProtectedQuery.ts
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';

export function useProtectedQuery<T>(
  key: string[],
  url: string,
  options?: UseQueryOptions<T>
) {
  const navigate = useNavigate();
  const { isAuthenticated, checkAuth } = useAuth();

  return useQuery<T>({
    queryKey: key,
    queryFn: async () => {
      if (!isAuthenticated) {
        const isValid = await checkAuth();
        if (!isValid) {
          navigate('/login');
          throw new Error('Not authenticated');
        }
      }
      const response = await api.get(url);
      return response.data;
    },
    ...options,
    enabled: isAuthenticated && (options?.enabled ?? true),
  });
}