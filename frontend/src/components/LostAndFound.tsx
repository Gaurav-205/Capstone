import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
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
  Link,
  Snackbar,
  Tab,
  Tabs,
  Paper,
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
  LocationOn,
  CalendarToday,
  Person,
  Phone,
  Email,
  Description,
  CheckCircle,
  Category,
} from '@mui/icons-material';
import { lostFoundService, LostFoundItem, LostFoundStats } from '../services/lostFoundService';
import { useAuth } from '../contexts/AuthContext';
// import { Location as MapLocation } from '../types/map';

interface Item {
  _id: string;
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

const getExpiryInfo = (item: Item) => {
  const createdDate = new Date(item.createdAt);
  const expiryDate = new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from creation
  const now = new Date();
  const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    timeLeft: daysLeft > 0 ? `${daysLeft} days left` : 'Expired',
    isExpiringSoon: daysLeft > 0 && daysLeft <= 5
  };
};

const LostAndFound: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
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
    contactName: user?.name || '',
    contactEmail: user?.email || '',
    contactPhone: user?.phone || '',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
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
        contactName: user?.name || '',
        contactEmail: user?.email || '',
        contactPhone: user?.phone || '',
        date: new Date().toISOString().split('T')[0]
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedItem(null);
  };

  const fetchItems = useCallback(async () => {
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
      
      if (currentPage > response.data.totalPages && response.data.totalPages > 0) {
        setCurrentPage(1);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch items. Please try again later.');
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [selectedTab, selectedCategory, selectedStatus, searchQuery, currentPage]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await lostFoundService.getStatistics();
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  }, []);

  useEffect(() => {
    if (!initialLoading) {
      fetchItems();
    }
  }, [selectedTab, currentPage, fetchItems, initialLoading]);

  useEffect(() => {
    const initializeData = async () => {
      setInitialLoading(true);
      try {
        // Fetch items, stats, and locations concurrently
        await Promise.all([
          fetchItems(),
          fetchStats(),
        ]);
      } catch (error) {
        console.error('Error initializing data:', error);
        setError('Failed to load data. Please try again later.');
      } finally {
        setInitialLoading(false);
      }
    };

    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (searchQuery || selectedCategory || selectedStatus) {
      fetchItems();
    }
  }, [searchQuery, selectedCategory, selectedStatus, fetchItems]);

  const handleSubmit = async () => {
    if (!formData.title || !formData.category || !formData.location || !formData.contactName || !formData.contactEmail) {
      setSnackbarMessage('Please fill in all required fields');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
      return;
    }

    // Validate location - ensure it's not too short
    if (formData.location.trim().length < 3) {
      setSnackbarMessage('Please enter a valid location (minimum 3 characters)');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
      return;
    }

    try {
      setLoading(true);
      if (selectedItem) {
        await lostFoundService.updateItem(selectedItem._id, formData);
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
    console.log('Attempting to delete item with ID:', id);
    if (!id) {
      console.error('Delete operation failed: No ID provided');
      setSnackbarMessage('Cannot delete item: Missing item ID');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
      return;
    }

    setLoading(true);
    try {
      console.log('Calling deleteItem service with ID:', id);
      await lostFoundService.deleteItem(id);
      setSnackbarMessage('Item deleted successfully');
      setSnackbarSeverity('success');
      await fetchItems();
      await fetchStats();
    } catch (error) {
      console.error('Error in delete operation:', error);
      setSnackbarMessage(error instanceof Error ? error.message : 'Failed to delete item');
      setSnackbarSeverity('error');
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent<'lost' | 'found'>) => {
    const { name, value } = e.target;
    
    if (name) {
      // Special handling for phone numbers to only allow digits
      if (name === 'contactPhone') {
        const numericValue = String(value).replace(/\D/g, '').slice(0, 10);
        setFormData({
          ...formData,
          [name]: numericValue
        });
      } else {
        setFormData({
          ...formData,
          [name]: value
        });
      }
    }
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

  if (initialLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh',
          bgcolor: '#f8fafc'
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
          Loading Lost & Found items...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
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
                  onChange={(e: SelectChangeEvent) => setSelectedCategory(e.target.value)}
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
                  onChange={(e: SelectChangeEvent) => setSelectedStatus(e.target.value as 'all' | 'resolved' | 'active')}
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

      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="All Items" />
        <Tab label="Lost Items" />
        <Tab label="Found Items" />
      </Tabs>

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

      {!loading && items.length === 0 && !error && (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            py: 8
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No items found
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
            {searchQuery || selectedCategory || selectedStatus !== 'all' 
              ? 'Try adjusting your search filters'
              : 'Be the first to report a lost or found item'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Report Item
          </Button>
        </Box>
      )}

      <Grid container spacing={3}>
        {filteredItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item._id}>
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
                            if (item && item._id) {
                              handleDelete(item._id);
                            } else {
                              console.error('Cannot delete: Item or item ID is missing', item);
                              setSnackbarMessage('Cannot delete item: Missing item ID');
                              setSnackbarSeverity('error');
                              setShowSnackbar(true);
                            }
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
                            handleMarkResolved(item._id);
                          }}
                          startIcon={<CheckCircle />}
                        >
                          Mark as Resolved
                        </Button>
                      </>
                    ) : (
                      <Typography variant="caption" color="textSecondary">
                        Item ID: {item._id}, User ID: {item.userId}
                      </Typography>
                    )}
                  </Stack>
                )}

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

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        aria-labelledby="form-dialog-title"
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }
        }}
        keepMounted={false}
      >
        <DialogTitle 
          id="form-dialog-title"
          sx={{ 
            bgcolor: 'primary.main', 
            color: 'white',
            py: 2,
            '& .MuiTypography-root': {
              fontSize: '1.25rem',
              fontWeight: 600
            }
          }}
        >
          {selectedItem ? 'Edit Item' : 'Report a New Item'}
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 3 }}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Description fontSize="small" sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                      borderWidth: '2px'
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    borderRadius: '8px'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                required
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                      borderWidth: '2px'
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    borderRadius: '8px'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Category"
                name="category"
                value={formData.category || ''}
                onChange={handleInputChange}
                required
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Category fontSize="small" sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                      borderWidth: '2px'
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    borderRadius: '8px'
                  }
                }}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location || ''}
                onChange={handleInputChange}
                required
                variant="outlined"
                placeholder="Enter location details"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn fontSize="small" sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                      borderWidth: '2px'
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    borderRadius: '8px'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                required
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarToday fontSize="small" sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                      borderWidth: '2px'
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    borderRadius: '8px'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth 
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                      borderWidth: '2px'
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    borderRadius: '8px'
                  }
                }}
              >
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={handleInputChange}
                  name="status"
                  startAdornment={
                    <InputAdornment position="start">
                      {formData.status === 'lost' ? 
                        <SearchIcon fontSize="small" sx={{ color: 'error.main' }} /> : 
                        <CheckCircle fontSize="small" sx={{ color: 'success.main' }} />
                      }
                    </InputAdornment>
                  }
                >
                  <MenuItem value="lost">Lost</MenuItem>
                  <MenuItem value="found">Found</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ 
                fontWeight: 600, 
                color: 'text.secondary',
                mt: 1,
                borderBottom: '1px solid #e2e8f0',
                pb: 1
              }}>
                Contact Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Name"
                name="contactName"
                value={formData.contactName || ''}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person fontSize="small" sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                }}
                required
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                      borderWidth: '2px'
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    borderRadius: '8px'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Email"
                name="contactEmail"
                type="email"
                value={formData.contactEmail || ''}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email fontSize="small" sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                }}
                required
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                      borderWidth: '2px'
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    borderRadius: '8px'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Phone"
                name="contactPhone"
                value={formData.contactPhone || ''}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone fontSize="small" sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                }}
                required
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                      borderWidth: '2px'
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    borderRadius: '8px'
                  }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ 
          p: 3, 
          borderTop: '1px solid #e2e8f0',
          justifyContent: 'space-between',
          bgcolor: '#f8fafc'
        }}>
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
            startIcon={<CloseIcon />}
            sx={{
              borderRadius: '8px',
              px: 3,
              py: 1,
              color: 'text.secondary',
              borderColor: '#e2e8f0',
              '&:hover': {
                borderColor: '#cbd5e1',
                bgcolor: '#f1f5f9'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!formData.title || !formData.category || !formData.location || !formData.contactName || !formData.contactEmail}
            startIcon={selectedItem ? <EditIcon /> : <AddIcon />}
            sx={{
              borderRadius: '8px',
              px: 3,
              py: 1,
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(25, 118, 210, 0.3)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s'
            }}
          >
            {selectedItem ? 'Update Item' : 'Submit Item'}
          </Button>
        </DialogActions>
      </Dialog>

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