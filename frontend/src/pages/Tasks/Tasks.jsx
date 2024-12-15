import React, { useState } from 'react';
import {
    Box, Typography, Tabs, Tab, Card, CardContent, Chip,
    TextField, InputAdornment, FormControl, InputLabel,
    Select, MenuItem, Grid, Stack, Paper, ToggleButtonGroup, ToggleButton,
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    CardActions, IconButton,
} from '@mui/material';
import {
    Search as SearchIcon,
    AccessTime as AccessTimeIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    ViewModule as GridViewIcon,
    ViewKanban as KanbanViewIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useHttp from '../../hooks/http-hook';
import { useUser } from '../../contexts/userProvider';
import TaskForm from '../../components/TaskForm';
import { useProjects } from '../../hooks/useProjects';

const taskStatuses = ['TODO', 'IN_PROGRESS', 'DONE'];

const Tasks = () => {
    const { sendRequest } = useHttp();
    const queryClient = useQueryClient();
    const { user } = useUser();
    const [tabValue, setTabValue] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [viewType, setViewType] = useState('grid');
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [openTaskForm, setOpenTaskForm] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const { projects } = useProjects();

    // Updated task fetching query
    const { data: tasksData = { results: [] }, isLoading } = useQuery({
        queryKey: ['tasks', tabValue],
        queryFn: async () => {
            const endpoint = user?.role === 'ADMIN' 
                ? '/api/tasks/' 
                : `/api/tasks/my-tasks/${user.id}/`;
            
            const response = await sendRequest({
                url: endpoint,
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`
                }
            });
            return response;
        }
    });

    const tasks = tasksData.results || [];

    // Update task status mutation
    const updateTaskStatus = useMutation({
        mutationFn: async ({ taskId, newStatus }) => {
            return await sendRequest({
                url: `/api/tasks/${taskId}/update_status/`,
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus }),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access')}`
                }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['tasks']);
        }
    });

    // Add delete mutation after the updateTaskStatus mutation
    const deleteTaskMutation = useMutation({
        mutationFn: async (taskId) => {
            const response = await sendRequest({
                url: `/api/tasks/${taskId}/`,
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`
                }
            });
            
            // Regardless of the result, refresh the page
            window.location.reload();
            return response; // Return the response for further handling if needed
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['tasks']);
            setOpenDeleteDialog(false);
        },
        onError: (error) => {
            console.error('Delete error:', error);
        }
    });

    const createTaskMutation = useMutation({
        mutationFn: async (taskData) => {
            const response = await sendRequest({
                url: '/api/tasks/',
                method: 'POST',
                body: JSON.stringify(taskData),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access')}`
                }
            });
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['tasks']);
            setOpenTaskForm(false);
        }
    });

    const handleCreateTask = (taskData) => {
        createTaskMutation.mutate(taskData);
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;
        const { draggableId, destination } = result;
        updateTaskStatus.mutate({
            taskId: draggableId,
            newStatus: destination.droppableId
        });
    };

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (task.project?.title?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
        const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
        return matchesSearch && matchesStatus && matchesPriority;
    });

    const groupedTasks = taskStatuses.reduce((acc, status) => {
        acc[status] = filteredTasks.filter(task => task.status === status);
        return acc;
    }, {});

    console.log(tasks);
    
    const getStatusColor = (status) => {
        switch (status) {
            case 'TODO':
                return 'warning';
            case 'IN_PROGRESS':
                return 'info';
            case 'DONE':
                return 'success';
            default:
                return 'default';
        }
    };

    const renderGridView = () => (
        <Grid container spacing={3}>
            {filteredTasks?.length > 0 ? (filteredTasks.map((task) => (
                <Grid item xs={12} sm={6} md={4} key={task.id}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                {task.title}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                Project: {task?.project_title || 'No Project'}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                Due Date: {task?.due_date}
                            </Typography>
                            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Chip 
                                    label={task.status} 
                                    color={getStatusColor(task.status)} 
                                    size="small"
                                />
                                <Chip 
                                    label={task.priority} 
                                    color={task.priority === 'HIGH' ? 'error' : 'default'}
                                    size="small"
                                />
                            </Box>
                            <Box mt={2}>
                                <Typography variant="body2" color="textSecondary">
                                    Assigned to: {task.assigned_to?.username}
                                </Typography>
                            </Box>
                        </CardContent>
                        {user.role === 'ADMIN' && (
                            <CardActions>
                                <IconButton 
                                    size="small" 
                                    color="error"
                                    onClick={() => {
                                        setTaskToDelete(task);
                                        setOpenDeleteDialog(true);
                                    }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </CardActions>
                        )}
                    </Card>
                </Grid>
            ))) : (
                <div className='flex justify-center items-center w-[100%] mt-20 text-gray-500'>
                    <h1>No tasks available at the moment. Please check back later!</h1>
                </div>
            )}
        </Grid>
    );

    const renderKanbanView = () => (
        <DragDropContext onDragEnd={handleDragEnd}>
            <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                overflowX: 'auto', 
                minHeight: '70vh',
                p: 1 
            }}>
                {taskStatuses.map(status => (
                    <Droppable droppableId={status} key={status}>
                        {(provided, snapshot) => (
                            <Paper
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                sx={{
                                    minWidth: 300,
                                    maxWidth: 300,
                                    bgcolor: snapshot.isDraggingOver ? 'grey.200' : 'grey.100',
                                    p: 2,
                                    borderRadius: 2,
                                }}
                            >
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    {status} ({groupedTasks[status]?.length || 0})
                                </Typography>
                                <Stack spacing={2}>
                                    {groupedTasks[status]?.map((task, index) => (
                                        <Draggable
                                            key={task.id}
                                            draggableId={task.id.toString()}
                                            index={index}
                                        >
                                            {(provided, snapshot) => (
                                                <Card
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    sx={{
                                                        bgcolor: 'white',
                                                        p: 2,
                                                        '&:hover': { boxShadow: 3 }
                                                    }}
                                                >
                                                    <Typography variant="subtitle1" gutterBottom>
                                                        {task.title}
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        {task.project_title}
                                                    </Typography>
                                                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Chip 
                                                            label={task.priority} 
                                                            size="small"
                                                            color={task.priority === 'HIGH' ? 'error' : 'default'}
                                                        />
                                                        {user.role === 'ADMIN' && (
                                                            <IconButton 
                                                                size="small" 
                                                                color="error"
                                                                onClick={() => {
                                                                    setTaskToDelete(task);
                                                                    setOpenDeleteDialog(true);
                                                                }}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        )}
                                                    </Box>
                                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                                        {task.assigned_to?.username}
                                                    </Typography>
                                                </Card>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </Stack>
                            </Paper>
                        )}
                    </Droppable>
                ))}
            </Box>
        </DragDropContext>
    );

    const handleDeleteClick = (task) => {
        setTaskToDelete(task);
        setOpenDeleteDialog(true);
    };

    const handleConfirmDelete = () => {
        if (taskToDelete) {
            deleteTaskMutation.mutate(taskToDelete.id);
        }
    };

    const handleOpenTaskForm = () => {
        setSelectedTask(null);
        setOpenTaskForm(true);
    };

    const handleCloseTaskForm = () => {
        setSelectedTask(null);
        setOpenTaskForm(false);
    };

    return (
        <Box p={3}>
            <div className='flex justify-between items-center mb-3'>
                <h1 className='font-bold text-xl'>Tasks</h1>
                {user.role === 'ADMIN' && (
                    <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={handleOpenTaskForm}
                    >
                        New Task
                    </Button>
                )}
            </div>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        size="small"
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            label="Status"
                        >
                            <MenuItem value="all">All</MenuItem>
                            {taskStatuses.map(status => (
                                <MenuItem key={status} value={status}>{status}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Priority</InputLabel>
                        <Select
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value)}
                            label="Priority"
                        >
                            <MenuItem value="all">All</MenuItem>
                            <MenuItem value="LOW">Low</MenuItem>
                            <MenuItem value="MEDIUM">Medium</MenuItem>
                            <MenuItem value="HIGH">High</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <ToggleButtonGroup
                        value={viewType}
                        exclusive
                        onChange={(_, newView) => newView && setViewType(newView)}
                        size="small"
                    >
                        <ToggleButton value="grid">
                            <GridViewIcon />
                        </ToggleButton>
                        <ToggleButton value="kanban">
                            <KanbanViewIcon />
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            </Box>

            {viewType === 'grid' ? renderGridView() : renderKanbanView()}

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Delete Task</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete task "{taskToDelete?.title}"? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add TaskForm dialog */}
            <Dialog 
                open={openTaskForm} 
                onClose={() => setOpenTaskForm(false)}
                maxWidth="sm"
                fullWidth
            >
                <TaskForm 
                    projects={projects}
                    onSubmit={handleCreateTask}
                    onClose={() => setOpenTaskForm(false)}
                />
            </Dialog>
        </Box>
    );
};

export default Tasks;
