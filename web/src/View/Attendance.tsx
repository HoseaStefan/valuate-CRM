import DashboardLayout from "../component/DashboardLayout";
import { Box, Typography, Button, Tabs, Tab, Card, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Stack, Avatar, Chip, Modal, TextField, Alert } from "@mui/material";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

// Mock data for attendance records
const dummyAttendance = [
  { id: 1, user: { name: 'John Doe', avatar: '/avatars/avatar-1.png' }, date: '2024-07-29', checkIn: '08:55', checkOut: '17:05', status: 'Present' },
  { id: 2, user: { name: 'Jane Smith', avatar: '/avatars/avatar-2.png' }, date: '2024-07-29', checkIn: '09:15', checkOut: '17:00', status: 'Late' },
  { id: 3, user: { name: 'Peter Jones', avatar: '/avatars/avatar-3.png' }, date: '2024-07-29', checkIn: null, checkOut: null, status: 'Absent' },
  { id: 4, user: { name: 'Sarah Miller', avatar: '/avatars/avatar-4.png' }, date: '2024-07-29', checkIn: '08:45', checkOut: '16:50', status: 'Present' },
];

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

  useEffect(() => {
    setAttendanceRecords(dummyAttendance);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const handleGenerateQR = async () => {
    if (!token) {
      setQrError('Please login first to generate QR code');
      return;
    }
    
    setIsGeneratingQR(true);
    setQrError(null);
    try {
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
            <Button 
              variant="contained" 
              sx={{ mb: 3 }}
              onClick={handleGenerateQR}
              disabled={isGeneratingQR || !token}
            >
              {isGeneratingQR ? 'Generating...' : "Generate Today's QR Code"}
            </Button>
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
