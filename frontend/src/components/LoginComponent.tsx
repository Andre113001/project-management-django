// src/components/LoginForm.tsx
import { useForm } from '@mantine/form';
import { TextInput, PasswordInput, Button, Box } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import { login, LoginData } from '../lib/auth';
import { useNavigate } from 'react-router-dom';

export function LoginForm() {
  const navigate = useNavigate();
  const form = useForm({
    initialValues: {
      username: '',
      password: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginData) => login(data),
    onSuccess: (data) => {
      // Store tokens
      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      // Redirect to dashboard
      navigate('/dashboard');
    },
  });

  return (
    <Box maw={400} mx="auto">
      <form onSubmit={form.onSubmit((values) => loginMutation.mutate(values))}>
        <TextInput
          label="Username"
          placeholder="Your username"
          {...form.getInputProps('username')}
        />
        <PasswordInput
          label="Password"
          placeholder="Your password"
          mt="md"
          {...form.getInputProps('password')}
        />
        <Button
          type="submit"
          mt="md"
          loading={loginMutation.isPending}
        >
          Login
        </Button>
      </form>
    </Box>
  );
}