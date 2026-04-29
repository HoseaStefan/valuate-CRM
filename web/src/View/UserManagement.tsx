import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DashboardLayout from '../component/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import AddUserModal from '../modals/AddUserModal';

// Mock data
const users = [
  { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'Admin', manager: 'System', status: 'Active', avatar: '/avatars/avatar-1.png' },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Manager', manager: 'John Doe', status: 'Active', avatar: '/avatars/avatar-2.png' },
  { id: 3, name: 'Peter Jones', email: 'peter.jones@example.com', role: 'Employee', manager: 'Jane Smith', status: 'Inactive', avatar: '/avatars/avatar-3.png' },
  { id: 4, name: 'Sarah Miller', email: 'sarah.miller@example.com', role: 'Employee', manager: 'Jane Smith', status: 'Active', avatar: '/avatars/avatar-4.png' },
];

type Order = 'asc' | 'desc';

export default function UserManagement() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userList, setUserList] = useState(users);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUserId, setSelectedUserId] = useState<null | number>(null);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof (typeof users)[0]>('name');

  const handleActionClick = (event: React.MouseEvent<HTMLElement>, userId: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedUserId(userId);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setSelectedUserId(null);
  };

  const handleViewDetail = () => {
    if (selectedUserId) {
      navigate(`/user/${selectedUserId}`);
    }
    handleActionClose();
  };

  const handleEditUser = () => {
    if (selectedUserId) {
      navigate(`/user/${selectedUserId}/edit`);
    }
    handleActionClose();
  };

  const handleAddSalary = () => {
    if (selectedUserId) {
      navigate(`/user/${selectedUserId}/add-salary`);
    }
    handleActionClose();
  };
  
  const handleAssignManager = () => {
    if (selectedUserId) {
      navigate(`/user/${selectedUserId}/assign-manager`);
    }
    handleActionClose();
  };

  const handleAddUser = (newUser: any) => {
    // In a real app, you would get the new user object from the API response
    const userWithId = { ...newUser, id: userList.length + 1, status: 'Active', avatar: `/avatars/avatar-${(userList.length % 5) + 1}.png` };
    setUserList(prev => [...prev, userWithId]);
  };

  const handleSort = (property: keyof (typeof users)[0]) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  return (
    <DashboardLayout currentPage="user-management">
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            User Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage users, roles, and organizational structure
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ textTransform: 'none', height: 'fit-content' }} onClick={() => setIsModalOpen(true)}>
          Add User
        </Button>
      </Stack>

      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} p={2.5} alignItems="center">
          <TextField
            fullWidth
            placeholder="Search users by name or email"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select label="Role" defaultValue="">
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Manager">Manager</MenuItem>
              <MenuItem value="Employee">Employee</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" sx={{ flexShrink: 0 }}>Reset</Button>
        </Stack>
        <Divider />
        <TableContainer>
          <Table sx={{ minWidth: 750 }}>
            <TableHead sx={{ bgcolor: 'background.paper' }}>
              <TableRow>
                <TableCell sortDirection={orderBy === 'name' ? order : false}>
                  <TableSortLabel active={orderBy === 'name'} direction={orderBy === 'name' ? order : 'asc'} onClick={() => handleSort('name')}>
                    Name
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={orderBy === 'role' ? order : false}>
                  <TableSortLabel active={orderBy === 'role'} direction={orderBy === 'role' ? order : 'asc'} onClick={() => handleSort('role')}>
                    Role
                  </TableSortLabel>
                </TableCell>
                <TableCell>Manager</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {userList.map((user) => (
                <TableRow hover key={user.id}>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar src={user.avatar} sx={{ width: 40, height: 40 }} />
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>{user.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.manager}</TableCell>
                  <TableCell>
                    <Chip label={user.status} color={user.status === 'Active' ? 'success' : 'error'} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={(e) => handleActionClick(e, user.id)}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
      </Card>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleActionClose}>
        <MenuItem onClick={handleViewDetail}>View Detail</MenuItem>
        <MenuItem onClick={handleEditUser}>Edit User</MenuItem>
        <MenuItem onClick={handleAddSalary}>Add Salary</MenuItem>
        <MenuItem onClick={handleAssignManager}>Assign Manager</MenuItem>
      </Menu>
      <AddUserModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddUser={handleAddUser}
      />
    </DashboardLayout>
  );
}
