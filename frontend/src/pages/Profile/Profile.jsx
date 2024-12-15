import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
} from '@mui/material';
import { useUser } from '../../contexts/userProvider';
import { useNavigate } from 'react-router-dom';
import { useHttp } from '../../hooks/http-hook';


const Profile = () => {
  const navigate = useNavigate();
  const { sendRequest } = useHttp();
  const { user, removeUser } = useUser();
  const [openEmailForm, setOpenEmailForm] = useState(false);
  const [openPasswordForm, setOpenPasswordForm] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const DELETE_CONFIRMATION_TEXT = "delete my account";

  const handleEmailChange = async (e) => {
    e.preventDefault();
    try {
      await sendRequest({
        url: `/api/users/${user.id}/update-email/`,
        method: 'PUT',
        body: JSON.stringify({ email: newEmail }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access')}`
        }
      });
      setOpenEmailForm(false);
      setNewEmail('');
      setSuccessMessage('Email updated successfully! The changes will take effect on your next login.');
      setOpenSuccessDialog(true);
    } catch (err) {
      setError('Failed to update email');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      await sendRequest({
        url: `/api/users/${user.id}/change-password/`,
        method: 'PUT',
        body: JSON.stringify({
          old_password: passwordForm.oldPassword,
          new_password: passwordForm.newPassword
        }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access')}`
        }
      });
      setOpenPasswordForm(false);
      setPasswordForm({
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
      setSuccessMessage('Password changed successfully! Please use your new password on your next login.');
      setOpenSuccessDialog(true);
    } catch (err) {
      setError('Failed to update password');
    }
  };

  const handleSuccessDialogClose = () => {
    setOpenSuccessDialog(false);
    removeUser();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.toLowerCase() !== DELETE_CONFIRMATION_TEXT) {
      setError('Please type "delete my account" to confirm');
      return;
    }

    try {
      await sendRequest({
        url: `/api/users/${user.id}/delete/`,
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access')}`
        }
      });
      removeUser();
      navigate('/');
    } catch (err) {
      setError('Failed to delete account');
    }
  };


  
  return (
    <Box p={3}>
      <h1 className='text-xl font-bold'>Profile Settings</h1>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Account Information
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1">
            <strong>Username:</strong> {user?.username}
          </Typography>
          <Typography variant="body1">
            <strong>Email:</strong> {user?.email}
          </Typography>
        </Box>
        <Button variant="contained" onClick={() => setOpenEmailForm(true)}>
          Change Email
        </Button>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Security
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => setOpenPasswordForm(true)}
          sx={{ mb: 2 }}
        >
          Change Password
        </Button>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" color="error" gutterBottom>
          Danger Zone
        </Typography>
        <Button 
          variant="outlined" 
          color="error"
          onClick={() => setOpenDeleteConfirm(true)}
        >
          Delete Account
        </Button>
      </Paper>

      {/* Email Change Dialog */}
      <Dialog open={openEmailForm} onClose={() => setOpenEmailForm(false)}>
        <form onSubmit={handleEmailChange}>
          <DialogTitle>Change Email</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="New Email"
              type="email"
              fullWidth
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEmailForm(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={openPasswordForm} onClose={() => setOpenPasswordForm(false)}>
        <form onSubmit={handlePasswordChange}>
          <DialogTitle>Change Password</DialogTitle>
          <DialogContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TextField
              margin="dense"
              label="Current Password"
              type="password"
              fullWidth
              required
              value={passwordForm.oldPassword}
              onChange={(e) => setPasswordForm({
                ...passwordForm,
                oldPassword: e.target.value
              })}
            />
            <TextField
              margin="dense"
              label="New Password"
              type="password"
              fullWidth
              required
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({
                ...passwordForm,
                newPassword: e.target.value
              })}
            />
            <TextField
              margin="dense"
              label="Confirm New Password"
              type="password"
              fullWidth
              required
              value={passwordForm.confirmNewPassword}
              onChange={(e) => setPasswordForm({
                ...passwordForm,
                confirmNewPassword: e.target.value
              })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPasswordForm(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Update Password</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={openDeleteConfirm} onClose={() => {
        setOpenDeleteConfirm(false);
        setDeleteConfirmText('');
        setError('');
      }}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Typography color="error" gutterBottom>
            Warning: This action cannot be undone. All your data will be permanently deleted.
          </Typography>
          <Typography sx={{ mt: 2, mb: 2 }}>
            Please type "delete my account" to confirm:
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            fullWidth
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="delete my account"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenDeleteConfirm(false);
            setDeleteConfirmText('');
            setError('');
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteAccount} 
            variant="contained" 
            color="error"
            disabled={deleteConfirmText.toLowerCase() !== DELETE_CONFIRMATION_TEXT}
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Dialog */}
      <Dialog
        open={openSuccessDialog}
        onClose={handleSuccessDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Success</DialogTitle>
        <DialogContent>
          <Typography>{successMessage}</Typography>
          <Typography sx={{ mt: 2, color: 'text.secondary' }}>
            Please log in again to continue with your updated credentials.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleSuccessDialogClose} 
            variant="contained"
            color="primary"
          >
            Log Out
          </Button>
        </DialogActions>
      </Dialog>

      <div className="desktop:hidden">
        <Button 
        onClick={() => {
            removeUser();
            navigate('/');
        }} 
        variant="contained" 
        color="error"
        >
        Logout
        </Button>
      </div>
    </Box>
  );
};

export default Profile;
