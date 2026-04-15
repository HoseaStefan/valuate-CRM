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

// Mock data - in a real app, you'd fetch user details
const users = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    { id: 3, name: 'Peter Jones' },
    { id: 4, name: 'Sarah Miller' },
];

const initialFormState = {
    basicSalary: '',
    allowance: '',
    deductions: '',
    paymentPeriod: 'Monthly',
};

export default function AddSalary() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const user = users.find((u) => u.id === Number(userId));
  
  const [formData, setFormData] = useState(initialFormState);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Salary Data for', user.name, ':', formData);
    // Here you would call an API to save the salary details
    navigate(`/user-management`);
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
          <Typography variant="h6" gutterBottom>Add Salary for {user.name}</Typography>
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
