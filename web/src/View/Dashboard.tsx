import React, { useState, useEffect } from 'react';
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
import { fetchEndpoint } from '../fetchEndpoint';

interface MetricCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  color: string;
}

export default function HomeAdmin() {
  const [metricsData, setMetricsData] = useState({
    totalUsers: 0,
    presentToday: 0,
    pendingReimburse: 0,
    pendingLeave: 0
  });
  const [activitiesList, setActivitiesList] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const data = await fetchEndpoint('/api/dashboard', 'GET', token);
        if (data) {
          setMetricsData(data.metrics || metricsData);
          setActivitiesList(data.activities || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchDashboard();
  }, []);

  const metrics: MetricCard[] = [
    { label: 'Total Users', value: metricsData.totalUsers, icon: <PeopleAltOutlinedIcon />, color: '#1976d2' },
    { label: 'Present Today', value: metricsData.presentToday, icon: <AccessTimeOutlinedIcon />, color: '#2e7d32' },
    { label: 'Pending Reimburse', value: metricsData.pendingReimburse, icon: <ReceiptLongOutlinedIcon />, color: '#ed6c02' },
    { label: 'Leave Requests', value: metricsData.pendingLeave, icon: <CalendarMonthOutlinedIcon />, color: '#7b1fa2' },
  ];
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
          {activitiesList.length === 0 && (
            <Typography variant="body2" color="text.secondary" p={2} textAlign="center">
              No recent activity found.
            </Typography>
          )}
          {activitiesList.map((activity, i) => {
            const timeDate = new Date(activity.time);
            return (
            <Box key={i}>
              <Stack direction="row" justifyContent="space-between" py={1.25}>
                <Typography variant="body2">{activity.action}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {timeDate.toLocaleString()}
                </Typography>
              </Stack>
              {i < activitiesList.length - 1 && <Divider />}
            </Box>
            );
          })}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}