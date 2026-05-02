import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../component/DashboardLayout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useEffect } from 'react';
import { fetchEndpoint } from '../fetchEndpoint';

const initialFormState = {
    basicSalary: '',
    allowance: '',
    deductions: '',
    paymentPeriod: 'Monthly',
};

export default function AddSalary() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = await fetchEndpoint(`/api/users/${userId}`, 'GET', token);
        setUser(userData);
        if (userData?.baseSalary) {
          setFormData(prev => ({ ...prev, basicSalary: userData.baseSalary.toString() }));
        }
      } catch (error) {
        console.error("Error fetching data for add salary", error);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Allow only numbers for salary fields
    if (['basicSalary', 'allowance', 'deductions'].includes(name)) {
        if (/^\d*\.?\d*$/.test(value)) {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        baseSalary: parseFloat(formData.basicSalary) || 0,
      };
      await fetchEndpoint(`/api/users/${userId}`, 'PUT', token, payload);
      navigate(`/user-management`);
    } catch (error) {
      console.error('Error updating salary:', error);
      alert('Failed to save salary');
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
          <Typography variant="h6" gutterBottom>Add Salary for {user.fullName}</Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3} mt={1}>
              <Grid size={{ xs: 12, sm: 6}}>
                <TextField
                  fullWidth
                  label="Basic Salary"
                  name="basicSalary"
                  value={formData.basicSalary}
                  onChange={handleChange}
                  required
                  type="text" // Use text to manage numeric input with regex
                  inputProps={{ inputMode: 'decimal' }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6}}>
                <FormControl fullWidth>
                  <InputLabel>Payment Period</InputLabel>
                  <Select label="Payment Period" name="paymentPeriod" value={formData.paymentPeriod} onChange={handleSelectChange}>
                    <MenuItem value="Monthly">Monthly</MenuItem>
                    <MenuItem value="Weekly">Weekly</MenuItem>
                    <MenuItem value="Bi-Weekly">Bi-Weekly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6}}>
                <TextField
                  fullWidth
                  label="Allowance"
                  name="allowance"
                  value={formData.allowance}
                  onChange={handleChange}
                  type="text"
                  inputProps={{ inputMode: 'decimal' }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6}}>
                <TextField
                  fullWidth
                  label="Deductions"
                  name="deductions"
                  value={formData.deductions}
                  onChange={handleChange}
                  type="text"
                  inputProps={{ inputMode: 'decimal' }}
                />
              </Grid>
              <Grid size={{ xs: 12 }} sx={{ textAlign: 'right' }}>
                <Button type="submit" variant="contained">Save Salary</Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
