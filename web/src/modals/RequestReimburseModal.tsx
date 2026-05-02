import { Modal, Box, Typography, TextField, Button, Stack } from "@mui/material";
import { useState } from "react";

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

interface RequestReimburseModalProps {
  open: boolean;
  onClose: () => void;
  onRequestSubmit: (formData: FormData) => void;
}

const RequestReimburseModal = ({ open, onClose, onRequestSubmit }: RequestReimburseModalProps) => {
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (file) {
      data.append('proof', file);
    }
    onRequestSubmit(data);
    onClose();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2" fontWeight={600} mb={2}>
          Request Reimbursement
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              name="title"
              label="Title"
              required
            />
            <TextField
              name="amount"
              label="Amount"
              type="number"
              required
            />
            <TextField
              name="description"
              label="Description"
              multiline
              rows={3}
              required
            />
            <Button
              variant="outlined"
              component="label"
            >
              Upload Proof
              <input
                type="file"
                hidden
                onChange={handleFileChange}
                accept="image/*,.pdf"
              />
            </Button>
            {file && <Typography variant="body2">{file.name}</Typography>}
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

export default RequestReimburseModal;
