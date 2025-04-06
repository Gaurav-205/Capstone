import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  Avatar,
  AvatarGroup,
  Link,
  Snackbar,
  Tab,
  Tabs,
  Tooltip,
  Paper,
  Autocomplete,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  CloudUpload as CloudUploadIcon,
  LocationOn,
  CalendarToday,
  Person,
  Phone,
  Email,
  Description,
  Image as ImageIcon,
  CheckCircle,
  FilterList,
  Category,
} from '@mui/icons-material';
import { lostFoundService, LostFoundItem, LostFoundStats } from '../services/lostFoundService';

interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  status: 'lost' | 'found';
  image?: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

const categories = [
  'Electronics',
  'Books & Documents',
  'Personal Accessories',
  'Clothing',
  'Keys',
  'ID Cards',
  'Others'
];

const locations = [
  'Academic Block',
  'Library',
  'Cafeteria',
  'Sports Complex',
  'Hostel',
  'Parking Area',
  'Other Areas'
];

// Sample data
const initialItems: Item[] = [
  {
    id: '1',
    title: 'Black Laptop Bag',
    description: 'Dell laptop bag with charger inside',
    category: 'Electronics',
    location: 'Library',
    date: '2024-03-20',
    status: 'lost',
    contactName: 'John Doe',
    contactEmail: 'john@example.com',
    contactPhone: '1234567890',
    isResolved: false,
    createdAt: '2024-03-20T12:00:00',
    updatedAt: '2024-03-20T12:00:00',
    userId: 'user1'
  },
  {
    id: '2',
    title: 'Student ID Card',
    description: 'Found near cafeteria entrance',
    category: 'ID Cards',
    location: 'Cafeteria',
    date: '2024-03-21',
    status: 'found',
    contactName: 'Jane Smith',
    contactEmail: 'jane@example.com',
    contactPhone: '9876543210',
    isResolved: false,
    createdAt: '2024-03-21T12:00:00',
    updatedAt: '2024-03-21T12:00:00',
    userId: 'user2'
  }
];

const getExpiryInfo = (item: Item): { timeLeft: string; isExpiringSoon: boolean } => {
  const currentTime = new Date().getTime();
  const itemDate = new Date(item.updatedAt).getTime();
  
  if (item.isResolved) {
    const expiryTime = itemDate + (24 * 60 * 60 * 1000);
    const hoursLeft = Math.max(0, Math.ceil((expiryTime - currentTime) / (60 * 60 * 1000)));
    return {
      timeLeft: `${hoursLeft} hours until removal`,
      isExpiringSoon: hoursLeft <= 6
    };
  } else {
    const expiryTime = itemDate + (15 * 24 * 60 * 60 * 1000);
    const daysLeft = Math.max(0, Math.ceil((expiryTime - currentTime) / (24 * 60 * 60 * 1000)));
    return {
      timeLeft: `${daysLeft} days until removal`,
      isExpiringSoon: daysLeft <= 2
    };
  }
};

const LostAndFound: React.FC = () => {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'resolved' | 'active'>('all');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState<Partial<Item>>({
    title: '',
    description: '',
    category: '',
    location: '',
    status: 'lost',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<LostFoundStats | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedContactItem, setSelectedContactItem] = useState<Item | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleOpenDialog = (item?: Item) => {
    if (item) {
      setSelectedItem(item);
      setFormData(item);
    } else {
      setSelectedItem(null);
      setFormData({
        title: '',
        description: '',
        category: '',
        location: '',
        status: 'lost',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedItem(null);
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await lostFoundService.getItems({
        status: selectedTab === 1 ? 'lost' : selectedTab === 2 ? 'found' : undefined,
        category: selectedCategory,
        location: '',
        isResolved: selectedStatus === 'resolved' ? true : selectedStatus === 'active' ? false : undefined,
        search: searchQuery,
        page: currentPage,
        limit: 9
      });
      setItems(response.data.items);
      setTotalPages(Math.max(1, response.data.totalPages));
      setTotalItems(response.data.totalItems);
      
      // Reset to page 1 if current page is beyond total pages
      if (currentPage > response.data.totalPages && response.data.totalPages > 0) {
        setCurrentPage(1);
      }
    } catch (err) {
      setError('Failed to fetch items. Please try again later.');
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await lostFoundService.getStatistics();
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchStats();
  }, []);

  useEffect(() => {
    if (searchQuery || selectedCategory || selectedStatus) {
      fetchItems();
    }
  }, [searchQuery, selectedCategory, selectedStatus]);

  const handleSubmit = async () => {
    if (!formData.title || !formData.category || !formData.location || !formData.contactName || !formData.contactEmail) {
      setSnackbarMessage('Please fill in all required fields');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
      return;
    }

    try {
      setLoading(true);
      if (selectedItem) {
        await lostFoundService.updateItem(selectedItem.id, formData);
        setSnackbarMessage('Item updated successfully');
      } else {
        console.log('Submitting form data:', JSON.stringify(formData, null, 2));
        const response = await lostFoundService.createItem(formData as Omit<LostFoundItem, 'id' | 'createdAt' | 'updatedAt'>);
        console.log('Create item response:', response);
        setSnackbarMessage('Item added successfully');
      }
      setSnackbarSeverity('success');
      handleCloseDialog();
      await fetchItems();
      await fetchStats();
    } catch (err) {
      console.log('Full error object:', JSON.stringify(err, null, 2));
      const errorMessage = err && typeof err === 'object' && 'errors' in err && Array.isArray(err.errors)
        ? err.errors.join(', ')
        : 'Failed to save item. Please try again.';
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      console.error('Error saving item:', err);
    } finally {
      setShowSnackbar(true);
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await lostFoundService.deleteItem(id);
      setSnackbarMessage('Item deleted successfully');
      setSnackbarSeverity('success');
      fetchItems();
      fetchStats();
    } catch (err) {
      setSnackbarMessage('Failed to delete item. Please try again.');
      setSnackbarSeverity('error');
      console.error('Error deleting item:', err);
    } finally {
      setShowSnackbar(true);
      setLoading(false);
    }
  };

  const handleMarkResolved = async (id: string) => {
    try {
      setLoading(true);
      await lostFoundService.markResolved(id);
      setSnackbarMessage('Item marked as resolved');
      setSnackbarSeverity('success');
      fetchItems();
      fetchStats();
    } catch (err) {
      setSnackbarMessage('Failed to mark item as resolved. Please try again.');
      setSnackbarSeverity('error');
      console.error('Error marking item as resolved:', err);
    } finally {
      setShowSnackbar(true);
      setLoading(false);
    }
  };

  const handleCardClick = (item: Item) => {
    setSelectedContactItem(item);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' ? true :
                         selectedStatus === 'resolved' ? item.isResolved :
                         !item.isResolved;
    const matchesTab = selectedTab === 0 ? true :
                      selectedTab === 1 ? item.status === 'lost' :
                      item.status === 'found';
    
    return matchesSearch && matchesCategory && matchesStatus && matchesTab;
  });

  return (
    <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header with Statistics */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ color: '#1e293b', fontWeight: 600 }}>
            Lost & Found
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ borderRadius: '8px' }}
          >
            Report Item
          </Button>
        </Box>
        
        {stats && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center', borderRadius: '12px' }}>
                <Typography variant="h6" color="error.main">
                  {stats.activeLostItems}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Lost Items
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center', borderRadius: '12px' }}>
                <Typography variant="h6" color="success.main">
                  {stats.activeFoundItems}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Found Items
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center', borderRadius: '12px' }}>
                <Typography variant="h6" color="primary.main">
                  {stats.resolvedItems}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Resolved Items
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Filters and Search */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <Stack direction="row" spacing={2}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Category"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedStatus}
                  label="Status"
                  onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'resolved' | 'active')}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="All Items" />
        <Tab label="Lost Items" />
        <Tab label="Found Items" />
      </Tabs>

      {/* Loading and Error States */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Items Grid */}
      <Grid container spacing={3}>
        {filteredItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card
              sx={{
                height: '100%',
                borderRadius: '12px',
                position: 'relative',
                opacity: item.isResolved ? 0.8 : 1,
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
              onClick={() => handleCardClick(item)}
            >
              {item.isResolved && (
                <Chip
                  label="Resolved"
                  color="success"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    zIndex: 1
                  }}
                />
              )}
              <CardContent>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    {item.title}
                  </Typography>
                  <Stack direction="row" spacing={1} mb={1}>
                    <Chip
                      size="small"
                      label={item.status.toUpperCase()}
                      color={item.status === 'lost' ? 'error' : 'success'}
                    />
                    <Chip
                      size="small"
                      label={item.category}
                      variant="outlined"
                    />
                    {(() => {
                      const { timeLeft, isExpiringSoon } = getExpiryInfo(item);
                      return (
                        <Chip
                          size="small"
                          label={timeLeft}
                          color={isExpiringSoon ? 'warning' : 'default'}
                          variant="outlined"
                        />
                      );
                    })()}
                  </Stack>
                </Box>

                <Stack spacing={1} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn fontSize="small" color="action" />
                    <Typography variant="body2">{item.location}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday fontSize="small" color="action" />
                    <Typography variant="body2">
                      {new Date(item.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Description fontSize="small" color="action" />
                    <Typography variant="body2" noWrap>
                      {item.description}
                    </Typography>
                  </Box>
                </Stack>

                {/* Action Buttons */}
                {!item.isResolved && (
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    {lostFoundService.isItemOwner(item) ? (
                      <>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDialog(item);
                          }}
                          startIcon={<EditIcon />}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                          startIcon={<DeleteIcon />}
                        >
                          Delete
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="success"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkResolved(item.id);
                          }}
                          startIcon={<CheckCircle />}
                        >
                          Mark as Resolved
                        </Button>
                      </>
                    ) : (
                      <Typography variant="caption" color="textSecondary">
                        {/* Debug info - remove in production */}
                        Item ID: {item.id}, User ID: {item.userId}
                      </Typography>
                    )}
                  </Stack>
                )}

                {/* Show a message if the item is resolved */}
                {item.isResolved && (
                  <Typography color="success.main" sx={{ mt: 2 }}>
                    <CheckCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
                    This item has been resolved
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {totalItems > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Stack direction="row" spacing={2}>
            <Button
              disabled={currentPage === 1 || loading}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              Previous
            </Button>
            <Typography sx={{ alignSelf: 'center' }}>
              Page {currentPage} of {totalPages}
            </Typography>
            <Button
              disabled={currentPage >= totalPages || loading}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Next
            </Button>
          </Stack>
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {selectedItem ? 'Edit Item' : 'Report New Item'}
            </Typography>
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                label="Category"
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Autocomplete
              freeSolo
              fullWidth
              options={locations}
              value={formData.location || null}
              onChange={(event, newValue) => {
                setFormData({ ...formData, location: newValue || '' });
              }}
              onInputChange={(event, newInputValue) => {
                setFormData({ ...formData, location: newInputValue });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Location"
                  required
                  error={!formData.location}
                  helperText={!formData.location ? "Location is required" : ""}
                />
              )}
            />
            <FormControl fullWidth required>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'lost' | 'found' })}
              >
                <MenuItem value="lost">Lost</MenuItem>
                <MenuItem value="found">Found</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              type="date"
              label="Date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Contact Name"
              required
              value={formData.contactName}
              onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
            />
            <TextField
              fullWidth
              label="Contact Email"
              required
              type="email"
              value={formData.contactEmail || ''}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              error={!!formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)}
              helperText={!!formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail) ? "Please enter a valid email address" : ""}
            />
            <TextField
              fullWidth
              label="Contact Phone"
              value={formData.contactPhone || ''}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                setFormData({ ...formData, contactPhone: value });
              }}
              error={!!formData.contactPhone && !/^\d{10}$/.test(formData.contactPhone)}
              helperText={!!formData.contactPhone && !/^\d{10}$/.test(formData.contactPhone) ? "Phone number must be 10 digits" : ""}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!formData.title || !formData.category || !formData.location || !formData.contactName || !formData.contactEmail}
          >
            {selectedItem ? 'Update' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Contact Details Dialog */}
      <Dialog
        open={!!selectedContactItem}
        onClose={() => setSelectedContactItem(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Contact Details
            </Typography>
            <IconButton onClick={() => setSelectedContactItem(null)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedContactItem && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom color="primary">
                {selectedContactItem.title}
              </Typography>
              
              <Stack direction="row" spacing={1} mb={2}>
                <Chip
                  label={selectedContactItem.status.toUpperCase()}
                  color={selectedContactItem.status === 'lost' ? 'error' : 'success'}
                />
                {(() => {
                  const { timeLeft, isExpiringSoon } = getExpiryInfo(selectedContactItem);
                  return (
                    <Chip
                      label={timeLeft}
                      color={isExpiringSoon ? 'warning' : 'default'}
                      variant="outlined"
                    />
                  );
                })()}
              </Stack>

              <List>
                <ListItem>
                  <ListItemIcon>
                    <Description />
                  </ListItemIcon>
                  <ListItemText
                    primary="Description"
                    secondary={selectedContactItem.description}
                  />
                </ListItem>
                
                <Divider component="li" />
                
                <ListItem>
                  <ListItemIcon>
                    <LocationOn />
                  </ListItemIcon>
                  <ListItemText
                    primary="Location"
                    secondary={selectedContactItem.location}
                  />
                </ListItem>

                <Divider component="li" />

                <ListItem>
                  <ListItemIcon>
                    <CalendarToday />
                  </ListItemIcon>
                  <ListItemText
                    primary="Date"
                    secondary={new Date(selectedContactItem.date).toLocaleDateString()}
                  />
                </ListItem>

                <Divider component="li" />

                <ListItem>
                  <ListItemIcon>
                    <Category />
                  </ListItemIcon>
                  <ListItemText
                    primary="Category"
                    secondary={selectedContactItem.category}
                  />
                </ListItem>

                <Divider component="li" />

                <ListItem>
                  <ListItemIcon>
                    <Person />
                  </ListItemIcon>
                  <ListItemText
                    primary="Contact Person"
                    secondary={selectedContactItem.contactName}
                  />
                </ListItem>

                <Divider component="li" />

                <ListItem>
                  <ListItemIcon>
                    <Email />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email"
                    secondary={
                      <Link
                        href={`mailto:${selectedContactItem.contactEmail}`}
                        color="primary"
                        underline="hover"
                      >
                        {selectedContactItem.contactEmail}
                      </Link>
                    }
                  />
                </ListItem>

                <Divider component="li" />

                <ListItem>
                  <ListItemIcon>
                    <Phone />
                  </ListItemIcon>
                  <ListItemText
                    primary="Phone"
                    secondary={
                      <Link
                        href={`tel:${selectedContactItem.contactPhone}`}
                        color="primary"
                        underline="hover"
                      >
                        {selectedContactItem.contactPhone}
                      </Link>
                    }
                  />
                </ListItem>
              </List>

              {selectedContactItem.isResolved && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  This item has been resolved
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedContactItem(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={4000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowSnackbar(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LostAndFound; 