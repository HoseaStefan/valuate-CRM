import React, { useState, useEffect } from 'react';
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
import { fetchEndpoint } from '../fetchEndpoint';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  manager: string | null;
  status: string;
  avatar: string;
  fullName?: string;
  managerId?: string | null;
  photoPath?: string | null;
}

type Order = 'asc' | 'desc';

export default function UserManagement() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userList, setUserList] = useState<User[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUserId, setSelectedUserId] = useState<null | string>(null);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<string>('name');
  const [loading, setLoading] = useState(true);
  const [usersMap, setUsersMap] = useState<Map<string, User>>(new Map());

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetchEndpoint('/api/users', 'GET', token);
        
        // Create a map for quick lookup
        const userMapTemp = new Map<string, User>();
        
        // Transform backend data to frontend format
        const transformedUsers = response.map((user: any) => {
          const transformed: User = {
            id: user.id,
            name: user.fullName,
            email: user.email,
            role: user.role,
            manager: user.managerId ? null : null, // Will be populated after map creation
            status: 'Active',
            avatar: user.photoPath || `/avatars/avatar-${Math.floor(Math.random() * 5) + 1}.png`,
            fullName: user.fullName,
            managerId: user.managerId,
            photoPath: user.photoPath,
          };
          return transformed;
        });
        
        // Build user map for manager name lookup
        transformedUsers.forEach(user => {
          userMapTemp.set(user.id, user);
        });
        
        // Now populate manager names
        const finalUsers = transformedUsers.map(user => ({
          ...user,
          manager: user.managerId ? (userMapTemp.get(user.managerId)?.name || 'Unknown') : '-',
        }));
        
        setUserList(finalUsers);
        setUsersMap(userMapTemp);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleActionClick = (event: React.MouseEvent<HTMLElement>, userId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedUserId(userId);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setSelectedUserId(null);
  };

  const handleViewDetail = async () => {
    if (selectedUserId) {
      try {
        const token = localStorage.getItem('token');
        const user = await fetchEndpoint(`/api/users/${selectedUserId}`, 'GET', token);
        navigate(`/user/${selectedUserId}`, { state: { user } });
      } catch (error) {
        console.error('Error fetching user details:', error);
        alert('Failed to fetch user details: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    }
    handleActionClose();
  };

  const handleEditUser = async () => {
    if (selectedUserId) {
      try {
        const token = localStorage.getItem('token');
        const user = await fetchEndpoint(`/api/users/${selectedUserId}`, 'GET', token);
        navigate(`/user/${selectedUserId}/edit`, { state: { user } });
      } catch (error) {
        console.error('Error fetching user details:', error);
        alert('Failed to fetch user details: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
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
    // Transform the API response to frontend format
    const transformedUser: User = {
      id: newUser.id,
      name: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      manager: newUser.managerId ? (usersMap.get(newUser.managerId)?.name || 'Unknown') : '-',
      status: 'Active',
      avatar: newUser.photoPath || `/avatars/avatar-${Math.floor(Math.random() * 5) + 1}.png`,
      fullName: newUser.fullName,
      managerId: newUser.managerId,
      photoPath: newUser.photoPath,
    };
    setUserList(prev => [...prev, transformedUser]);
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
              <MenuItem value="staff">Staff</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
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
