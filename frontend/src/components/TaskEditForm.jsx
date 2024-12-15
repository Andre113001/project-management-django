import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
} from '@mui/material';

// Dummy team members data (in real app, this would come from your backend)
const teamMembers = [
  'John Doe',
  'Alice Smith',
  'Bob Johnson',
  'Sarah Wilson',
];

const TaskEditForm = ({ task, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    project: '',
    description: '',
    assignedTo: [],
    startDate: '',
    deadline: '',
    status: '',
    priority: '',
  });

  // Initialize form with task data when component mounts
  useEffect(() => {
    if (task) {
      setFormData({
        id: task.id,
        name: task.name,
        project: task.project,
        description: task.description,
        assignedTo: task.assignedTo,
        startDate: task.startDate,
        deadline: task.deadline,
        status: task.status,
        priority: task.priority,
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogTitle>Edit Task</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            required
            label="Task Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            required
            label="Project"
            name="project"
            value={formData.project}
            onChange={handleChange}
            fullWidth
            disabled // Assuming project can't be changed after creation
          />

          <TextField
            required
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={3}
            fullWidth
          />

          <TextField
            required
            label="Start Date"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            required
            label="Deadline"
            name="deadline"
            type="date"
            value={formData.deadline}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <FormControl fullWidth required>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleChange}
              label="Status"
            >
              <MenuItem value="Not Started">Not Started</MenuItem>
              <MenuItem value="In-Progress">In Progress</MenuItem>
              <MenuItem value="Done">Done</MenuItem>
              <MenuItem value="Urgent">Urgent</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth required>
            <InputLabel>Priority</InputLabel>
            <Select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              label="Priority"
            >
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
            </Select>
          </FormControl>

          <Autocomplete
            multiple
            options={teamMembers}
            value={formData.assignedTo}
            onChange={(event, newValue) => {
              setFormData(prev => ({
                ...prev,
                assignedTo: newValue
              }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Assigned To"
                required
              />
            )}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </form>
  );
};

export default TaskEditForm;