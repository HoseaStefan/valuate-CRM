// import React from 'react';
// import {
//   Box,
//   Card,
//   CardContent,
//   Typography,
//   Grid,
//   Stack,
//   Chip,
//   Divider,
//   Button,
// } from '@mui/material';
// import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
// import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
// import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
// import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
// import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
// import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
// import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined';
// import DashboardLayout from '../component/DashboardLayout';

// interface MetricCard {
//   label: string;
//   value: string | number;
//   icon: React.ReactNode;
//   trend?: number;
//   color: string;
// }

// const metrics: MetricCard[] = [
//   { label: 'Total Users', value: 248, icon: <PeopleAltOutlinedIcon />, trend: 12, color: '#1976d2' },
//   { label: 'Present Today', value: 198, icon: <AccessTimeOutlinedIcon />, trend: 5, color: '#2e7d32' },
//   { label: 'Pending Reimburse', value: 24, icon: <ReceiptLongOutlinedIcon />, trend: -8, color: '#ed6c02' },
//   { label: 'Leave Requests', value: 12, icon: <CalendarMonthOutlinedIcon />, trend: 3, color: '#7b1fa2' },
//   { label: 'Payroll Status', value: 'On Track', icon: <PaymentsOutlinedIcon />, color: '#0288d1' },
// ];

// const activities = [
//   { action: 'User John Doe requested leave', time: '2 hours ago' },
//   { action: 'Reimbursement of $250 approved', time: '4 hours ago' },
//   { action: 'New user Sarah Smith added', time: '1 day ago' },
//   { action: 'Payroll processed for March', time: '2 days ago' },
// ];

// export default function HomeAdmin() {
//   return (
//     <DashboardLayout currentPage="dashboard">
//       <Box sx={{ p: 3 }}>
//         <Typography variant="h4" fontWeight={700} gutterBottom>
//           Dashboard
//         </Typography>
//         <Typography variant="body1" color="text.secondary" mb={3}>
//           Welcome back! Here&apos;s what&apos;s happening with your organization today.
//         </Typography>

//         <Grid container spacing={2} mb={3}>
//           {metrics.map((metric) => (
//             <Grid item xs={12} sm={6} md={4} lg={2.4} key={metric.label}>
//               <Card variant="outlined" sx={{ borderRadius: 2 }}>
//                 <CardContent>
//                   <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
//                     <Box sx={{ color: metric.color }}>{metric.icon}</Box>
//                     {metric.trend !== undefined && (
//                       <Chip
//                         size="small"
//                         icon={metric.trend >= 0 ? <TrendingUpOutlinedIcon /> : <TrendingDownOutlinedIcon />}
//                         label={`${Math.abs(metric.trend)}%`}
//                         color={metric.trend >= 0 ? 'success' : 'error'}
//                         variant="outlined"
//                       />
//                     )}
//                   </Stack>
//                   <Typography variant="body2" color="text.secondary">
//                     {metric.label}
//                   </Typography>
//                   <Typography variant="h5" fontWeight={700}>
//                     {metric.value}
//                   </Typography>
//                 </CardContent>
//               </Card>
//             </Grid>
//           ))}
//         </Grid>

//         <Typography variant="h6" fontWeight={600} mb={2}>
//           Quick Actions
//         </Typography>
//         <Grid container spacing={2} mb={3}>
//           <Grid item xs={12} md={4}>
//             <Card variant="outlined" sx={{ borderRadius: 2 }}>
//               <CardContent>
//                 <Stack spacing={1}>
//                   <Typography fontWeight={600}>Manage Users</Typography>
//                   <Typography variant="body2" color="text.secondary">
//                     View and manage all users
//                   </Typography>
//                   <Button variant="contained" size="small">Open</Button>
//                 </Stack>
//               </CardContent>
//             </Card>
//           </Grid>
//           <Grid item xs={12} md={4}>
//             <Card variant="outlined" sx={{ borderRadius: 2 }}>
//               <CardContent>
//                 <Stack spacing={1}>
//                   <Typography fontWeight={600}>Attendance</Typography>
//                   <Typography variant="body2" color="text.secondary">
//                     Record attendance
//                   </Typography>
//                   <Button variant="contained" size="small">Open</Button>
//                 </Stack>
//               </CardContent>
//             </Card>
//           </Grid>
//           <Grid item xs={12} md={4}>
//             <Card variant="outlined" sx={{ borderRadius: 2 }}>
//               <CardContent>
//                 <Stack spacing={1}>
//                   <Typography fontWeight={600}>Reimburse</Typography>
//                   <Typography variant="body2" color="text.secondary">
//                     Approve reimbursements
//                   </Typography>
//                   <Button variant="contained" size="small">Open</Button>
//                 </Stack>
//               </CardContent>
//             </Card>
//           </Grid>
//         </Grid>

//         <Typography variant="h6" fontWeight={600} mb={2}>
//           Recent Activity
//         </Typography>
//         <Card variant="outlined" sx={{ borderRadius: 2 }}>
//           <CardContent>
//             {activities.map((activity, i) => (
//               <Box key={i}>
//                 <Stack direction="row" justifyContent="space-between" py={1.25}>
//                   <Typography variant="body2">{activity.action}</Typography>
//                   <Typography variant="caption" color="text.secondary">
//                     {activity.time}
//                   </Typography>
//                 </Stack>
//                 {i < activities.length - 1 && <Divider />}
//               </Box>
//             ))}
//           </CardContent>
//         </Card>
//       </Box>
//     </DashboardLayout>
//   );
// }