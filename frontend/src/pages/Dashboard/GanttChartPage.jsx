import React, { useEffect, useRef } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import { gantt } from 'dhtmlx-gantt';
import { useQuery } from '@tanstack/react-query';
import useHttp from '../../hooks/http-hook';
import Back from '../../components/Back'

const GanttChartPage = () => {
  const { sendRequest } = useHttp();
  const { data: dashboardData } = useQuery({
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

  const ganttContainer = useRef(null);

  useEffect(() => {
    // Configure Gantt
    gantt.config.date_format = '%Y-%m-%d';
    gantt.config.work_time = true;
    gantt.config.skip_off_time = true;
    gantt.config.auto_scheduling = true;
    gantt.config.auto_scheduling_strict = true;
    gantt.config.row_height = 40;

    // Enable task editing
    gantt.config.drag_progress = true;
    gantt.config.drag_resize = true;
    gantt.config.drag_links = true;
    gantt.config.drag_move = true;

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
      },
      { name: 'add', label: '', width: 44 }
    ];

    // Custom task styling
    gantt.templates.task_class = (start, end, task) => {
      if (task.progress >= 1) return 'completed-task';
      if (task.progress >= 0.5) return 'in-progress-task';
      return 'pending-task';
    };

    // Custom progress bar styling
    gantt.templates.progress_text = (start, end, task) => {
      return Math.round(task.progress * 100) + '%';
    };

    // Initialize Gantt
    gantt.init(ganttContainer.current);

    // Event handlers
    gantt.attachEvent('onAfterTaskUpdate', (id, item) => {
      console.log('Task updated:', item);
      // Here you would typically make an API call to update the backend
    });

    gantt.attachEvent('onAfterLinkAdd', (id, item) => {
      console.log('Link added:', item);
      // Here you would typically make an API call to update the backend
    });

    // Cleanup
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
    <Box p={3}>
      <Back to='/dashboard'/>
      <h1 className='font-bold text-xl'>Project Timeline</h1>
      <Paper sx={{ p: 2, height: 'calc(100vh - 200px)' }}>
        <div ref={ganttContainer} style={{ width: '100%', height: '100%' }} />
      </Paper>
    </Box>
  );
};

export default GanttChartPage;