// src/api/auth.ts
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const login = async (data) => {
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

export const register = async (userData) => {
    try {
        const response = await fetch(`/api/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Registration failed');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
};


