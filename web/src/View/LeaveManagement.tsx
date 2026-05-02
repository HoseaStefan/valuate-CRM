import DashboardLayout from "../component/DashboardLayout";
import { Box, Typography, Button, Tabs, Tab, Card, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Stack, Avatar, Chip, Modal, TextField, IconButton } from "@mui/material";
import { useEffect, useState, useMemo } from "react";
import RequestLeaveModal from "../modals/RequestLeaveModal";
import { fetchEndpoint } from "../fetchEndpoint";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];
const WEEKDAYS = ['M', 'S', 'S', 'R', 'K', 'J', 'S'];

function normalizeDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dateInRange(date: Date, start: Date, end: Date) {
  const d = normalizeDate(date).getTime();
  const s = normalizeDate(start).getTime();
  const e = normalizeDate(end).getTime();
  return d >= s && d <= e;
}

function buildMonthGrid(monthStart: Date) {
  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstDayIndex = firstDay.getDay();
  const lastDayIndex = lastDay.getDay();

  const cells: Date[] = [];
  for (let i = firstDayIndex; i > 0; i--) {
    cells.push(normalizeDate(new Date(year, month, 1 - i)));
  }
  for (let i = 1; i <= lastDay.getDate(); i++) {
    cells.push(normalizeDate(new Date(year, month, i)));
  }
  const daysToAdd = 6 - lastDayIndex;
  for (let i = 1; i <= daysToAdd; i++) {
    cells.push(normalizeDate(new Date(year, month, lastDay.getDate() + i)));
  }
  return cells;
}

const LeaveManagement = () => {
  const [tab, setTab] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [myHistory, setMyHistory] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  
  // Calendar states
  const today = useMemo(() => normalizeDate(new Date()), []);
  const [currentMonth, setCurrentMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [calendarLeaves, setCalendarLeaves] = useState<any[]>([]);
  
  const token = localStorage.getItem('auth_token');
  const userRoleStr = localStorage.getItem('user_data');
  const userRole = userRoleStr ? JSON.parse(userRoleStr).role : 'staff';

  const fetchMyHistory = async () => {
    try {
      const data = await fetchEndpoint('/api/leave/history', 'GET', token);
      if (data && data.data) setMyHistory(data.data);
    } catch (error) {
      console.error("Error fetching my history", error);
    }
  };

  const fetchAllRequests = async () => {
    if (userRole === 'admin' || userRole === 'staff') {
      try {
        const data = await fetchEndpoint('/api/leave/requests', 'GET', token);
        if (data && data.data) setLeaveRequests(data.data);
      } catch (error) {
        console.error("Error fetching all requests", error);
      }
    }
  };

  const fetchCalendar = async () => {
    try {
      const month = currentMonth.getMonth() + 1;
      const year = currentMonth.getFullYear();
      const data = await fetchEndpoint(`/api/leave/calendar?month=${month}&year=${year}&all=true`, 'GET', token);
      if (data && data.data) {
        const mapped = data.data.map((item: any) => ({
          ...item,
          startDate: normalizeDate(new Date(item.startDate)),
          endDate: normalizeDate(new Date(item.endDate)),
        }));
        setCalendarLeaves(mapped);
      }
    } catch (error) {
      console.error("Error fetching calendar", error);
    }
  };

  useEffect(() => {
    fetchMyHistory();
    fetchAllRequests();
  }, [token]);

  useEffect(() => {
    fetchCalendar();
  }, [currentMonth, token]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const handleRequestSubmit = async (request: any) => {
    try {
      
      await fetchEndpoint('/api/leave', 'POST', token, request);
      setIsModalOpen(false);
      fetchMyHistory();
    } catch (error) {
      console.error("Error submitting leave request", error);
    }
  };

  const handleUpdateRequestStatus = async (id: number, status: 'approved' | 'rejected') => {
    try {
      await fetchEndpoint(`/api/leave/${id}/review`, 'PUT', token, { status });
      fetchAllRequests();
      fetchCalendar(); // Refresh calendar if a leave is approved
    } catch (error) {
      console.error("Error updating status", error);
    }
  };

  const handleDeleteLeaveRequest = async (id: number) => {
    try {
      await fetchEndpoint(`/api/leave/${id}`, 'DELETE', token);
      fetchMyHistory();
    } catch (error) {
      console.error("Error deleting leave request", error);
    }
  };

  const hasLeaveOnDate = (date: Date) => {
    return calendarLeaves.some(s => dateInRange(date, s.startDate, s.endDate));
  };

  const grid = useMemo(() => buildMonthGrid(currentMonth), [currentMonth]);
  const monthTitle = `${MONTHS_ID[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;

  const goPrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const goNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  return (
    <DashboardLayout currentPage="leave-management">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 0 }} fontWeight={700}>
            Leave Management
          </Typography>
          <Button variant="contained" onClick={() => setIsModalOpen(true)}>Request Leave</Button>
        </Box>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tab} onChange={handleTabChange} aria-label="leave management tabs">
            <Tab label="My Requests" />
            <Tab label="Calendar View" />
            <Tab label="All Pending Requests" />
          </Tabs>
        </Box>
        
        {tab === 0 && (
          <Box sx={{ pt: 3 }}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <TableContainer>
                <Table sx={{ minWidth: 750 }}>
                  <TableHead sx={{ bgcolor: 'background.paper' }}>
                    <TableRow>
                      <TableCell>Leave Type</TableCell>
                      <TableCell>Dates</TableCell>
                      <TableCell>Reason</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {myHistory.map((request) => (
                      <TableRow hover key={request.id}>
                        <TableCell>{request.leaveType}</TableCell>
                        <TableCell>{`${new Date(request.startDate).toLocaleDateString()} to ${new Date(request.endDate).toLocaleDateString()}`}</TableCell>
                        <TableCell>{request.reason}</TableCell>
                        <TableCell>
                          <Chip 
                            label={request.status} 
                            color={request.status === 'approved' ? 'success' : request.status === 'rejected' ? 'error' : 'warning'} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell align="right">
                          {request.status === 'pending' && (
                            <Button size="small" variant="outlined" color="error" onClick={() => handleDeleteLeaveRequest(request.id)}>
                              Delete
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Box>
        )}

        {tab === 1 && (
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Card variant="outlined" sx={{ borderRadius: 4, p: 3, width: '100%', maxWidth: 500 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={800}>{monthTitle}</Typography>
                <Box>
                  <IconButton onClick={goPrevMonth}><ChevronLeftIcon /></IconButton>
                  <IconButton onClick={goNextMonth}><ChevronRightIcon /></IconButton>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                {WEEKDAYS.map((d, idx) => (
                  <Typography key={idx} sx={{ width: '14.28%', textAlign: 'center', fontWeight: 'bold', color: 'text.secondary', fontSize: 12 }}>
                    {d}
                  </Typography>
                ))}
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                {grid.map(date => {
                  const isOtherMonth = date.getMonth() !== currentMonth.getMonth();
                  const isToday = date.getTime() === today.getTime();
                  const hasLeave = hasLeaveOnDate(date);
                  
                  return (
                    <Box 
                      key={date.toISOString()}
                      sx={{ 
                        width: '14.28%', 
                        height: 40, 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        opacity: isOtherMonth ? 0.35 : 1
                      }}
                    >
                      <Box sx={{
                        width: 32, height: 32, borderRadius: 16,
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        bgcolor: hasLeave ? '#FEF08A' : isToday ? 'primary.main' : 'transparent',
                        color: isToday && !hasLeave ? 'white' : hasLeave ? '#A16207' : 'text.primary',
                        fontWeight: isToday ? 900 : 700
                      }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 'inherit', color: 'inherit' }}>
                          {date.getDate()}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Card>
          </Box>
        )}

        {tab === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Pending Approvals
            </Typography>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <TableContainer>
                <Table sx={{ minWidth: 750 }}>
                  <TableHead sx={{ bgcolor: 'background.paper' }}>
                    <TableRow>
                      <TableCell>Employee</TableCell>
                      <TableCell>Leave Type</TableCell>
                      <TableCell>Dates</TableCell>
                      <TableCell>Reason</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leaveRequests
                      .filter(req => req.status === 'pending')
                      .map((request) => (
                        <TableRow hover key={request.id}>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Avatar src={request.user?.profilePic} sx={{ width: 40, height: 40 }} />
                              <Typography variant="subtitle2" fontWeight={600}>{request.user?.fullName || 'Staff'}</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>{request.leaveType}</TableCell>
                          <TableCell>{`${new Date(request.startDate).toLocaleDateString()} to ${new Date(request.endDate).toLocaleDateString()}`}</TableCell>
                          <TableCell>{request.reason}</TableCell>
                          <TableCell>
                            <Chip label={request.status} color="warning" size="small" />
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button size="small" variant="outlined" color="success" onClick={() => handleUpdateRequestStatus(request.id, 'approved')}>Approve</Button>
                              <Button size="small" variant="outlined" color="error" onClick={() => handleUpdateRequestStatus(request.id, 'rejected')}>Reject</Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Box>
        )}
      <RequestLeaveModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRequestSubmit={handleRequestSubmit}
      />
    </DashboardLayout>
  );
};

export default LeaveManagement;