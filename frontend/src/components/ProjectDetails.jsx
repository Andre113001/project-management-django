// frontend/src/pages/Projects/components/ProjectDetails.jsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Dialog,
  IconButton
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useHttp from '../hooks/http-hook';
import ProjectForm from './ProjectForm';
import { useUser } from '../contexts/userProvider';

const ProjectDetails = ({ project, onClose }) => {
  const { user } = useUser();
  const { sendRequest } = useHttp();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState(null);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await sendRequest({
        url: `/api/projects/${project.id}/`,
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access')}`
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      onClose();
    },
    onError: (error) => {
      setError(error.message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedData) => {
      return await sendRequest({
        url: `/api/projects/${project.id}/`,
        method: 'PUT',
        body: JSON.stringify(updatedData),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access')}`
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      setIsEditing(false);
    },
    onError: (error) => {
      setError(error.message);
    }
  });

  const handleDelete = () => {
    deleteMutation.mutate();
    setShowDeleteConfirm(false);
  };

  const handleUpdate = (updatedData) => {
    updateMutation.mutate(updatedData);
  };

  if (!project) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'TODO': return 'default';
      case 'IN_PROGRESS': return 'primary';
      case 'DONE': return 'success';
      default: return 'default';
    }
  };

  return (
    <>
      <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{project.title}</Typography>
            {user.role === 'ADMIN' && (
              <Box>
                <IconButton onClick={() => setShowDeleteConfirm(true)} color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          <Typography variant="body1" gutterBottom>
            {project.description}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Status: <Chip label={project.status} color="primary" size="small" />
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Start Date: {new Date(project.start_date).toLocaleDateString()}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Deadline: {new Date(project.deadline).toLocaleDateString()}
            </Typography>
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Team Members:
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {project.members.map((member) => (
                <Chip 
                  key={member.id}
                  label={member.username}
                  size="small"
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this project? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProjectDetails;