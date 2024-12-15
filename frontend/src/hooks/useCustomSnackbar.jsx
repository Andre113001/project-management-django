import { useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

const useCustomSnackbar = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('info');

  const handleSnackbarClose = () => {
    setOpen(false);
  };

  const showSnackbar = (newMessage, newStatus = 'info') => {
    setMessage(newMessage);
    setStatus(newStatus);
    setOpen(true);
  };

  const SnackbarComponent = () => (
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      open={open}
      autoHideDuration={3000}
      onClose={handleSnackbarClose}
    >
      <Alert severity={status} onClose={handleSnackbarClose}>
        {message}
      </Alert>
    </Snackbar>
  );

  return { showSnackbar, SnackbarComponent };
};

export default useCustomSnackbar;
