// src/api/projects.ts
import api from './axios';

/**
 * @typedef {Object} Project
 * @property {number} id - The unique identifier for the project.
 * @property {string} title - The title of the project.
 * @property {string} description - A brief description of the project.
 * @property {Object} owner - The owner of the project.
 * @property {number} owner.id - The unique identifier for the owner.
 * @property {string} owner.username - The username of the owner.
 * @property {Object[]} members - The members of the project.
 * @property {Object} members[] - Array of member objects.
 * @property {number} members[].id - The unique identifier for a member.
 * @property {string} members[].username - The username of a member.
 * @property {string} created_at - The timestamp when the project was created.
 * @property {string} updated_at - The timestamp when the project was last updated.
 */

export const projectsApi = {
  /**
   * Get all projects user has access to
   * @returns {Promise<Project[]>} - A promise that resolves to an array of projects.
   */
  getProjects: async () => {
    const response = await api.get('/projects/');
    return response.data.results;
  },

  /**
   * Get a single project by ID
   * @param {number} id - The unique identifier for the project.
   * @returns {Promise<Project>} - A promise that resolves to a project object.
   */
  getProject: async (id) => {
    const response = await api.get(`/projects/${id}/`);
    return response.data;
  },

  /**
   * Create a new project
   * @param {Object} data - The project data to create.
   * @returns {Promise<Project>} - A promise that resolves to the created project object.
   */
  createProject: async (data) => {
    const response = await api.post('/projects/', data);
    return response.data.results;
  },

  /**
   * Add member to project
   * @param {number} projectId - The unique identifier for the project.
   * @param {number} userId - The unique identifier for the user to add.
   * @returns {Promise<Object>} - A promise that resolves to the result of the add member operation.
   */
  addMember: async (projectId, userId) => {
    const response = await api.post(`/projects/${projectId}/add_member/`, {
      user_id: userId
    });
    return response.data.results;
  }
};