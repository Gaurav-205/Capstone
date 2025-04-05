import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Tooltip,
  TablePagination,
} from '@mui/material';
import {
  Reply as ReplyIcon,
  Delete as DeleteIcon,
  CheckCircle as ResolvedIcon,
  Warning as PendingIcon,
  Block as RejectedIcon,
} from '@mui/icons-material';

// Mock data - replace with actual API calls
const mockFeedback = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    subject: 'Campus Wi-Fi Issues',
    message: 'The Wi-Fi connection in the library has been very unstable lately.',
    status: 'pending',
    date: '2024-04-03',
    category: 'Technical',
    priority: 'high',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    subject: 'Canteen Food Quality',
    message: 'I would like to suggest some improvements for the canteen menu.',
    status: 'resolved',
    date: '2024-04-02',
    category: 'Facilities',
    priority: 'medium',
  },
  // Add more mock data as needed
];

const FeedbackManagement: React.FC = () => {
  const [feedbackList, setFeedbackList] = useState(mockFeedback);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return '#ef5350';
      case 'medium':
        return '#fb8c00';
      case 'low':
        return '#66bb6a';
      default:
        return '#9e9e9e';
    }
  };

  const handleReplyClick = (feedback: any) => {
    setSelectedFeedback(feedback);
    setReplyDialogOpen(true);
  };

  const handleReplySubmit = () => {
    // Implement reply submission logic here
    console.log('Reply submitted:', { feedbackId: selectedFeedback?.id, reply: replyText });
    setReplyDialogOpen(false);
    setReplyText('');
  };

  const handleStatusChange = (feedbackId: number, newStatus: string) => {
    setFeedbackList(feedbackList.map(feedback =>
      feedback.id === feedbackId ? { ...feedback, status: newStatus } : feedback
    ));
  };

  const handleDelete = (feedbackId: number) => {
    setFeedbackList(feedbackList.filter(feedback => feedback.id !== feedbackId));
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ 
            fontWeight: 800,
            background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}>
            Feedback Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and respond to user feedback and suggestions
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {/* Implement export functionality */}}
          >
            Export Report
          </Button>
        </Stack>
      </Box>

      {/* Feedback Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {feedbackList
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((feedback) => (
                  <TableRow key={feedback.id} hover>
                    <TableCell>{feedback.date}</TableCell>
                    <TableCell>{feedback.name}</TableCell>
                    <TableCell>{feedback.subject}</TableCell>
                    <TableCell>
                      <Chip label={feedback.category} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={feedback.priority}
                        size="small"
                        sx={{
                          bgcolor: getPriorityColor(feedback.priority),
                          color: 'white',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={feedback.status}
                        color={getStatusColor(feedback.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="Reply">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleReplyClick(feedback)}
                          >
                            <ReplyIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Mark as Resolved">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleStatusChange(feedback.id, 'resolved')}
                          >
                            <ResolvedIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(feedback.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={feedbackList.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Reply Dialog */}
      <Dialog
        open={replyDialogOpen}
        onClose={() => setReplyDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reply to Feedback</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Original Feedback:
            </Typography>
            <Paper sx={{ p: 2, bgcolor: '#f5f5f5', mb: 2 }}>
              <Typography variant="body2">{selectedFeedback?.message}</Typography>
            </Paper>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Your Reply"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplyDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleReplySubmit}
            disabled={!replyText.trim()}
          >
            Send Reply
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeedbackManagement; 