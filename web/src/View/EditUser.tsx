import { useState, useEffect } from 'react';
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
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../component/DashboardLayout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { fetchEndpoint } from '../fetchEndpoint';

interface UserData {
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

export default function EditUser() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState<UserData | null>(location.state?.user || null);
  const [loading, setLoading] = useState(!location.state?.user);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (location.state?.user) {
        setLoading(false);
        return;
      }

      if (!userId) return;
      try {
        const token = localStorage.getItem('token');
        const userData = await fetchEndpoint(`/api/users/${userId}`, 'GET', token);
        setFormData(userData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, location.state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !userId) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      // Prepare update data
      const updateData = {
        email: formData.email,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        photoPath: formData.photoPath,
        role: formData.role,
        managerId: formData.managerId,
        baseSalary: formData.baseSalary,
      };

      await fetchEndpoint(`/api/users/${userId}`, 'PUT', token, updateData);
      
      // Show success message and navigate back
      alert('User updated successfully');
      navigate(`/user/${userId}`, { state: { user: formData } });
    } catch (err) {
      alert('Failed to update user: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

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

  if (!formData) {
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
          <Typography variant="h6" gutterBottom>Edit User</Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3} mt={1}>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Full Name" 
                  name="fullName" 
                  value={formData.fullName} 
                  onChange={handleChange} 
                  required 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Email" 
                  name="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select 
                    label="Role" 
                    name="role" 
                    value={formData.role} 
                    onChange={handleSelectChange}
                  >
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="staff">Staff</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Phone Number" 
                  name="phoneNumber" 
                  value={formData.phoneNumber} 
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Base Salary" 
                  name="baseSalary" 
                  type="number" 
                  value={formData.baseSalary} 
                  onChange={handleChange}
                  required
                  inputProps={{ step: '0.01', min: '0' }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Address" 
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange} 
                  multiline 
                  rows={3}
                  required
                />
              </Grid>
              <Grid item xs={12} sx={{ textAlign: 'right' }}>
                <Button 
                  type="submit" 
                  variant="contained"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
