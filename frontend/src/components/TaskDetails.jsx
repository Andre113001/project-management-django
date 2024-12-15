import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Typography, Box, Chip, IconButton,
    Alert
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useHttp from '../hooks/http-hook';

const TaskDetails = ({ task, onClose }) => {
    const { sendRequest } = useHttp();
    const queryClient = useQueryClient();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [error, setError] = useState(null);

    const deleteMutation = useMutation({
        mutationFn: async () => {
            return await sendRequest({
                url: `/api/tasks/${task.id}/`,
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`
                }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['tasks']);
            onClose();
        },
        onError: (error) => {
            setError(error.message);
        }
    });

    const handleDelete = () => {
        deleteMutation.mutate();
        setShowDeleteConfirm(false);
    };

    return (
        <>
            <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">{task.title}</Typography>
                        <Box>
                            <IconButton onClick={() => setIsEditing(true)}>
                                <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => setShowDeleteConfirm(true)} color="error">
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}
                    <Typography variant="body1" gutterBottom>
                        {task.description}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Status: <Chip label={task.status} color="primary" size="small" />
                        </Typography>
                        <Typography variant="subtitle1" gutterBottom>
                            Priority: <Chip label={task.priority} color="secondary" size="small" />
                        </Typography>
                        <Typography variant="subtitle1" gutterBottom>
                            Due Date: {new Date(task.due_date).toLocaleDateString()}
                        </Typography>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Assigned To:
                        </Typography>
                        <Box display="flex" gap={1} flexWrap="wrap">
                            {task.assigned_to && (
                                <Chip 
                                    label={task.assigned_to.username}
                                    size="small"
                                />
                            )}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
                <DialogTitle>Delete Task</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this task? This action cannot be undone.
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

export default TaskDetails;