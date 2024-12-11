import { Routes, Route } from 'react-router-dom';
import { ProjectList } from '../components/ProjectList';
import { ProjectDetail } from '../components/ProjectDetail';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { LoginForm } from '../components/LoginComponent';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <ProjectList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:id"
        element={
          <ProtectedRoute>
            <ProjectDetail />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}