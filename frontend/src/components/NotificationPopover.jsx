import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useHttp } from '../hooks/http-hook';
import { useNavigate } from 'react-router-dom';
import {
  Popover, List, ListItem, ListItemText, Typography,
  Box, IconButton, Divider, Badge, ListItemIcon
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  FolderShared as ProjectIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

const NotificationPopover = ({ anchorEl, onClose }) => {
  const { sendRequest } = useHttp();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const open = Boolean(anchorEl);

  const { data: notificationsData = { results: [] } } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await sendRequest({
        url: '/api/notifications/',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access')}`
        }
      });
      return response;
    }
  });

  const notifications = notificationsData.results || [];
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      return await sendRequest({
        url: `/api/notifications/${notificationId}/mark_read/`,
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access')}`
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  const handleNotificationClick = (notification) => {
    markAsReadMutation.mutate(notification.id);
    
    if (notification.type === 'project') {
      navigate(`projects`);
    } else if (notification.type === 'task') {
      navigate(`tasks`);
    }
    onClose();
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <Box sx={{ width: 360, maxHeight: 480 }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Notifications
            {unreadCount > 0 && (
              <Badge badgeContent={unreadCount} color="error" sx={{ ml: 1 }} />
            )}
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {notifications.length === 0 ? (
            <ListItem>
              <ListItemText primary="No notifications" />
            </ListItem>
          ) : (
            notifications.map((notification) => (
              <ListItem
                key={notification.id}
                button
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  bgcolor: notification.is_read ? 'transparent' : 'action.hover',
                }}
              >
                <ListItemIcon>
                  {notification.type === 'project' ? (
                    <ProjectIcon color="primary" />
                  ) : (
                    <AssignmentIcon color="secondary" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={notification.title}
                  secondary={notification.message}
                />
              </ListItem>
            ))
          )}
        </List>
      </Box>
    </Popover>
  );
};

export default NotificationPopover;