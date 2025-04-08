import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Chip,
  Divider,
  Alert,
  IconButton,
  CircularProgress,
  SelectChangeEvent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  QuestionAnswer as FAQIcon,
  SupportAgent as SupportAgentIcon,
  History as HistoryIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import axios from 'axios';

// Define the API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// TypeScript interfaces for the data
interface Ticket {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  createdAt: string;
  ticketNumber: string;
}

interface TicketForm {
  title: string;
  description: string;
  category: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`support-tabpanel-${index}`}
      aria-labelledby={`support-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Support: React.FC = () => {
  const theme = useTheme();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [openTicketsCount, setOpenTicketsCount] = useState(0);
  
  // Form state
  const [ticketForm, setTicketForm] = useState<TicketForm>({
    title: '',
    description: '',
    category: '',
  });

  // Tickets state
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // Fetch tickets on component mount
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/support`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        const ticketsData = response.data.data;
        setTickets(ticketsData);
        
        // Count open tickets
        const openCount = ticketsData.filter(
          (ticket: Ticket) => ticket.status === 'open' || ticket.status === 'in_progress'
        ).length;
        setOpenTicketsCount(openCount);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setErrorMessage('Failed to load support tickets. Please try again later.');
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTicketForm({
      ...ticketForm,
      [name]: value
    });
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setTicketForm({
      ...ticketForm,
      [name]: value
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/support`, 
        ticketForm, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        setSuccessMessage('Support ticket submitted successfully!');
        setIsDialogOpen(false);
        
        // Reset form
        setTicketForm({
          title: '',
          description: '',
          category: '',
        });
        
        // Refresh tickets list to update counts
        fetchTickets();
      }
    } catch (error) {
      console.error('Error submitting ticket:', error);
      setErrorMessage('Failed to submit support ticket. Please try again later.');
    } finally {
      setLoading(false);
      
      // Clear success message after 5 seconds
      if (successMessage) {
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'info';
      case 'in_progress':
        return 'warning';
      case 'resolved':
        return 'success';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Help and FAQ content
  const faqs = [
    {
      question: 'How do I request a new ID card?',
      answer: 'To request a new ID card, visit the Account section, click on "Request New Card," and follow the instructions. A nominal fee may apply for card replacement.'
    },
    {
      question: 'How can I change my mess preferences?',
      answer: 'Go to the Mess Management page, select your preferred mess, and update your meal plan preferences. Changes will be applied from the next billing cycle.'
    },
    {
      question: 'What should I do if I lost an item on campus?',
      answer: 'Report lost items through the Lost & Found section. Fill out the form with details about the item, the location where you lost it, and the approximate time.'
    },
    {
      question: 'How do I report an issue with my hostel room?',
      answer: 'For hostel maintenance issues, go to the Hostel & Facility section, select your hostel, and click on "Report Issue." Fill out the details and submit the form.'
    },
    {
      question: 'How can I check my mess account balance?',
      answer: 'Your mess account balance is displayed on your profile page. You can also view it at the top of the Mess Management section.'
    }
  ];

  const commonIssues = [
    {
      title: 'Login Problems',
      description: "If you're having trouble logging in, try resetting your password. If issues persist, create a support ticket with category \"Account\"."
    },
    {
      title: 'Mess Card Not Working',
      description: "If your mess card is not scanning properly, try cleaning it gently. If it's damaged, request a replacement through the Account section."
    },
    {
      title: 'Hostel Wi-Fi Issues',
      description: "For Wi-Fi connectivity problems, first try restarting your device. If problems persist, submit a support ticket with the category \"Technical\"."
    },
    {
      title: 'Payment Not Reflected',
      description: "If you made a payment that's not showing in your account, wait for 24 hours. If it's still not updated, submit a support ticket with payment details."
    }
  ];

  const handleEditClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setTicketForm({
      title: ticket.title,
      description: ticket.description,
      category: ticket.category,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsDeleteDialogOpen(true);
  };

  const handleResolveClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsResolveDialogOpen(true);
  };

  const handleUpdateTicket = async () => {
    if (!selectedTicket) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/support/${selectedTicket._id}`, 
        ticketForm, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        setSuccessMessage('Support ticket updated successfully!');
        setIsEditDialogOpen(false);
        
        // Refresh tickets list to update counts
        fetchTickets();
        
        // Reset form
        setTicketForm({
          title: '',
          description: '',
          category: '',
        });
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      setErrorMessage('Failed to update support ticket. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTicket = async () => {
    if (!selectedTicket) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${API_URL}/support/${selectedTicket._id}`, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        setSuccessMessage('Support ticket deleted successfully!');
        setIsDeleteDialogOpen(false);
        fetchTickets();
      }
    } catch (error) {
      console.error('Error deleting ticket:', error);
      setErrorMessage('Failed to delete support ticket. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveTicket = async () => {
    if (!selectedTicket) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/support/${selectedTicket._id}/resolve`, 
        { 
          description: `Resolved by user on ${new Date().toLocaleString()}`
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        setSuccessMessage('Support ticket marked as resolved!');
        setIsResolveDialogOpen(false);
        fetchTickets();
      }
    } catch (error) {
      console.error('Error resolving ticket:', error);
      setErrorMessage('Failed to resolve support ticket. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 2,
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(25, 118, 210, 0.05)',
            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(25, 118, 210, 0.12)'}`
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <SupportAgentIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
                Help & Support Center
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Get answers to your questions or submit a support ticket for assistance
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="support tabs"
          sx={{ 
            mb: 2, 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': {
              fontWeight: 500,
              fontSize: '0.9rem'
            }
          }}
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <HistoryIcon sx={{ mr: 1 }} />
                <span>My Tickets</span>
                {openTicketsCount > 0 && (
                  <Chip 
                    label={openTicketsCount} 
                    size="small" 
                    color="primary" 
                    sx={{ ml: 1, height: 20, fontSize: '0.75rem' }} 
                  />
                )}
              </Box>
            }
          />
          <Tab label="Frequently Asked Questions" icon={<FAQIcon />} iconPosition="start" />
          <Tab label="Common Issues" icon={<SupportAgentIcon />} iconPosition="start" />
        </Tabs>

        {/* Success/Error Messages */}
        {successMessage && (
          <Alert 
            severity="success" 
            sx={{ mb: 3 }}
            onClose={() => setSuccessMessage('')}
          >
            {successMessage}
          </Alert>
        )}
        
        {errorMessage && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            onClose={() => setErrorMessage('')}
          >
            {errorMessage}
          </Alert>
        )}

        <TabPanel value={tabValue} index={0}>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 3 
            }}
          >
            <Typography variant="h6" component="h2">
              My Support Tickets
              {openTicketsCount > 0 && (
                <Chip 
                  label={`${openTicketsCount} Open`} 
                  size="small" 
                  color="primary" 
                  sx={{ ml: 1, fontWeight: 500 }} 
                />
              )}
            </Typography>
            <Box>
              <Button 
                variant="outlined"
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={fetchTickets}
                sx={{ mr: 2 }}
              >
                Refresh
              </Button>
              <Button 
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setIsDialogOpen(true)}
              >
                New Ticket
              </Button>
            </Box>
          </Box>

          {/* Tickets List */}
          {loadingTickets ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {tickets.length > 0 ? (
                tickets.map((ticket) => (
                  <Grid item xs={12} key={ticket._id}>
                    <Card 
                      sx={{ 
                        borderLeft: `5px solid ${ticket.status === 'open' ? '#2196f3' : 
                                    ticket.status === 'in_progress' ? '#ff9800' : 
                                    ticket.status === 'resolved' ? '#4caf50' : '#9e9e9e'}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: 3,
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="h6">{ticket.title}</Typography>
                            <Box sx={{ display: 'flex', gap: 1, mb: 1, mt: 0.5 }}>
                              <Chip 
                                label={ticket.status.replace('_', ' ')} 
                                size="small"
                                color={getStatusColor(ticket.status) as any}
                              />
                              <Chip 
                                label={ticket.category.replace('_', ' ')} 
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Ticket# {ticket.ticketNumber}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Created: {formatDate(ticket.createdAt)}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Divider sx={{ my: 1.5 }} />
                        
                        <Typography variant="body2" color="text.secondary">
                          {ticket.description}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
                          {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                            <Button 
                              size="small" 
                              variant="outlined" 
                              color="success"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => handleResolveClick(ticket)}
                            >
                              Mark Resolved
                            </Button>
                          )}
                          <Button 
                            size="small" 
                            variant="outlined" 
                            color="primary"
                            startIcon={<EditIcon />}
                            onClick={() => handleEditClick(ticket)}
                            disabled={ticket.status === 'resolved' || ticket.status === 'closed'}
                          >
                            Edit
                          </Button>
                          <Button 
                            size="small" 
                            variant="outlined" 
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDeleteClick(ticket)}
                          >
                            Delete
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                      No support tickets found. Create a new ticket to get help.
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" component="h2" gutterBottom>
            Frequently Asked Questions
          </Typography>
          <Box sx={{ mt: 2 }}>
            {faqs.map((faq, index) => (
              <Accordion key={index} sx={{ mb: 1 }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`faq-content-${index}`}
                  id={`faq-header-${index}`}
                >
                  <Typography variant="subtitle1" fontWeight={500}>{faq.question}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1">{faq.answer}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body1" gutterBottom>
              Can't find an answer to your question?
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => {
                setTabValue(0);
                setIsDialogOpen(true);
              }}
              startIcon={<AddIcon />}
            >
              Submit a Support Ticket
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" component="h2" gutterBottom>
            Common Issues & Solutions
          </Typography>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {commonIssues.map((issue, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {issue.title}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2">
                      {issue.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body1" gutterBottom>
              Still having issues? Our support team is ready to help.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => {
                setTabValue(0);
                setIsDialogOpen(true);
              }}
              startIcon={<AddIcon />}
            >
              Contact Support
            </Button>
          </Box>
        </TabPanel>
      </Box>

      {/* Create Ticket Dialog */}
      <Dialog 
        open={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SupportAgentIcon sx={{ mr: 1, color: 'primary.main' }} />
            Create Support Ticket
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Title"
                fullWidth
                required
                value={ticketForm.title}
                onChange={handleInputChange}
                placeholder="Brief summary of your issue"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={ticketForm.category}
                  onChange={handleSelectChange}
                  label="Category"
                >
                  <MenuItem value="technical">Technical Issue</MenuItem>
                  <MenuItem value="account">Account Management</MenuItem>
                  <MenuItem value="facility">Facility Issue</MenuItem>
                  <MenuItem value="service">Service Request</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                multiline
                rows={5}
                fullWidth
                required
                value={ticketForm.description}
                onChange={handleInputChange}
                placeholder="Please provide detailed information about your issue. Include any relevant steps to reproduce, error messages, or specific questions."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setIsDialogOpen(false)}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            disabled={loading || !ticketForm.title || !ticketForm.description || !ticketForm.category}
          >
            {loading ? 'Submitting...' : 'Submit Ticket'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Ticket Dialog */}
      <Dialog 
        open={isEditDialogOpen} 
        onClose={() => setIsEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EditIcon sx={{ mr: 1, color: 'primary.main' }} />
            Edit Support Ticket
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Title"
                fullWidth
                required
                value={ticketForm.title}
                onChange={handleInputChange}
                placeholder="Brief summary of your issue"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={ticketForm.category}
                  onChange={handleSelectChange}
                  label="Category"
                >
                  <MenuItem value="technical">Technical Issue</MenuItem>
                  <MenuItem value="account">Account Management</MenuItem>
                  <MenuItem value="facility">Facility Issue</MenuItem>
                  <MenuItem value="service">Service Request</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                multiline
                rows={5}
                fullWidth
                required
                value={ticketForm.description}
                onChange={handleInputChange}
                placeholder="Please provide detailed information about your issue. Include any relevant steps to reproduce, error messages, or specific questions."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setIsEditDialogOpen(false)}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateTicket}
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            disabled={loading || !ticketForm.title || !ticketForm.description || !ticketForm.category}
          >
            {loading ? 'Updating...' : 'Update Ticket'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DeleteIcon sx={{ mr: 1, color: 'error.main' }} />
            Confirm Deletion
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this support ticket? This action cannot be undone.
          </Typography>
          {selectedTicket && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="subtitle1" fontWeight={500}>
                {selectedTicket.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedTicket.ticketNumber}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setIsDeleteDialogOpen(false)}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteTicket}
            variant="contained"
            color="error"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete Ticket'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mark as Resolved Dialog */}
      <Dialog
        open={isResolveDialogOpen}
        onClose={() => setIsResolveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
            Mark as Resolved
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to mark this ticket as resolved? This will close the ticket.
          </Typography>
          {selectedTicket && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="subtitle1" fontWeight={500}>
                {selectedTicket.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedTicket.ticketNumber}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setIsResolveDialogOpen(false)}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleResolveTicket}
            variant="contained"
            color="success"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Confirm Resolution'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Support; 