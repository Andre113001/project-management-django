// src/api/auth.ts
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: number;
    username: string;
    email: string;
  };
  access: string;
  refresh: string;
}

export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await axios.post(`${API_URL}/login/`, data);
  return response.data;
};

export const logout = async () => {
    const refresh = localStorage.getItem('refreshToken');
    try {
      await axios.post('http://localhost:8000/api/logout/', { refresh });
    } finally {
      // Clear tokens regardless of API call success
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  };


