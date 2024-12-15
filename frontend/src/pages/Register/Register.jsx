// frontend/src/pages/Register/Register.jsx
import {useState, useRef} from 'react'
import { useNavigate } from 'react-router-dom';
import useHttp from '../../hooks/http-hook';
import { useUser } from '../../contexts/userProvider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { CircularProgress, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useMutation } from '@tanstack/react-query';
import { register } from '../../lib/auth';

// Components
import TextField from '../../components/TextField';
import CustomButton from '../../components/Button';
import useCustomSnackbar from '../../hooks/useCustomSnackbar';

const Register = () => {
    const navigate = useNavigate();
    const { SnackbarComponent, showSnackbar } = useCustomSnackbar();
    const { setUser } = useUser();
    const [openSuccessDialog, setOpenSuccessDialog] = useState(false);

    const usernameRef = useRef(null);
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const confirmPasswordRef = useRef(null);

    const registerMutation = useMutation({
        mutationFn: async (data) => {
            try {
                const result = await register(data);
                return result;
            } catch (error) {
                throw error;
            }
        },
        onSuccess: (data) => {
            setOpenSuccessDialog(true);
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.error || error.message;
            showSnackbar(errorMessage, 'error');
        }
    });

    const handleRegister = async () => {
        if (!emailRef.current.value || !usernameRef.current.value ||
            !passwordRef.current.value || !confirmPasswordRef.current.value) {
            showSnackbar('Fill in all required fields', 'error');
            return;
        }

        if (passwordRef.current.value !== confirmPasswordRef.current.value) {
            showSnackbar('Passwords do not match', 'error');
            return;
        }

        registerMutation.mutate({
            username: usernameRef.current.value,
            email: emailRef.current.value,
            password: passwordRef.current.value,
        });
    };

    const handleCloseSuccessDialog = () => {
        setOpenSuccessDialog(false);
        navigate('/');
    };

    return (
        <div>
            <SnackbarComponent />
            <section className='h-screen flex bg-white items-center justify-start flex-col'>
                <div className='py-32 px-20 w-[35rem] phone:p-28 flex flex-col gap-8'>
                    <div className='flex items-center justify-center gap-10'>
                        <div>
                            <h1 className='text-heading-1 flex-1 font-bold text-center'>Register</h1>
                            <p>Project Management System</p>
                        </div>
                    </div>
                    <div className='flex flex-col gap-5'>
                        {/* <TextField 
                            title={"Fullname"} 
                            ref={fullnameRef} 
                            type="text" 
                            placeholder="Enter your fullname here..." 
                            required
                        /> */}
                        <TextField 
                            title={"Username"} 
                            ref={usernameRef} 
                            type="text" 
                            placeholder="Enter username here..."
                        />
                        <TextField 
                            title={"Email"} 
                            ref={emailRef} 
                            type="email" 
                            placeholder="Enter email here..." 
                            required
                        />
                        <TextField 
                            title={"Password"} 
                            ref={passwordRef} 
                            type="password" 
                            placeholder="Enter Password here" 
                            required
                        />
                        <TextField 
                            title={"Confirm Password"} 
                            ref={confirmPasswordRef} 
                            type="password" 
                            placeholder="Confirm Password here" 
                            required
                        />                    
                    </div>
                    <div>
                        <CustomButton 
                            onClick={handleRegister} 
                            disabled={registerMutation.isLoading}
                        >
                            {registerMutation.isLoading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
                        </CustomButton>
                    </div>
                    <a 
                        className='text-sm text-primary text-center cursor-pointer' 
                        href="#" 
                        onClick={() => navigate('/')}
                    >
                        Already have an account?
                    </a>
                </div>
            </section>

            {/* Success Dialog */}
            <Dialog
                open={openSuccessDialog}
                onClose={handleCloseSuccessDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
                    <CheckCircleIcon 
                        color="success" 
                        sx={{ fontSize: 60, mb: 2 }}
                    />
                    <Typography variant="h5" component="div">
                        Registration Submitted
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography align="center" sx={{ mb: 2 }}>
                        Your registration has been submitted successfully. Please wait for the project manager to approve your account.
                        You will be notified once your account is approved.
                    </Typography>
                    <Typography align="center" color="text.secondary">
                        You can now close this window and log in once your account is approved.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                    <Button 
                        variant="contained" 
                        onClick={handleCloseSuccessDialog}
                        sx={{ minWidth: 120 }}
                    >
                        Got it
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default Register;