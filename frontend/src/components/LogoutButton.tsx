import { Button } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { logout } from '../lib/auth';

export function LogoutButton() {
  const navigate = useNavigate();
  
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      navigate('/login');
    },
  });

  return (
    <Button 
      onClick={() => logoutMutation.mutate()}
      loading={logoutMutation.isPending}
    >
      Logout
    </Button>
  );
}