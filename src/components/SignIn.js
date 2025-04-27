import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
    TextField,
    Alert,
    Box,
    Container,
    Typography,
    Button,
    Paper,
    Stack,
    useTheme,
    alpha
} from '@mui/material';

export const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const theme = useTheme();
    
    const { signIn, loginAsGuest } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await signIn(email, password);
            navigate('/projects');
        } catch (err) {
            console.error('Sign in error:', err);
            setError('Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGuestLogin = async () => {
        setError('');
        setIsLoading(true);

        try {
            await loginAsGuest();
            navigate('/projects');
        } catch (err) {
            console.error('Guest login error:', err);
            setError('Failed to sign in as guest');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                py: 4,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`
            }}
        >
            <Container maxWidth="sm">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: 4,
                            overflow: 'hidden',
                            border: '1px solid',
                            borderColor: theme.palette.divider,
                            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.05)'
                        }}
                    >
                        <Box sx={{ px: 4, py: 6 }}>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <Typography
                                    variant="h3"
                                    sx={{
                                        fontWeight: 600,
                                        mb: 1,
                                        textAlign: 'center',
                                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent'
                                    }}
                                >
                                    Welcome to Marchina
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: 'text.secondary',
                                        textAlign: 'center',
                                        mb: 4,
                                        fontSize: '1.1rem'
                                    }}
                                >
                                    Sign in or create a new account
                                </Typography>
                            </motion.div>

                            <form onSubmit={handleSubmit}>
                                <Stack spacing={2.5}>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            <Alert 
                                                severity="error"
                                                sx={{
                                                    borderRadius: 2,
                                                    border: '1px solid',
                                                    borderColor: 'error.light'
                                                }}
                                            >
                                                {error}
                                            </Alert>
                                        </motion.div>
                                    )}
                                    
                                    <TextField
                                        required
                                        fullWidth
                                        id="email"
                                        label="Email Address"
                                        name="email"
                                        autoComplete="email"
                                        autoFocus
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isLoading}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                bgcolor: 'background.paper'
                                            }
                                        }}
                                    />
                                    
                                    <TextField
                                        required
                                        fullWidth
                                        name="password"
                                        label="Password"
                                        type="password"
                                        id="password"
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={isLoading}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                bgcolor: 'background.paper'
                                            }
                                        }}
                                    />

                                    <Stack spacing={2} sx={{ mt: 2 }}>
                                        <Button
                                            component={motion.button}
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                            type="submit"
                                            disabled={isLoading}
                                            variant="contained"
                                            size="large"
                                            sx={{
                                                py: 1.5,
                                                borderRadius: 2,
                                                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #5558e6 0%, #9d47f5 100%)'
                                                }
                                            }}
                                        >
                                            {isLoading ? 'Signing in...' : 'Sign In / Create Account'}
                                        </Button>

                                        <Button
                                            component={motion.button}
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                            type="button"
                                            onClick={handleGuestLogin}
                                            disabled={isLoading}
                                            variant="outlined"
                                            size="large"
                                            sx={{
                                                py: 1.5,
                                                borderRadius: 2,
                                                borderColor: alpha(theme.palette.primary.main, 0.2),
                                                color: 'text.primary',
                                                '&:hover': {
                                                    borderColor: 'primary.main',
                                                    bgcolor: alpha(theme.palette.primary.main, 0.02)
                                                }
                                            }}
                                        >
                                            {isLoading ? 'Signing in...' : 'Continue as Guest'}
                                        </Button>
                                    </Stack>
                                </Stack>
                            </form>
                        </Box>

                        <Box
                            sx={{
                                px: 4,
                                py: 3,
                                bgcolor: alpha(theme.palette.background.paper, 0.4),
                                borderTop: '1px solid',
                                borderColor: theme.palette.divider
                            }}
                        >
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                align="center"
                            >
                                By signing in, you agree to our Terms of Service and Privacy Policy
                            </Typography>
                        </Box>
                    </Paper>

                    <Typography
                        component={motion.p}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        variant="body2"
                        color="text.secondary"
                        align="center"
                        sx={{ mt: 4 }}
                    >
                        © 2025 Marchina. All rights reserved.
                    </Typography>
                </motion.div>
            </Container>
        </Box>
    );
}; 