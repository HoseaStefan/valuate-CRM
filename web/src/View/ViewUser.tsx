import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Typography,
  Button,
} from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import DashboardLayout from '../component/DashboardLayout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { fetchEndpoint } from '../fetchEndpoint';

interface UserDetail {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  photoPath: string | null;
  role: string;
  managerId: string | null;
  baseSalary: number;
  createdAt: string;
  updatedAt: string;
}

export default function ViewUser() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<UserDetail | null>(location.state?.user || null);
  const [managerName, setManagerName] = useState<string>('-');
  const [loading, setLoading] = useState(!location.state?.user);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      // If we already have user data from state, don't fetch again
      if (location.state?.user) {
        // Get manager name if managerId exists
        if (location.state.user.managerId) {
          try {
            const token = localStorage.getItem('token');
            const managerData = await fetchEndpoint(`/api/users/${location.state.user.managerId}`, 'GET', token);
            setManagerName(managerData.fullName);
          } catch (err) {
            setManagerName('Unknown');
          }
        }
        setLoading(false);
        return;
      }

      // Otherwise fetch from API
      if (!userId) return;
      try {
        const token = localStorage.getItem('token');
        const userData = await fetchEndpoint(`/api/users/${userId}`, 'GET', token);
        setUser(userData);

        // Fetch manager name if managerId exists
        if (userData.managerId) {
          try {
            const managerData = await fetchEndpoint(`/api/users/${userData.managerId}`, 'GET', token);
            setManagerName(managerData.fullName);
          } catch (err) {
            setManagerName('Unknown');
          }
        }
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, location.state]);

  if (loading) {
    return (
      <DashboardLayout currentPage="user-management">
        <Typography variant="body1" color="text.secondary">Loading...</Typography>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout currentPage="user-management">
        <Typography variant="h5" color="error">Error: {error}</Typography>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout currentPage="user-management">
        <Typography variant="h5">User not found</Typography>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="user-management">
      <Box mb={3}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/user-management')}>
          Back to User List
        </Button>
      </Box>
      <Card variant="outlined">
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Avatar src={user.photoPath || undefined} sx={{ width: 120, height: 120, margin: 'auto' }} />
              <Typography variant="h5" mt={2}>{user.fullName}</Typography>
              <Typography variant="body1" color="text.secondary">{user.email}</Typography>
              <Chip label={user.role} color="primary" size="small" sx={{ mt: 1 }} />
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>User Details</Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Role</Typography>
                  <Typography variant="body1">{user.role}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Manager</Typography>
                  <Typography variant="body1">{managerName}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{user.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Phone Number</Typography>
                  <Typography variant="body1">{user.phoneNumber}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                  <Typography variant="body1">{user.address}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Base Salary</Typography>
                  <Typography variant="body1">Rp {user.baseSalary.toLocaleString('id-ID')}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Date Joined</Typography>
                  <Typography variant="body1">{new Date(user.createdAt).toLocaleDateString('id-ID')}</Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
