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
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../component/DashboardLayout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Mock data - in a real app, you'd fetch this based on ID
const users = [
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'Admin', manager: 'System', status: 'Active', avatar: '/avatars/avatar-1.png', phone: '081234567890', address: '123 Main St, Anytown, USA' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Manager', manager: 'John Doe', status: 'Active', avatar: '/avatars/avatar-2.png', phone: '081234567891', address: '456 Oak Ave, Anytown, USA' },
    { id: 3, name: 'Peter Jones', email: 'peter.jones@example.com', role: 'Employee', manager: 'Jane Smith', status: 'Inactive', avatar: '/avatars/avatar-3.png', phone: '081234567892', address: '789 Pine Ln, Anytown, USA' },
    { id: 4, name: 'Sarah Miller', email: 'sarah.miller@example.com', role: 'Employee', manager: 'Jane Smith', status: 'Active', avatar: '/avatars/avatar-4.png', phone: '081234567893', address: '101 Maple Dr, Anytown, USA' },
];

export default function ViewUser() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const user = users.find((u) => u.id === Number(userId));

  if (!user) {
    return (
      <DashboardLayout>
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
              <Avatar src={user.avatar} sx={{ width: 120, height: 120, margin: 'auto' }} />
              <Typography variant="h5" mt={2}>{user.name}</Typography>
              <Typography variant="body1" color="text.secondary">{user.email}</Typography>
              <Chip label={user.status} color={user.status === 'Active' ? 'success' : 'error'} size="small" sx={{ mt: 1 }} />
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
                  <Typography variant="body1">{user.manager}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                  <Typography variant="body1">{user.phone}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                  <Typography variant="body1">{user.address}</Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
