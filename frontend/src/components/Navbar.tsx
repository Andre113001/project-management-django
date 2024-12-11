// src/components/Navbar.tsx
import {  Container } from '@mantine/core';
import { LogoutButton } from './LogoutButton';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
    const { userId, isAuthenticated } = useAuth();
  return (
      <Container style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
        <div>Project Management</div>
        {isAuthenticated && (
          <>
            <h1>Welcome, {userId}</h1>
            <LogoutButton />
          </>
        )}
        </Container>
  );
}