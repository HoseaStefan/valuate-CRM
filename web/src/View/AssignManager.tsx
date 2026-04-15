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

// Mock data
const users = [
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'Admin', manager: 'System' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Manager', manager: 'John Doe' },
    { id: 3, name: 'Peter Jones', email: 'peter.jones@example.com', role: 'Employee', manager: 'Jane Smith' },
    { id: 4, name: 'Sarah Miller', email: 'sarah.miller@example.com', role: 'Employee', manager: 'Jane Smith' },
];

export default function AssignManager() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const user = users.find((u) => u.id === Number(userId));
  
  const [selectedManager, setSelectedManager] = useState(user?.manager || '');

  if (!user) {
    return (
      <DashboardLayout>
        <Typography variant="h5">User not found</Typography>
      </DashboardLayout>
    );
  }

  const potentialManagers = users.filter(u => u.role === 'Manager' && u.id !== user.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Assigning ${selectedManager} as manager for ${user.name}`);
    // API call to update manager would go here
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
          <Typography variant="h6" gutterBottom>Assign Manager</Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Assign a manager for <strong>{user.name}</strong>.
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
                  <MenuItem key={manager.id} value={manager.name}>
                    {manager.name}
                  </MenuItem>
                ))}
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
