import { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    InputAdornment,
    Alert,
    CircularProgress,
    Collapse,
} from '@mui/material';
import { EmailOutlined, LockOutlined, ArrowBack } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

export default function ForgotPasswordModal() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please enter both email and new password.');
            return;
        }

        setLoading(true);
        try {
            // API call untuk reset password
            // const response = await fetch('/api/auth/reset-password', {
            // 	method: 'POST',
            // 	headers: { 'Content-Type': 'application/json' },
            // 	body: JSON.stringify({ email, password }),
            // });
            // if (!response.ok) throw new Error('Failed to reset password');
            
            setTimeout(() => {
                setLoading(false);
                setSuccess(true);
                setEmail('');
                setPassword('');
            }, 1200);
        } catch (err) {
            setLoading(false);
            setError('Failed to reset password. Please try again.');
        }
    };

    return (
        <Box
            sx={{
			width: '100vw',
			height: '100vh',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			background: 'linear-gradient(135deg, #f0f4ff 0%, #e8edf8 50%, #eef2fb 100%)',
			position: 'fixed',
			top: 0,
			left: 0,
			margin: 0,
			padding: 0,
			overflow: 'hidden',
		}}
        >
            <Card
                elevation={0}
                sx={{
                    width: '100%',
                    maxWidth: 440,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'rgba(99,102,241,0.12)',
                    boxShadow: '0 8px 40px rgba(99,102,241,0.10), 0 1px 4px rgba(0,0,0,0.06)',
                    overflow: 'hidden',
                }}
            >
                <Box
                    sx={{
                        height: 4,
                        background: 'linear-gradient(90deg, #6366f1 0%, #3b82f6 100%)',
                    }}
                />

                <CardContent sx={{ p: 4 }}>
                    <Button
                        component={RouterLink}
                        to="/"
                        startIcon={<ArrowBack sx={{ fontSize: 18 }} />}
                        size="small"
                        sx={{
                            mb: 2,
                            color: 'text.secondary',
                            textTransform: 'none',
                            fontWeight: 500,
                            px: 0,
                            '&:hover': { background: 'transparent', color: '#6366f1' },
                        }}
                    >
                        Back to Sign In
                    </Button>

                    <Typography variant="h6" fontWeight={700} color="text.primary" mb={0.5}>
                        Reset your password
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={3}>
                        Enter your email and new password to reset your account.
                    </Typography>

                    <Collapse in={success}>
                        <Alert severity="success" sx={{ borderRadius: 2, mb: 3 }}>
                            <Typography fontWeight={600} fontSize={14}>
                                Password reset successful!
                            </Typography>
                            <Typography fontSize={13}>
                                Your password has been updated. You can now sign in with your new password.
                            </Typography>
                        </Alert>
                    </Collapse>

                    <Collapse in={!success}>
                        <Collapse in={!!error}>
                            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
                                {error}
                            </Alert>
                        </Collapse>

                        <Box component="form" onSubmit={handleResetPassword} noValidate>
                            <TextField
                                fullWidth
                                label="Email Address"
                                type="email"
                                placeholder="admin@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                size="medium"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailOutlined sx={{ color: 'text.disabled', fontSize: 20 }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ mb: 3 }}
                            />

                            <TextField
                                fullWidth
                                label="New Password"
                                type="password"
                                placeholder="Enter your new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                size="medium"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockOutlined sx={{ color: 'text.disabled', fontSize: 20 }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ mb: 3 }}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={loading}
                                size="large"
                                sx={{
                                    height: 48,
                                    borderRadius: 2,
                                    fontWeight: 600,
                                    fontSize: 15,
                                    textTransform: 'none',
                                    background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
                                    boxShadow: '0 4px 16px rgba(99,102,241,0.30)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #4f51e0, #2563eb)',
                                        boxShadow: '0 6px 20px rgba(99,102,241,0.38)',
                                    },
                                    '&.Mui-disabled': {
                                        background: 'rgba(99,102,241,0.4)',
                                        color: '#fff',
                                    },
                                }}
                            >
                                {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Reset Password'}
                            </Button>
                        </Box>
                    </Collapse>
                </CardContent>
            </Card>
        </Box>
    );
}