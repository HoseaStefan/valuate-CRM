import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../component/DashboardLayout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useEffect } from 'react';
import { fetchEndpoint } from '../fetchEndpoint';

export default function AssignManager() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [potentialManagers, setPotentialManagers] = useState<any[]>([]);
  const [selectedManager, setSelectedManager] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = await fetchEndpoint(`/api/users/${userId}`, 'GET', token);
        setUser(userData);
        setSelectedManager(userData?.managerId || '');
        
        const allUsers = await fetchEndpoint('/api/users', 'GET', token);
        const managers = allUsers.filter((u: any) => 
          (u.role === 'admin' || u.role === 'staff') && u.id !== userId
        );
        setPotentialManagers(managers);
      } catch (error) {
        console.error("Error fetching data for assign manager", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  if (loading) return <DashboardLayout><Typography>Loading...</Typography></DashboardLayout>;

  if (!user) {
    return (
      <DashboardLayout>
        <Typography variant="h5">User not found</Typography>
      </DashboardLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await fetchEndpoint(`/api/users/${userId}`, 'PUT', token, { managerId: selectedManager || null });
      navigate(`/user-management`);
    } catch (error) {
      console.error('Error assigning manager:', error);
      alert('Failed to assign manager');
    }
  };

  return (
    <DashboardLayout currentPage="user-management">
      <Box mb={3}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/user-management')}>
          Back to User List
        </Button>
      </Box>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>Assign Manager</Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Assign a manager for <strong>{user.fullName}</strong>.
          </Typography>
          <form onSubmit={handleSubmit}>
            <FormControl fullWidth>
              <InputLabel>Select Manager</InputLabel>
              <Select
                label="Select Manager"
                value={selectedManager}
                onChange={(e) => setSelectedManager(e.target.value)}
              >
                {potentialManagers.map(manager => (
                  <MenuItem key={manager.id} value={manager.id}>
                    {manager.fullName}
                  </MenuItem>
                ))}
                <MenuItem value="">None</MenuItem>
              </Select>
            </FormControl>
            <Box mt={3} sx={{ textAlign: 'right' }}>
              <Button type="submit" variant="contained">Assign</Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
