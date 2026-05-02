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

import { fetchEndpoint } from '../fetchEndpoint';

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  onAddUser: (user: any) => void; 
}

const initialFormState = {
  fullName: '',
  email: '',
  password: '',
  phoneNumber: '',
  address: '',
  baseSalary: '',
  role: 'staff',
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
    try {
      const token = localStorage.getItem('token');

      const userData = {...formData, baseSalary: parseFloat(formData.baseSalary) || 0 };
      const response = await fetchEndpoint('/api/users', 'POST', token, userData);

      onAddUser(response); // Pass the new user from the API response
      setFormData(initialFormState); 
      onClose(); 
    } catch (error) {
      alert('Fail to add user: ' + (error instanceof Error ? error.message : 'Unknown error'));

    }
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
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              multiline
              rows={2}
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
                <MenuItem value="staff">Staff</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12 }}>
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
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: '0 24px 16px' }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">Add User</Button>
      </DialogActions>
    </Dialog>
  );
}
