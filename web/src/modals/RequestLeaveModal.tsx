import { Modal, Box, Typography, TextField, Button, Stack, MenuItem } from "@mui/material";

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

interface RequestLeaveModalProps {
  open: boolean;
  onClose: () => void;
  onRequestSubmit: (request: any) => void;
}

const RequestLeaveModal = ({ open, onClose, onRequestSubmit }: RequestLeaveModalProps) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const leaveRequest = {
      leaveType: data.get('leaveType'),
      startDate: data.get('startDate'),
      endDate: data.get('endDate'),
      reason: data.get('reason'),
    };
    onRequestSubmit(leaveRequest);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2" fontWeight={600} mb={2}>
          Request Leave
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              name="leaveType"
              label="Leave Type"
              select
              required
              defaultValue=""
            >
              <MenuItem value="Annual">Annual</MenuItem>
              <MenuItem value="Sick">Sick</MenuItem>
              <MenuItem value="Unpaid">Unpaid</MenuItem>
            </TextField>
            <TextField
              name="startDate"
              label="Start Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              name="endDate"
              label="End Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              name="reason"
              label="Reason"
              multiline
              rows={4}
              required
            />
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="contained">Submit</Button>
            </Stack>
          </Stack>
        </form>
      </Box>
    </Modal>
  );
};

export default RequestLeaveModal;
