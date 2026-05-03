import DashboardLayout from "../component/DashboardLayout";
import { Box, Typography, Button, Tabs, Tab, Card, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Stack, Avatar, Chip, Modal, TextField, Link } from "@mui/material";
import { useEffect, useState } from "react";
import RequestReimburseModal from "../modals/RequestReimburseModal";
import EditReimburseModal from "../modals/EditReimburseModal";
import { fetchEndpoint } from "../fetchEndpoint";

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

const Reimburse = () => {
  const [tab, setTab] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingReimburse, setEditingReimburse] = useState<any>(null);
  const [reimburseRequests, setReimburseRequests] = useState<any[]>([]);
  const [myHistory, setMyHistory] = useState<any[]>([]);
  
  // Using simple role check for demo (could come from AuthContext)
  const userRoleStr = localStorage.getItem('userData');
  const userRole = userRoleStr ? JSON.parse(userRoleStr).role : 'staff';
  const token = localStorage.getItem('token');

  const fetchMyHistory = async () => {
    try {
      const response = await fetchEndpoint('/api/reimbursement/history', 'GET', token);
      if (response && response.data) {
        setMyHistory(response.data);
      }
    } catch (error) {
      console.error("Error fetching my history", error);
    }
  };

  const fetchAllRequests = async () => {
    if (userRole === 'admin' || userRole === 'staff') { // Manager is staff too
      try {
        const response = await fetchEndpoint('/api/reimbursement/requests', 'GET', token);
        if (response && response.data) {
          setReimburseRequests(response);
        }
      } catch (error) {
        console.error("Error fetching all requests", error);
      }
    }
  };

  useEffect(() => {
    fetchMyHistory();
    fetchAllRequests();
  }, [userRole, token]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const handleRequestSubmit = async (formData: FormData) => {
    try {
      await fetchEndpoint('/api/reimbursement/', 'POST', token, formData);
      setIsModalOpen(false);
      fetchMyHistory();
    } catch (error) {
      console.error("Error submitting reimbursement", error);
    }
  };

  const handleUpdateRequestStatus = async (id: number, status: 'approved' | 'rejected') => {
    try {
      await fetchEndpoint(`/api/reimbursement/${id}/review`, 'PUT', token, { status });
      fetchAllRequests(); // Refresh the list
    } catch (error) {
      console.error("Error updating status", error);
    }
  };

  const handleDeleteReimbursement = async (id: number) => {
    try {
      await fetchEndpoint(`/api/reimbursement/${id}`, 'DELETE', token);
      fetchMyHistory();
      if (userRole === 'admin') fetchAllRequests();
    } catch (error) {
      console.error("Error deleting reimbursement", error);
    }
  };

  const handleEditSubmit = async (id: number, data: any) => {
    try {
      await fetchEndpoint(`/api/reimbursement/${id}`, 'PUT', token, data);
      fetchAllRequests();
    } catch (error) {
      console.error("Error editing reimbursement", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  return (
    <DashboardLayout currentPage="reimburse">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 0 }} fontWeight={700}>
            Reimbursement
          </Typography>
          <Button variant="contained" onClick={() => setIsModalOpen(true)}>Request Reimburse</Button>
        </Box>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tab} onChange={handleTabChange} aria-label="reimburse tabs">
            <Tab label="My Requests" />
            <Tab label="All Pending Requests" />
          </Tabs>
        </Box>
        {tab === 0 && (
          <Box sx={{ pt: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              My History
            </Typography>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <TableContainer>
                <Table sx={{ minWidth: 750 }}>
                  <TableHead sx={{ bgcolor: 'background.paper' }}>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Proof</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {myHistory.map((request) => (
                      <TableRow hover key={request.id}>
                        <TableCell>{request.title}</TableCell>
                        <TableCell>{formatCurrency(request.amount)}</TableCell>
                        <TableCell>{request.description}</TableCell>
                        <TableCell>
                          {request.proofPath ? (
                            <Link href={`http://localhost:3000${request.proofPath}`} target="_blank" rel="noopener">View</Link>
                          ) : 'No Proof'}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={request.status} 
                            color={request.status === 'approved' ? 'success' : request.status === 'rejected' ? 'error' : 'warning'} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell align="right">
                          {request.status === 'pending' && (
                            <Button size="small" variant="outlined" color="error" onClick={() => handleDeleteReimbursement(request.id)}>
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
          <Box sx={{ pt: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Pending Approvals
            </Typography>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <TableContainer>
                <Table sx={{ minWidth: 750 }}>
                  <TableHead sx={{ bgcolor: 'background.paper' }}>
                    <TableRow>
                      <TableCell>Employee</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Proof</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reimburseRequests.filter(r => r.status === 'pending').map((request) => (
                      <TableRow hover key={request.id}>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar src={request.user?.profilePic} sx={{ width: 40, height: 40 }} />
                            <Typography variant="subtitle2" fontWeight={600}>{request.user?.fullName || 'Staff'}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>{request.title}</TableCell>
                        <TableCell>{formatCurrency(request.amount)}</TableCell>
                        <TableCell>{request.description}</TableCell>
                        <TableCell>
                          {request.proofPath ? (
                            <Link href={`http://localhost:3000${request.proofPath}`} target="_blank" rel="noopener">View</Link>
                          ) : 'No Proof'}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={request.status} 
                            color={request.status === 'approved' ? 'success' : request.status === 'rejected' ? 'error' : 'warning'} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            {userRole === 'admin' && (
                              <Button size="small" variant="outlined" onClick={() => {
                                setEditingReimburse(request);
                                setIsEditModalOpen(true);
                              }}>Edit</Button>
                            )}
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
      <RequestReimburseModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRequestSubmit={handleRequestSubmit}
      />
      <EditReimburseModal
        open={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingReimburse(null);
        }}
        reimburse={editingReimburse}
        onEditSubmit={handleEditSubmit}
      />
    </DashboardLayout>
  );
};

export default Reimburse;
