import { useLocation, Link } from 'wouter';
import {
  Box,
  Drawer,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import PaidRoundedIcon from '@mui/icons-material/PaidRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const drawerWidth = 256;

const navigationItems = [
  { label: 'Dashboard', icon: DashboardRoundedIcon, href: '/dashboard', id: 'dashboard' },
  { label: 'User Management', icon: PeopleRoundedIcon, href: '/users', id: 'users' },
  { label: 'Attendance', icon: AccessTimeRoundedIcon, href: '/attendance', id: 'attendance' },
  { label: 'Reimburse', icon: ReceiptLongRoundedIcon, href: '/reimburse', id: 'reimburse' },
  { label: 'Leave Management', icon: EventNoteRoundedIcon, href: '/leave', id: 'leave' },
  { label: 'Payroll', icon: PaidRoundedIcon, href: '/payroll', id: 'payroll' },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Section */}
      <Toolbar sx={{ px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              display: 'grid',
              placeItems: 'center',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            CRM
          </Box>
          <Typography variant="subtitle2" fontWeight={600}>
            Admin
          </Typography>
        </Box>
      </Toolbar>

      <Divider />

      {/* Navigation */}
      <List sx={{ flex: 1, px: 1.25, py: 1.5, overflowY: 'auto' }}>
        {navigationItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;

          return (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link as never}
                href={item.href}
                onClick={onClose}
                selected={isActive}
                sx={{
                  borderRadius: 1.5,
                  minHeight: 44,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': { bgcolor: 'primary.dark' },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    color: 'inherit',
                  }}
                >
                  <Icon fontSize="small" />
                </ListItemIcon>

                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
                />

                {isActive && <ChevronRightRoundedIcon fontSize="small" />}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography variant="caption" color="text.secondary">
          Version 1.0.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile */}
      <Drawer
        variant="temporary"
        open={isOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', lg: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            position: 'static',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}