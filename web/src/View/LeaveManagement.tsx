import DashboardLayout from "../component/DashboardLayout";
import { Box, Typography, Button, Tabs, Tab, Card, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Stack, Avatar, Chip, Modal, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import RequestLeaveModal from "../modals/RequestLeaveModal";

// Mock data for leave requests
const dummyLeaveRequests = [
  { id: 1, user: { name: 'John Doe', avatar: '/avatars/avatar-1.png' }, leaveType: 'Annual', startDate: '2024-08-01', endDate: '2024-08-05', reason: 'Family vacation', status: 'Pending' },
  { id: 2, user: { name: 'Jane Smith', avatar: '/avatars/avatar-2.png' }, leaveType: 'Sick', startDate: '2024-07-22', endDate: '2024-07-22', reason: 'Fever', status: 'Approved' },
  { id: 3, user: { name: 'Peter Jones', avatar: '/avatars/avatar-3.png' }, leaveType: 'Unpaid', startDate: '2024-09-10', endDate: '2024-09-15', reason: 'Personal matters', status: 'Declined' },
  { id: 4, user: { name: 'Sarah Miller', avatar: '/avatars/avatar-4.png' }, leaveType: 'Annual', startDate: '2024-08-15', endDate: '2024-08-16', reason: 'Short trip', status: 'Pending' },
];

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

const LeaveManagement = () => {
  const [tab, setTab] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLeave, setEditingLeave] = useState<any | null>(null);

  // Simulate fetching data from an API
  const fetchLeaveRequests = () => {
    // In a real app, this would be an API call
    setLeaveRequests(dummyLeaveRequests);
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const handleRequestSubmit = (request: any) => {
    console.log("Leave Request Submitted:", request);
    // Here you would typically handle the form submission, e.g., send to an API
    const newRequest = {
        id: leaveRequests.length + 1,
        user: { name: 'Current User', avatar: '/avatars/avatar-5.png' }, // Placeholder for logged-in user
        ...request,
        status: 'Pending'
    };
    setLeaveRequests(prev => [newRequest, ...prev]);
  };

  const handleUpdateRequestStatus = (id: number, status: 'Approved' | 'Declined') => {
    // Simulate API call to update status
    setLeaveRequests(prev => 
      prev.map(req => req.id === id ? { ...req, status } : req)
    );
  };

  const handleOpenEditModal = (leave: any) => {
    setEditingLeave(leave);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditingLeave(null);
    setIsEditModalOpen(false);
  };

  const handleUpdateLeave = () => {
    if (!editingLeave) return;
    setLeaveRequests(prev =>
      prev.map(req => (req.id === editingLeave.id ? editingLeave : req))
    );
    handleCloseEditModal();
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingLeave) {
      setEditingLeave({ ...editingLeave, [e.target.name]: e.target.value });
    }
  };

  return (
    <DashboardLayout currentPage="leave-management">
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 0 }} fontWeight={700}>
            Leave Management
          </Typography>
          <Button variant="contained" onClick={() => setIsModalOpen(true)}>Request Leave</Button>
        </Box>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tab} onChange={handleTabChange} aria-label="leave management tabs">
            <Tab label="Leave Requests" />
            <Tab label="Calendar View" />
            <Tab label="All Leave Requests" />
          </Tabs>
        </Box>
        {tab === 0 && (
          <Box sx={{ pt: 3 }}>
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
                    {leaveRequests.map((request) => (
                      <TableRow hover key={request.id}>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar src={request.user.avatar} sx={{ width: 40, height: 40 }} />
                            <Typography variant="subtitle2" fontWeight={600}>{request.user.name}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>{request.leaveType}</TableCell>
                        <TableCell>{`${request.startDate} to ${request.endDate}`}</TableCell>
                        <TableCell>{request.reason}</TableCell>
                        <TableCell>
                          <Chip 
                            label={request.status} 
                            color={request.status === 'Approved' ? 'success' : request.status === 'Declined' ? 'error' : 'warning'} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell align="right">
                          {request.status === 'Pending' && (
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button size="small" variant="outlined" color="success" onClick={() => handleUpdateRequestStatus(request.id, 'Approved')}>Approve</Button>
                              <Button size="small" variant="outlined" color="error" onClick={() => handleUpdateRequestStatus(request.id, 'Declined')}>Decline</Button>
                            </Stack>
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
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Leave Calendar
            </Typography>
            {/* Placeholder for calendar view */}
            <p>Calendar view will be here.</p>
          </Box>
        )}
        {tab === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              All Approved Leave Requests
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
                      .filter(req => req.status === 'Approved')
                      .map((request) => (
                        <TableRow hover key={request.id}>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Avatar src={request.user.avatar} sx={{ width: 40, height: 40 }} />
                              <Typography variant="subtitle2" fontWeight={600}>{request.user.name}</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>{request.leaveType}</TableCell>
                          <TableCell>{`${request.startDate} to ${request.endDate}`}</TableCell>
                          <TableCell>{request.reason}</TableCell>
                          <TableCell>
                            <Chip label={request.status} color="success" size="small" />
                          </TableCell>
                          <TableCell align="right">
                            <Button size="small" variant="outlined" onClick={() => handleOpenEditModal(request)}>Edit</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Box>
        )}
      </Box>
      <RequestLeaveModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRequestSubmit={handleRequestSubmit}
      />
      <Modal open={isEditModalOpen} onClose={handleCloseEditModal}>
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2">
            Edit Leave Request
          </Typography>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Leave Type"
              name="leaveType"
              value={editingLeave?.leaveType || ''}
              onChange={handleEditInputChange}
              fullWidth
            />
            <TextField
              label="Start Date"
              name="startDate"
              type="date"
              value={editingLeave?.startDate || ''}
              onChange={handleEditInputChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date"
              name="endDate"
              type="date"
              value={editingLeave?.endDate || ''}
              onChange={handleEditInputChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Reason"
              name="reason"
              value={editingLeave?.reason || ''}
              onChange={handleEditInputChange}
              fullWidth
              multiline
              rows={3}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 2 }}>
              <Button onClick={handleCloseEditModal}>Cancel</Button>
              <Button variant="contained" onClick={handleUpdateLeave}>Save Changes</Button>
            </Box>
          </Stack>
        </Box>
      </Modal>
    </DashboardLayout>
  );
};

export default LeaveManagement;