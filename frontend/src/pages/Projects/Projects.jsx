import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button,
  Grid,
  Card, 
  CardContent,
  CardActions,
  Chip,
  Dialog,
  IconButton,
  Avatar,
  AvatarGroup,
  Divider,
  Tooltip,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as AccessTimeIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ProjectForm from '../../components/ProjectForm';
import ProjectDetails from '../../components/ProjectDetails';
import { useProjects } from '../../hooks/useProjects';
import useHttp from '../../hooks/http-hook';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/userProvider';

const Projects = () => {
    const navigate = useNavigate();
    const { sendRequest } = useHttp();
    const queryClient = useQueryClient();
    const [openProjectForm, setOpenProjectForm] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [openProjectDetails, setOpenProjectDetails] = useState(false);
    const { projects, isLoading } = useProjects();
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [error, setError] = useState(null);
    const { user } = useUser();

    const createProjectMutation = useMutation({
        mutationFn: async (projectData) => {
            const response = await sendRequest({
                url: '/api/projects/',
                method: 'POST',
                body: JSON.stringify(projectData),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access')}`
                }
            });
            return response.results;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['projects']);
            setOpenProjectForm(false);
        },
        onError: (error) => {
            console.error('Project creation error:', error);
        }
    });

    const handleCreateProject = (projectData) => {
        createProjectMutation.mutate(projectData);
    };

    const formatDate = (dateString) => {
        return format(new Date(dateString), 'MMM dd, yyyy');
    };

    const deleteMutation = useMutation({
        mutationFn: async (projectId) => {
            try {
                const response = await fetch(`/api/projects/${projectId}/`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access')}`
                    }
                });
                
                if (response.status === 204) {
                    queryClient.invalidateQueries(['projects']);
                    queryClient.invalidateQueries(['tasks']);
                    return true;
                }
                throw new Error('Failed to delete project');
            } catch (error) {
                console.error('Delete error:', error);
                throw error;
            }
        },
        onSuccess: () => {
            setOpenDeleteDialog(false);
        }
    });
    

    const handleConfirmDelete = () => {
        if (projectToDelete) {
            deleteMutation.mutate(projectToDelete.id);
        }
    };
    
    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <h1 className='font-bold text-xl'>Projects</h1>
                {user.role === 'ADMIN' && (
                    <Box>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setOpenProjectForm(true)}
                            sx={{ mr: 2 }}
                    >
                        New Project
                    </Button>
                    </Box>
                )}
            </Box>

            <Grid container spacing={3}>
                {projects.results?.length > 0 ? (
                    projects.results?.map((project) => (
                        <Grid item xs={12} sm={6} md={4} key={project.id}>
                            <Card 
                                elevation={2}
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 4,
                                    }
                                }}
                            >
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="h6" gutterBottom fontWeight="bold">
                                        {project.title}
                                    </Typography>
                                    <Typography 
                                        variant="body2" 
                                        color="text.secondary" 
                                        sx={{ 
                                            mb: 2,
                                            minHeight: '40px',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        {project.description}
                                    </Typography>
                                    
                                    <Box display="flex" alignItems="center" mb={2}>
                                        <AccessTimeIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                        <Typography variant="caption" color="text.secondary">
                                            Created: {formatDate(project.created_at)}
                                        </Typography>
                                    </Box>

                                    <Box display="flex" alignItems="center" mb={2}>
                                        <GroupIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                        <Typography variant="caption" color="text.secondary">
                                            Owner: {project.owner.username}
                                        </Typography>
                                    </Box>

                                    <Box display="flex" alignItems="center">
                                        <Typography variant="caption" color="text.secondary">
                                            Tasks: {project?.tasks?.length}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Team Members:
                                        </Typography>
                                        <AvatarGroup max={4} sx={{ mt: 1 }}>
                                            {project.members.map((member) => (
                                                <Tooltip key={member.id} title={member.username}>
                                                    <Avatar sx={{ width: 24, height: 24 }}>
                                                        {member.username[0].toUpperCase()}
                                                    </Avatar>
                                                </Tooltip>
                                            ))}
                                        </AvatarGroup>
                                    </Box>
                                </CardContent>
                                <Divider />
                                <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1.5 }}>                                
                                    {user?.role === 'ADMIN' && (
                                        <Box>
                                            <IconButton 
                                                size="small" 
                                                color="error" 
                                                onClick={() => {
                                                    setProjectToDelete(project);
                                                    setOpenDeleteDialog(true);
                                                }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    )}
                                </CardActions>
                            </Card>
                        </Grid>
                    ))
                ) : (
                    <Grid item xs={12}>
                        <Box 
                            display="flex" 
                            justifyContent="center" 
                            alignItems="center" 
                            minHeight="200px"
                            bgcolor="background.paper"
                            borderRadius={2}
                            p={3}
                            textAlign="center"
                        >
                            <div className='flex justify-center items-center w-[100%] mt-20 text-gray-500'>
                                <h1>No tasks available at the moment. Please check back later!</h1>
                            </div>
                        </Box>
                    </Grid>
                )}
            </Grid>

            {/* Project Form Dialog */}
            <Dialog 
                open={openProjectForm} 
                onClose={() => setOpenProjectForm(false)}
                maxWidth="sm"
                fullWidth
            >
                <ProjectForm 
                    onSubmit={handleCreateProject}
                    onClose={() => setOpenProjectForm(false)}
                />
            </Dialog>

            {/* Project Details Dialog */}
            <Dialog 
                open={openProjectDetails} 
                onClose={() => setOpenProjectDetails(false)}
                maxWidth="md"
                fullWidth
            >
                <ProjectDetails 
                    project={selectedProject}
                    onClose={() => setOpenProjectDetails(false)}
                />
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Delete Project</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete project "{projectToDelete?.title}"? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Projects;
