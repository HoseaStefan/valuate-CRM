import { Modal, Box, Typography, TextField, Button, Stack, MenuItem } from "@mui/material";
import { useState, useEffect } from "react";

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

interface EditReimburseModalProps {
  open: boolean;
  onClose: () => void;
  reimburse: any;
  onEditSubmit: (id: number, data: any) => void;
}

const EditReimburseModal = ({ open, onClose, reimburse, onEditSubmit }: EditReimburseModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    description: '',
    status: 'pending'
  });

  useEffect(() => {
    if (reimburse) {
      setFormData({
        title: reimburse.title || '',
        amount: reimburse.amount || '',
        description: reimburse.description || '',
        status: reimburse.status || 'pending'
      });
    }
  }, [reimburse]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (reimburse) {
      onEditSubmit(reimburse.id, formData);
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2" fontWeight={600} mb={2}>
          Edit Reimbursement
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              name="title"
              label="Title"
              value={formData.title}
              onChange={handleChange}
              required
            />
            <TextField
              name="amount"
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              required
            />
            <TextField
              name="description"
              label="Description"
              multiline
              rows={3}
              value={formData.description}
              onChange={handleChange}
              required
            />
            <TextField
              name="status"
              label="Status"
              select
              value={formData.status}
              onChange={handleChange}
              required
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </TextField>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="contained">Save</Button>
            </Stack>
          </Stack>
        </form>
      </Box>
    </Modal>
  );
};

export default EditReimburseModal;
