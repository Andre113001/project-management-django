import React, { useState, useEffect } from 'react';
import {
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Autocomplete,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import useHttp from '../hooks/http-hook';

const TaskForm = ({ onSubmit, onClose }) => {
    const { sendRequest } = useHttp();
    const [projects, setProjects] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        project: '',
        assigned_to: '',
        status: 'TODO',
        priority: 'MEDIUM',
        type: 'TASK',
        due_date: '',
    });

    // Fetch all projects
    const { data: fetchProjects = [] } = useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            const response = await sendRequest({
                url: '/api/projects/',
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`
                }
            });
            setProjects(response.results);
        }
    });
    
    // Fetch project members when a project is selected
    const { data: projectMembers = [] } = useQuery({
        queryKey: ['project-members', formData.project],
        queryFn: async () => {
            if (!formData.project) return [];
            const response = await sendRequest({
                url: `/api/projects/${formData.project}/`,
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`
                }
            });
            return response.members || [];
        },
        enabled: !!formData.project
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const submissionData = {
            ...formData,
            assigned_to_id: formData.assigned_to
        };
        onSubmit(submissionData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    {/* Project Selection */}
                    <FormControl fullWidth required>
                        <InputLabel>Project</InputLabel>
                        <Select
                            value={formData.project}
                            onChange={(e) => setFormData({ 
                                ...formData, 
                                project: e.target.value,
                                assigned_to: '' // Reset assigned member when project changes
                            })}
                            label="Project"
                        >
                            {Array.isArray(projects) ? (
                                projects.map((project) => (
                                    <MenuItem key={project.id} value={project.id}>
                                        {project.title}
                                    </MenuItem>
                                ))
                            ) : (
                                <MenuItem disabled>No projects available</MenuItem>
                            )}
                        </Select>
                    </FormControl>

                    {/* Task Title */}
                    <TextField
                        label="Task Title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        fullWidth
                    />

                    {/* Task Description */}
                    <TextField
                        label="Description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        multiline
                        rows={4}
                        fullWidth
                    />

                    {/* Assign Member */}
                    <FormControl fullWidth required>
                        <InputLabel>Assign To</InputLabel>
                        <Select
                            value={formData.assigned_to}
                            onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                            label="Assign To"
                            disabled={!formData.project}
                        >
                            {projectMembers.map((member) => (
                                <MenuItem key={member.id} value={member.id}>
                                    {member.username}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Due Date */}
                    <TextField
                        label="Due Date"
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                        required
                        fullWidth
                    />

                    {/* Priority Selection */}
                    <FormControl fullWidth required>
                        <InputLabel>Priority</InputLabel>
                        <Select
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            label="Priority"
                        >
                            <MenuItem value="LOW">Low</MenuItem>
                            <MenuItem value="MEDIUM">Medium</MenuItem>
                            <MenuItem value="HIGH">High</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button type="submit" variant="contained">Create Task</Button>
            </DialogActions>
        </form>
    );
};

export default TaskForm;