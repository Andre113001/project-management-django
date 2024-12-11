// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../lib/axios';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthContextType {
  userId: number | null;
  isAuthenticated: boolean;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setUserId(null);
      setIsAuthenticated(false);
      return false;
    }
    console.log('token', token);

    try {
      const decoded: any = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        setUserId(null);
        setIsAuthenticated(false);
        return false;
      }
      console.log('decoded', decoded);

      // Get user data from backend
      setUserId(decoded.user_id);
      setIsAuthenticated(true);
      return true;
    } catch {
      setUserId(null);
      setIsAuthenticated(false);
      return false;
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ userId, isAuthenticated, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};