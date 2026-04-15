import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Link,
  Divider,
  CircularProgress,
  Alert,
  Collapse,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  LockOutlined,
  EmailOutlined,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchEndpoint } from '../fetchEndpoint';

const LoginModal: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');

    try {
      const response = await fetchEndpoint('/auth/login', 'POST', null, { 
        email, 
        password 
      });
      
      if (response && response.token) {
        login(response.token);
        setEmail('');
        setPassword('');
        navigate('/dashboard', { replace: true });
      } else {
        throw new Error(response?.message || 'Invalid login credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        setLoginError(error.message || 'An error occurred during login');
      } else {
        setLoginError('An error occurred during login');
      }
    } finally {
      setIsLoading(false);
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
      {/* Decorative blobs */}
      <Box
        sx={{
          position: 'absolute',
          top: '-80px',
          right: '-80px',
          width: 340,
          height: 340,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-100px',
          left: '-80px',
          width: 380,
          height: 380,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Card */}
      <Card
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 440,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'rgba(99,102,241,0.12)',
          boxShadow: '0 8px 40px rgba(99,102,241,0.10), 0 1px 4px rgba(0,0,0,0.06)',
          position: 'relative',
          zIndex: 1,
          overflow: 'hidden',
          mx: 2,
        }}
      >
        {/* Top accent bar */}
        <Box
          sx={{
            height: 4,
            background: 'linear-gradient(90deg, #6366f1 0%, #3b82f6 100%)',
          }}
        />

        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1.5,
                  background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(99,102,241,0.35)',
                }}
              >
                <Typography
                  sx={{
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: 13,
                    letterSpacing: '0.05em',
                  }}
                >
                  CRM
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={700} color="text.primary">
                Admin Page
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Sign in to your account to continue
            </Typography>
          </Box>

          <Collapse in={!!loginError}>
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
              {loginError}
            </Alert>
          </Collapse>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              size="medium"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlined sx={{ color: 'text.disabled', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }
              }}
              sx={{ mb: 2.5 }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              size="medium"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined sx={{ color: 'text.disabled', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        tabIndex={-1}
                        size="small"
                      >
                        {showPassword ? (
                          <VisibilityOff sx={{ fontSize: 20 }} />
                        ) : (
                          <Visibility sx={{ fontSize: 20 }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }
              }}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
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
              {isLoading ? (
                <CircularProgress size={22} sx={{ color: '#fff' }} />
              ) : (
                'Sign In'
              )}
            </Button>
          </Box>

          <Divider sx={{ my: 3, borderColor: 'rgba(0,0,0,0.07)' }} />

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Forgot your password?{' '}
              <Link
                component={RouterLink}
                to="/forgot-password"
                underline="hover"
                sx={{
                  fontWeight: 600,
                  color: '#6366f1',
                  cursor: 'pointer',
                  fontSize: 'inherit',
                  '&:hover': { color: '#4f51e0' },
                }}
              >
                Reset Password
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Footer note */}
      <Typography
        variant="caption"
        color="text.disabled"
        sx={{ position: 'absolute', bottom: 16, textAlign: 'center', width: '100%' }}
      >
        © {new Date().getFullYear()} CRM Admin · All rights reserved
      </Typography>
    </Box>
  );
}

export default LoginModal;