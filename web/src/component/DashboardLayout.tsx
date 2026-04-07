import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PaymentsIcon from '@mui/icons-material/Payments';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface DashboardLayoutProps {
  children: ReactNode;
  currentPage?: string;
}

const drawerWidth = 260;

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { key: 'users', label: 'Users', icon: <PeopleIcon /> },
  { key: 'reimburse', label: 'Reimburse', icon: <ReceiptLongIcon /> },
  { key: 'attendance', label: 'Attendance', icon: <EventAvailableIcon /> },
  { key: 'payroll', label: 'Payroll', icon: <PaymentsIcon /> },
];

export default function DashboardLayout({
  children,
  currentPage = 'dashboard',
}: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, userData } = useAuth();

  const initials = useMemo(() => {
    const name = userData?.name || userData?.username || 'Admin';
    return name
      .split(' ')
      .map((s) => s[0]?.toUpperCase())
      .slice(0, 2)
      .join('');
  }, [userData]);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const drawerContent = (
    <Box sx={{ height: '100%', bgcolor: 'background.paper' }}>
      <Box sx={{ px: 2.5, py: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          CRM Admin
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Management Panel
        </Typography>
      </Box>
      <Divider />
      <List sx={{ px: 1, py: 1 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.key}
            selected={currentPage === item.key}
            sx={{ borderRadius: 1.5, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 38 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar sx={{ minHeight: 64 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen((v) => !v)}
            sx={{ mr: 1, display: { md: 'none' } }}
            aria-label="Toggle sidebar"
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>

          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            CRM Admin Panel
          </Typography>

          <IconButton color="inherit" aria-label="Settings">
            <SettingsIcon />
          </IconButton>

          <Avatar sx={{ mx: 1.5, width: 34, height: 34 }}>{initials || 'AD'}</Avatar>

          <Button
            variant="text"
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ textTransform: 'none' }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          p: 3,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}