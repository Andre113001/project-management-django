import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { login } from '../../lib/auth'; // Import the login function
import useCustomSnackbar from '../../hooks/useCustomSnackbar';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { useUser } from '../../contexts/userProvider';

const Login = () => {
    const navigate = useNavigate();
    const { SnackbarComponent, showSnackbar } = useCustomSnackbar();
    const { setUser } = useUser();
    const accessKeyRef = useRef(null);
    const password = useRef(null);
    
    const loginMutation = useMutation({
        mutationFn: (data) => login(data),
        onSuccess: (data) => {
            // Store tokens and user data
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('access', data.access);
            localStorage.setItem('refresh', data.refresh);
            setUser(data.user); // Set the parsed user object in context
            navigate('/dashboard');
        },
        onError: (error) => {
            showSnackbar(error?.response?.data?.error || 'Email/Username or Password is incorrect', 'error');
        }
    });

    const handleLogin = () => {
        const accessKey = accessKeyRef.current.value;
        const passwordValue = password.current.value;

        if (!accessKey || !passwordValue) {
            showSnackbar('Enter your Username or Email & Password');
            return;
        }

        loginMutation.mutate({
            username: accessKey,
            password: passwordValue
        });
    }

    return (
        <div>
            <SnackbarComponent />
            <section className='h-screen flex bg-white items-center justify-start flex-col'>
                <div className='py-32 px-20 w-[35rem] phone:p-28 flex flex-col gap-8'>
                    <div className='flex items-center justify-center gap-10'>
                        <div>
                            <h1 className='text-heading-1 flex-1 font-bold text-center'>Sign-In</h1>
                            <p>Project Management System</p>
                        </div>
                    </div>
                    <div className='flex flex-col gap-5'>
                        <TextField title={"Email or Username"} ref={accessKeyRef} type="text" placeholder="Enter username or email here..."/>
                        <TextField title={"Password"} ref={password} type="password" placeholder="Enter Password here"/>                    
                    </div>
                    <div>
                        <Button onClick={handleLogin} disabled={loginMutation.isLoading}>
                            Log in
                        </Button>
                    </div>
                    <a className='text-sm text-primary text-center cursor-pointer' href="#" onClick={() => navigate('/register')}>Don't have an account yet?</a>
                </div>
            </section>
        </div>
    )
}

export default Login;
