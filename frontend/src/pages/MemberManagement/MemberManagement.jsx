import React, { useState, useEffect } from 'react';
import useHttp from '../../hooks/http-hook';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const MemberManagement = () => {
  const { sendRequest } = useHttp();
  const queryClient = useQueryClient();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });

  // Fetch users query
  const { data: userData, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await sendRequest({
        url: '/api/users/status/',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access')}`
        }
      });
      return response;
    }
  });

  const memberRequests = userData?.pending_users || [];
  const members = userData?.approved_users || [];

  // Rest of your component remains the same, but update these mutations:
  const approveMutation = useMutation({
    mutationFn: async (userId) => {
      return await sendRequest({
        url: `/api/users/${userId}/approval/`,
        method: 'PUT',
        body: JSON.stringify({ is_approved: true }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access')}`
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId) => {
      return await sendRequest({
        url: `/api/users/${userId}/delete/`,
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access')}`
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      setOpenDeleteDialog(false);
      setSelectedMember(null);
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (userId) => {
      return await sendRequest({
        url: `/api/users/${userId}/delete/`,
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access')}`
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    }
  });

  const handleApproveRequest = (request) => {
    approveMutation.mutate(request.id, {
      onSuccess: () => {
        setAlert({
          show: true,
          message: `Approved ${request.username}'s request`,
          severity: 'success'
        });
      },
      onError: (error) => {
        setAlert({
          show: true,
          message: error.message || 'Failed to approve request',
          severity: 'error'
        });
      }
    });
  };

  const handleRejectRequest = (request) => {
    rejectMutation.mutate(request.id, {
      onSuccess: () => {
        setAlert({
          show: true,
          message: `Rejected ${request.username}'s request`,
          severity: 'info'
        });
      },
      onError: (error) => {
        setAlert({
          show: true,
          message: error.message || 'Failed to reject request',
          severity: 'error'
        });
      }
    });
  };

  const handleDeleteMember = (member) => {
    setSelectedMember(member);
    setOpenDeleteDialog(true);
  };

  const confirmDeleteMember = () => {
    if (selectedMember) {
      deleteMutation.mutate(selectedMember.id, {
        onSuccess: () => {
          setAlert({
            show: true,
            message: `Removed ${selectedMember.username} from the team`,
            severity: 'success'
          });
        },
        onError: (error) => {
          setAlert({
            show: true,
            message: error.message || 'Failed to delete member',
            severity: 'error'
          });
        }
      });
    }
  };

  return (
    <Box p={3}>
      <h1 className='font-bold text-xl'>Member Management</h1>

      {alert.show && (
        <Alert 
          severity={alert.severity} 
          sx={{ mb: 3 }}
          onClose={() => setAlert({ ...alert, show: false })}
        >
          {alert.message}
        </Alert>
      )}

      {/* Member Requests Section */}
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Pending Requests
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Request Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {memberRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No pending requests
                </TableCell>
              </TableRow>
            ) : (
              memberRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.username}</TableCell>
                  <TableCell>{request.email}</TableCell>
                  <TableCell>{request.requestDate}</TableCell>
                  <TableCell>
                    <IconButton 
                      color="success"
                      onClick={() => handleApproveRequest(request)}
                      size="small"
                    >
                      <CheckIcon />
                    </IconButton>
                    <IconButton 
                      color="error"
                      onClick={() => handleRejectRequest(request)}
                      size="small"
                    >
                      <CloseIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Current Members Section */}
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Current Members
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Join Date</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>{member.username}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.joinDate}</TableCell>
                <TableCell>
                  <Chip 
                    label={member.role}
                    color="primary"
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton 
                    color="error"
                    onClick={() => handleDeleteMember(member)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>
          Remove Member
        </DialogTitle>
        <DialogContent>
          Are you sure you want to remove {selectedMember?.username} from the team?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button 
            onClick={confirmDeleteMember}
            color="error"
            variant="contained"
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MemberManagement;