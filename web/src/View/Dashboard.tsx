import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Stack,
  Divider,
  Button,
} from '@mui/material';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import DashboardLayout from '../component/DashboardLayout';

interface MetricCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  color: string;
}

const metrics: MetricCard[] = [
  { label: 'Total Users', value: 248, icon: <PeopleAltOutlinedIcon />, trend: 12, color: '#1976d2' },
  { label: 'Present Today', value: 198, icon: <AccessTimeOutlinedIcon />, trend: 5, color: '#2e7d32' },
  { label: 'Pending Reimburse', value: 24, icon: <ReceiptLongOutlinedIcon />, trend: -8, color: '#ed6c02' },
  { label: 'Leave Requests', value: 12, icon: <CalendarMonthOutlinedIcon />, trend: 3, color: '#7b1fa2' },
];

const activities = [
  { action: 'User John Doe requested leave', time: '2 hours ago' },
  { action: 'Reimbursement of $250 approved', time: '4 hours ago' },
  { action: 'New user Sarah Smith added', time: '1 day ago' },
  { action: 'Payroll processed for March', time: '2 days ago' },
];

export default function HomeAdmin() {
  return (
    <DashboardLayout currentPage="dashboard">
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Welcome back! Here&apos;s what&apos;s happening with your organization today.
      </Typography>

      <Grid container spacing={2} mb={3}>
        {metrics.map((metric) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={metric.label}>
            <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box sx={{ color: metric.color, fontSize: 32 }}>
                    {metric.icon}
                  </Box>
                </Stack>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  {metric.label}
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {metric.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" fontWeight={600} mb={2}>
        Recent Activity
      </Typography>
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent>
          {activities.map((activity, i) => (
            <Box key={i}>
              <Stack direction="row" justifyContent="space-between" py={1.25}>
                <Typography variant="body2">{activity.action}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {activity.time}
                </Typography>
              </Stack>
              {i < activities.length - 1 && <Divider />}
            </Box>
          ))}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}