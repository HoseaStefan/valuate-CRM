import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  type SelectChangeEvent,
} from '@mui/material';

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  onAddUser: (user: any) => void; // In a real app, define a proper user type
}

const initialFormState = {
  fullName: '',
  email: '',
  password: '',
  phoneNumber: '',
  address: '',
  baseSalary: '',
  role: 'Employee',
};

export default function AddUserModal({ open, onClose, onAddUser }: AddUserModalProps) {
  const [formData, setFormData] = useState(initialFormState);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const name = e.target.name as string;
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  const handleSubmit = async () => {
    // TODO: Uncomment this block to integrate with the API
    /*
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization token if needed
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          baseSalary: parseFloat(formData.baseSalary) || 0,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add user');
      }

      const newUser = await response.json();
      onAddUser(newUser); // Pass the new user from the API response
      handleClose();

    } catch (error) {
      console.error('Error adding user:', error);
      // TODO: Show an error message to the user
    }
    */

    // For now, we'll use the mock logic
    console.log('New User Data:', formData);
    onAddUser(formData);
    handleClose();
  };

  const handleClose = () => {
// ...existing code...
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New User</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
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
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select label="Role" name="role" value={formData.role} onChange={handleSelectChange}>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="employee">Employee</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: '0 24px 16px' }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">Add User</Button>
      </DialogActions>
    </Dialog>
  );
}
