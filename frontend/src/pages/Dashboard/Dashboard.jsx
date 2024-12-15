import React, { useEffect, useRef } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import { 
  Assignment as AssignmentIcon,
  Timer as TimerIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/userProvider';
import { useQuery } from '@tanstack/react-query';
import useHttp from '../../hooks/http-hook';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import { gantt } from 'dhtmlx-gantt';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { sendRequest } = useHttp();
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await sendRequest({
        url: '/api/dashboard/stats/',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access')}`
        }
      });
      return response;
    }
  });

  const taskStatusData = [
    { 
      status: 'Not Started', 
      count: dashboardData?.taskStats?.todo || 0, 
      color: '#e0e0e0', 
      icon: AssignmentIcon 
    },
    { 
      status: 'In Progress', 
      count: dashboardData?.taskStats?.in_progress || 0, 
      color: '#64b5f6', 
      icon: TimerIcon 
    },
    { 
      status: 'Done', 
      count: dashboardData?.taskStats?.done || 0, 
      color: '#81c784', 
      icon: CheckCircleIcon 
    },
  ];

  // Replace the dummy teamEfficiencyData with:
  const teamEfficiencyData = dashboardData?.teamEfficiency || [];

  const ganttContainer = useRef(null);

  useEffect(() => {
    // Configure Gantt
    gantt.config.date_format = '%Y-%m-%d';
    gantt.config.work_time = true;
    gantt.config.skip_off_time = true;
    gantt.config.auto_scheduling = true;
    gantt.config.auto_scheduling_strict = true;
    gantt.config.row_height = 40;

    // Configure columns
    gantt.config.columns = [
      { name: 'text', label: 'Task name', tree: true, width: '*' },
      { name: 'start_date', label: 'Start time', align: 'center', width: 120 },
      { name: 'duration', label: 'Duration', align: 'center', width: 100 },
      { 
        name: 'progress', 
        label: 'Progress', 
        align: 'center', 
        width: 100,
        template: (obj) => Math.round(obj.progress * 100) + '%'
      }
    ];

    // Custom task styling
    gantt.templates.task_class = (start, end, task) => {
      if (task.progress >= 1) return 'completed-task';
      if (task.progress >= 0.5) return 'in-progress-task';
      return 'pending-task';
    };

    // Initialize Gantt
    gantt.init(ganttContainer.current);

    return () => {
      gantt.clearAll();
    };
  }, []);

  // Update chart data when dashboardData changes
  useEffect(() => {
    if (dashboardData?.timelineData) {
      gantt.clearAll();
      gantt.parse(dashboardData.timelineData);
    }
  }, [dashboardData]);

  return (
    <Box p={3} gap={3}>
      <h1 className='font-bold text-xl'>Project Dashboard</h1>

      {/* Task Status Cards */}
      <Grid container spacing={3} mb={3}>
        {taskStatusData.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.status}>
            <Card sx={{ bgcolor: item.color }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      {item.status}
                    </Typography>
                    <Typography variant="h4">
                      {item.count}
                    </Typography>
                  </Box>
                  <item.icon sx={{ fontSize: 40, opacity: 0.7 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Team Efficiency Table */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12}>
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Team Member</TableCell>
                    <TableCell align="right">Total Tasks</TableCell>
                    <TableCell align="right">Completed</TableCell>
                    <TableCell align="right">On Time</TableCell>
                    <TableCell align="right">Delayed</TableCell>
                    <TableCell>Efficiency</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(dashboardData?.teamEfficiency || []).map((member) => (
                    <TableRow key={member.name}>
                      <TableCell>{member.name}</TableCell>
                      <TableCell align="right">{member.totalTasks}</TableCell>
                      <TableCell align="right">{member.tasksCompleted}</TableCell>
                      <TableCell align="right">{member.onTime}</TableCell>
                      <TableCell align="right">{member.delayed}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Box width="100%" mr={1}>
                            <LinearProgress 
                              variant="determinate" 
                              value={member.efficiency} 
                              sx={{ 
                                height: 10, 
                                borderRadius: 5,
                                backgroundColor: '#e0e0e0',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: 
                                    member.efficiency >= 90 ? '#81c784' : 
                                    member.efficiency >= 75 ? '#64b5f6' : '#e57373'
                                }
                              }}
                            />
                          </Box>
                          <Box minWidth={35}>
                            <Typography variant="body2" color="textSecondary">
                              {member.efficiency}%
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Project Timeline (Gantt Chart) */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Project Timeline
            </Typography>
            <Box sx={{ height: '400px' }}>
              <div ref={ganttContainer} style={{ width: '100%', height: '100%' }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
