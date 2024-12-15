import React, { useState } from 'react';
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
  Chip,
  Dialog,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import useHttp from '../hooks/http-hook';

const ProjectForm = ({ onSubmit, onClose, initialData }) => {
  const { sendRequest } = useHttp();
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    start_date: initialData?.start_date || '',
    deadline: initialData?.deadline || '',
    status: initialData?.status || 'TODO',
    type: 'PROJECT',
    members: initialData?.members?.filter(member => member.id !== 1).map(member => member.id) || []
  });

  // Add project statuses constant
  const projectStatuses = ['TODO', 'IN_PROGRESS', 'DONE'];

  // Fetch all approved team members
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const response = await sendRequest({
        url: '/api/team-members/',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access')}`
        }
      });
      // Filter out admin users from the team members list
      return (response || []).filter(member => member.role !== 'ADMIN');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const submissionData = {
        ...formData,
        members: formData.members // Array of member IDs
    };
    console.log('Submitting project data:', submissionData); // Debug log
    onSubmit(submissionData);
  };

  console.log(teamMembers);
  

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? 'Edit Project' : 'New Project'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Project Title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            
            <TextField
              label="Description"
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <TextField
              label="Start Date"
              type="date"
              required
              InputLabelProps={{ shrink: true }}
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            />

            <TextField
              label="Deadline"
              type="date"
              required
              InputLabelProps={{ shrink: true }}
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            />

            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({
                  ...formData,
                  status: e.target.value
                })}
              >
                {projectStatuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Team Members</InputLabel>
              <Select
                multiple
                value={formData.members}
                onChange={(e) => setFormData({
                  ...formData,
                  members: e.target.value
                })}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip 
                        key={value} 
                        label={teamMembers.find(m => m.id === value)?.username} 
                      />
                    ))}
                  </Box>
                )}
              >
                {teamMembers.map((member) => (
                  <MenuItem key={member.id} value={member.id}>
                    {member.username}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {initialData ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProjectForm;