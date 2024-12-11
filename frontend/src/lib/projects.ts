// src/api/projects.ts
import api from '../lib/axios';

export interface Project {
  id: number;
  title: string;
  description: string;
  owner: {
    id: number;
    username: string;
  };
  members: {
    id: number;
    username: string;
  }[];
  created_at: string;
  updated_at: string;
}

export const projectsApi = {
  // Get all projects user has access to
  getProjects: async (): Promise<Project[]> => {
    const response = await api.get('/projects/');
    return response.data.results;
  },

  // Get a single project by ID
  getProject: async (id: number): Promise<Project> => {
    const response = await api.get(`/projects/${id}/`);
    return response.data;
  },

  // Create a new project
  createProject: async (data: { title: string; description: string }) => {
    const response = await api.post('/projects/', data);
    return response.data.results;
  },

  // Add member to project
  addMember: async (projectId: number, userId: number) => {
    const response = await api.post(`/projects/${projectId}/add_member/`, {
      user_id: userId
    });
    return response.data.results;
  }
};