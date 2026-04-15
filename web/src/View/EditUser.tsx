import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../component/DashboardLayout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Mock data
const users = [
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'Admin', manager: 'System', status: 'Active', avatar: '/avatars/avatar-1.png', phone: '081234567890', address: '123 Main St, Anytown, USA' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Manager', manager: 'John Doe', status: 'Active', avatar: '/avatars/avatar-2.png', phone: '081234567891', address: '456 Oak Ave, Anytown, USA' },
    { id: 3, name: 'Peter Jones', email: 'peter.jones@example.com', role: 'Employee', manager: 'Jane Smith', status: 'Inactive', avatar: '/avatars/avatar-3.png', phone: '081234567892', address: '789 Pine Ln, Anytown, USA' },
    { id: 4, name: 'Sarah Miller', email: 'sarah.miller@example.com', role: 'Employee', manager: 'Jane Smith', status: 'Active', avatar: '/avatars/avatar-4.png', phone: '081234567893', address: '101 Maple Dr, Anytown, USA' },
];

export default function EditUser() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const user = users.find((u) => u.id === Number(userId));
  
  // In a real app, you'd have more robust state management
  const [formData, setFormData] = useState(user);

  if (!formData) {
    return (
      <DashboardLayout>
        <Typography variant="h5">User not found</Typography>
      </DashboardLayout>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Updated data:', formData);
    // Here you would typically call an API to update the user
    navigate(`/user/${userId}`);
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
          <Typography variant="h6" gutterBottom>Edit User</Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3} mt={1}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select label="Role" name="role" value={formData.role} onChange={handleSelectChange}>
                    <MenuItem value="Admin">Admin</MenuItem>
                    <MenuItem value="Manager">Manager</MenuItem>
                    <MenuItem value="Employee">Employee</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select label="Status" name="status" value={formData.status} onChange={handleSelectChange}>
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Address" name="address" value={formData.address} onChange={handleChange} multiline rows={3} />
              </Grid>
              <Grid item xs={12} sx={{ textAlign: 'right' }}>
                <Button type="submit" variant="contained">Save Changes</Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
