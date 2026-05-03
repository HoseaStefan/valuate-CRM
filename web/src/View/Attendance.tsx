import DashboardLayout from "../component/DashboardLayout";
import { Box, Typography, Button, Tabs, Tab, Card, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Stack, Avatar, Chip, Modal, TextField, Alert } from "@mui/material";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";

// // Mock data for attendance records
// const dummyAttendance = [
//   { id: 1, user: { name: 'John Doe', avatar: '/avatars/avatar-1.png' }, date: '2024-07-29', checkIn: '08:55', checkOut: '17:05', status: 'Present' },
//   { id: 2, user: { name: 'Jane Smith', avatar: '/avatars/avatar-2.png' }, date: '2024-07-29', checkIn: '09:15', checkOut: '17:00', status: 'Late' },
//   { id: 3, user: { name: 'Peter Jones', avatar: '/avatars/avatar-3.png' }, date: '2024-07-29', checkIn: null, checkOut: null, status: 'Absent' },
//   { id: 4, user: { name: 'Sarah Miller', avatar: '/avatars/avatar-4.png' }, date: '2024-07-29', checkIn: '08:45', checkOut: '16:50', status: 'Present' },
// ];

const style = {
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

const Attendance = () => {
  const { token } = useAuth();
  const [tab, setTab] = useState(0);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [isQRRefreshing, setIsQRRefreshing] = useState(false);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAttendanceData = async (authToken: string) => {
    try {
      setIsLoadingAttendance(true);
      const response = await fetch('http://localhost:3000/api/attendance', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch attendance:', response.status);
        return;
      }

      const data = await response.json();
      console.log('Raw API response:', data);
      const records = data.records || [];

      // Transform backend format to frontend format
      const transformedRecords = records.map((record: any) => {
        console.log('Processing record:', record);
        return {
          id: record.id,
          user: {
            name: record.user?.fullName || 'Unknown',
            avatar: record.user?.photoPath || '/avatars/default-avatar.png',
          },
          date: record.date,
          checkIn: record.clockIn !== '00:00:00' ? record.clockIn : null,
          checkOut: record.clockOut !== '00:00:00' ? record.clockOut : null,
          status: record.status ? record.status.charAt(0).toUpperCase() + record.status.slice(1) : 'Unknown',
        };
      });
      setAttendanceRecords(transformedRecords);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setAttendanceRecords([]);
    } finally {
      setIsLoadingAttendance(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchAttendanceData(token);
  }, [token]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const handleGenerateQR = async () => {
    try {
      setIsGeneratingQR(true);
      console.log("Generating QR code with token:", token);
      const response = await fetch('http://localhost:3000/api/attendance/generate-qr', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setQrImageUrl(data.qrImageUrl);
        setQrError(null);

        // Stop any existing interval before starting a new one
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }

        // Start interval to refresh QR code every 1 minute (60000 ms)
        setIsQRRefreshing(true);
        intervalRef.current = setInterval(async () => {
          try {
            const refreshResponse = await fetch('http://localhost:3000/api/attendance/generate-qr', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
            });
            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              setQrImageUrl(refreshData.qrImageUrl);
              console.log('QR code refreshed');
            } else {
              console.error('Failed to refresh QR code:', refreshResponse.status);
            }
          } catch (error) {
            console.error('Error refreshing QR code:', error);
          }
        }, 60000); // Refresh every 1 minute
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to generate QR code' }));
        setQrError(errorData.message || 'Failed to generate QR code');
        console.error('Failed to generate QR code:', response.status);
      }
    } catch (error) {
      setQrError(error instanceof Error ? error.message : 'Error generating QR code');
      console.error('Error generating QR code:', error);
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handleStopQRRefresh = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsQRRefreshing(false);
    setQrImageUrl(null);
    setQrError(null);
  };

  const handleOpenEditModal = (record: any) => {
    setEditingRecord(record);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingRecord(null);
  };

  const handleUpdateAttendance = () => {
    if (!editingRecord) return;
    setAttendanceRecords(prev =>
      prev.map(rec => rec.id === editingRecord.id ? editingRecord : rec)
    );
    handleCloseEditModal();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingRecord) {
        setEditingRecord({ ...editingRecord, [e.target.name]: e.target.value });
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'Present': return <Chip label={status} color="success" size="small" />;
      case 'Late': return <Chip label={status} color="warning" size="small" />;
      case 'Absent': return <Chip label={status} color="error" size="small" />;
      default: return <Chip label={status} size="small" />;
    }
  };

  return (
    <DashboardLayout currentPage="attendance">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 0 }} fontWeight={700}>
            Attendance
          </Typography>
        </Box>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tab} onChange={handleTabChange} aria-label="attendance tabs">
            <Tab label="Attendance Records" />
            <Tab label="QR Code Scanner" />
          </Tabs>
        </Box>
        {tab === 0 && (
          <Box sx={{ pt: 3 }}>
            {isLoadingAttendance ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography>Loading attendance records...</Typography>
              </Box>
            ) : attendanceRecords.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography>No attendance records found</Typography>
              </Box>
            ) : (
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <TableContainer>
                  <Table sx={{ minWidth: 750 }}>
                    <TableHead sx={{ bgcolor: 'background.paper' }}>
                      <TableRow>
                        <TableCell>Employee</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Check-in</TableCell>
                        <TableCell>Check-out</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {attendanceRecords.map((record) => (
                        <TableRow hover key={record.id}>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Avatar src={record.user.avatar} sx={{ width: 40, height: 40 }} />
                              <Typography variant="subtitle2" fontWeight={600}>{record.user.name}</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>{record.date}</TableCell>
                          <TableCell>{record.checkIn || '--'}</TableCell>
                          <TableCell>{record.checkOut || '--'}</TableCell>
                          <TableCell>{getStatusChip(record.status)}</TableCell>
                          <TableCell align="right">
                            <Button size="small" variant="outlined" onClick={() => handleOpenEditModal(record)}>Edit</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            )}
          </Box>
        )}
        {tab === 1 && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Scan for Attendance
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Generate a unique and time-sensitive QR code for employees to scan for check-in or check-out.
            </Typography>
            {qrError && <Alert severity="error" sx={{ mb: 3 }}>{qrError}</Alert>}
            {isQRRefreshing && <Alert severity="info" sx={{ mb: 3 }}>QR code auto-refreshing every 1 minute</Alert>}
            <Box sx={{ mb: 3 }}>
              <Button 
                variant="contained" 
                sx={{ mr: 2 }}
                onClick={handleGenerateQR}
                disabled={isQRRefreshing}
              >
                {isGeneratingQR ? 'Generating...' : "Generate Today's QR Code"}
              </Button>
              {isQRRefreshing && (
                <Button 
                  variant="outlined" 
                  color="error"
                  onClick={handleStopQRRefresh}
                >
                  Stop Refresh
                </Button>
              )}
            </Box>
            <Box sx={{ border: '1px dashed grey', p: 4, borderRadius: 2, maxWidth: 500, margin: 'auto' }}>
              {qrImageUrl ? (
                <Box sx={{ textAlign: 'center' }}>
                  <img 
                    src={qrImageUrl} 
                    alt="Generated QR Code" 
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    Scan this QR code to mark your attendance
                  </Typography>
                </Box>
              ) : (
                <>
                  <Typography>QR Code Scanner/Display Area</Typography>
                  <p>Click the button above to generate today's QR code</p>
                </>
              )}
            </Box>
          </Box>
        )}
      <Modal
        open={isEditModalOpen}
        onClose={handleCloseEditModal}
        aria-labelledby="edit-attendance-modal-title"
      >
        <Box sx={style}>
          <Typography id="edit-attendance-modal-title" variant="h6" component="h2">
            Edit Attendance for {editingRecord?.user.name}
          </Typography>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField label="Date" name="date" value={editingRecord?.date || ''} onChange={handleInputChange} fullWidth />
            <TextField label="Check-in" name="checkIn" value={editingRecord?.checkIn || ''} onChange={handleInputChange} fullWidth />
            <TextField label="Check-out" name="checkOut" value={editingRecord?.checkOut || ''} onChange={handleInputChange} fullWidth />
            <TextField label="Status" name="status" value={editingRecord?.status || ''} onChange={handleInputChange} fullWidth />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 2 }}>
                <Button onClick={handleCloseEditModal}>Cancel</Button>
                <Button variant="contained" onClick={handleUpdateAttendance}>Save Changes</Button>
            </Box>
          </Stack>
        </Box>
      </Modal>
    </DashboardLayout>
  );
};

export default Attendance;
