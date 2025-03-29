import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
  useTheme,
  alpha,
  Autocomplete,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import itemService, { Item, CreateItemData } from '../services/itemService';
import { useAuth } from '../contexts/AuthContext';

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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
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

const initialItemState: CreateItemData = {
  title: '',
  description: '',
  category: 'lost',
  location: '',
  date: new Date().toISOString().split('T')[0],
  contactInfo: '',
  status: 'active',
  images: []
};

type StatusColorType = 'success' | 'warning' | 'error' | 'primary' | 'default';

export default function LostAndFound() {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [items, setItems] = useState<Item[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newItem, setNewItem] = useState<CreateItemData>(initialItemState);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showExpiredItems, setShowExpiredItems] = useState(false);

  const { user } = useAuth();

  const loadItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await itemService.getAllItems();
      setItems(data);
    } catch (error: any) {
      setError(error.message || 'Error loading items');
      console.error('Error loading items:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (item?: Item) => {
    if (!user) {
      setError('Please log in to post an item');
      return;
    }
    if (item) {
      setEditingItem(item);
      setNewItem({
        title: item.title,
        description: item.description,
        category: item.category,
        location: item.location,
        date: new Date(item.date).toISOString().split('T')[0],
        contactInfo: item.contactInfo,
        status: item.status,
        images: item.images
      });
    } else {
      setEditingItem(null);
      setNewItem({
        ...initialItemState,
        category: tabValue === 0 ? 'lost' : 'found',
        contactInfo: user.email || ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewItem(initialItemState);
    setEditingItem(null);
  };

  const validateForm = (): boolean => {
    if (!newItem.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!newItem.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (!newItem.location.trim()) {
      setError('Location is required');
      return false;
    }
    if (!newItem.date) {
      setError('Date is required');
      return false;
    }
    if (!newItem.contactInfo.trim()) {
      setError('Contact information is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      setError(null);
      setSuccess(null);
      setIsSubmitting(true);

      if (editingItem) {
        // Update existing item
        await itemService.updateItem(editingItem._id, newItem);
        setSuccess('Item updated successfully!');
      } else {
        // Create new item
        const submitData: CreateItemData = {
          ...newItem,
          category: tabValue === 0 ? 'lost' : 'found' as 'lost' | 'found'
        };
        await itemService.createItem(submitData);
        setSuccess('Item posted successfully!');
      }

      handleCloseDialog();
      await loadItems();
    } catch (error: any) {
      console.error('Error saving item:', error);
      setError(error.message || 'Error saving item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (!window.confirm('Are you sure you want to delete this item?')) {
        return;
      }

      setError(null);
      await itemService.deleteItem(id);
      setSuccess('Item deleted successfully!');
      await loadItems();
    } catch (error: any) {
      setError(error.message || 'Error deleting item');
      console.error('Error deleting item:', error);
    }
  };

  const handleStatusChange = async (id: string, status: Item['status']) => {
    try {
      if (!window.confirm(`Are you sure you want to mark this item as ${status}?`)) {
        return;
      }

      setError(null);
      await itemService.updateItemStatus(id, status);
      setSuccess('Item status updated successfully!');
      await loadItems();
    } catch (error: any) {
      setError(error.message || 'Error updating status');
      console.error('Error updating status:', error);
    }
  };

  const isItemExpired = (item: Item): boolean => {
    if (item.status === 'claimed') {
      const claimedDate = new Date(item.updatedAt);
      const hideDate = new Date(claimedDate);
      hideDate.setHours(hideDate.getHours() + 24);
      return new Date() > hideDate;
    }
    return false;
  };

  const getTimeUntilHidden = (updatedAt: string): { hours: number; minutes: number; seconds: number } => {
    const claimedDate = new Date(updatedAt);
    const hideDate = new Date(claimedDate);
    hideDate.setHours(hideDate.getHours() + 24);
    const now = new Date();
    const remainingTime = hideDate.getTime() - now.getTime();
    
    const hours = Math.floor(remainingTime / (1000 * 60 * 60));
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds };
  };

  const getStatusColor = (item: Item): StatusColorType => {
    if (item.status !== 'claimed') {
      return item.status === 'active' ? 'primary' : 'default';
    }

    const { hours } = getTimeUntilHidden(item.updatedAt);
    if (hours < 0) return 'error';      // Expired
    if (hours < 2) return 'error';      // Critical
    if (hours < 6) return 'warning';    // Warning
    return 'success';                   // Good
  };

  const getTimeDisplay = (updatedAt: string) => {
    const { hours, minutes, seconds } = getTimeUntilHidden(updatedAt);
    
    if (hours < 0) {
      return 'Expired';
    }
    
    if (hours === 0) {
      if (minutes === 0) {
        return `${seconds} seconds until hidden`;
      }
      return `${minutes}m ${seconds}s until hidden`;
    }
    
    if (hours < 2) {
      return `${hours}h ${minutes}m ${seconds}s until hidden`;
    }
    
    if (hours < 6) {
      return `${hours} hours ${minutes}m until hidden`;
    }
    
    return `${hours} hours remaining`;
  };

  const getStatusStyles = (statusColor: StatusColorType) => {
    const colors: Record<StatusColorType, string> = {
      'success': theme.palette.success.main,
      'warning': theme.palette.warning.main,
      'error': theme.palette.error.main,
      'primary': theme.palette.primary.main,
      'default': theme.palette.grey[500]
    };

    return {
      backgroundColor: alpha(colors[statusColor], 0.1),
      color: colors[statusColor],
      borderColor: alpha(colors[statusColor], 0.3),
      '&:hover': {
        backgroundColor: alpha(colors[statusColor], 0.2),
      }
    };
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Handle expired items
      const expired = isItemExpired(item);
      if (expired && !showExpiredItems) {
        return false;
      }

      const matchesCategory = tabValue === 0 ? item.category === 'lost' : item.category === 'found';
      const matchesSearch = searchQuery
        ? item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.location.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesCategory && matchesSearch;
    });
  }, [items, tabValue, searchQuery, showExpiredItems]);

  const searchSuggestions = useMemo(() => {
    const titles = new Set(items.map(item => item.title));
    return Array.from(titles);
  }, [items]);

  const renderItemCard = (item: Item) => {
    if (!item || !item._id) return null;

    const isExpired = isItemExpired(item);
    const statusColor = getStatusColor(item);
    
    return (
      <Grid item xs={12} sm={6} md={4} key={item._id}>
        <Card 
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            borderRadius: 2,
            boxShadow: 3,
            opacity: isExpired ? 0.7 : 1,
            background: isExpired ? alpha(theme.palette.error.main, 0.05) : 'background.paper',
            '&:hover': {
              boxShadow: 6,
              transform: 'translateY(-4px)',
              transition: 'all 0.3s ease-in-out'
            }
          }}
        >
          <CardContent sx={{ flexGrow: 1, pb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                component="div" 
                sx={{ 
                  fontWeight: 600,
                  color: isExpired ? alpha(theme.palette.error.main, 0.8) : 'text.primary'
                }}
              >
                {item.title}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                <Chip
                  label={item.status}
                  color={statusColor}
                  size="small"
                />
                {item.status === 'claimed' && (
                  <Typography 
                    variant="caption"
                    color={`${statusColor}.main`}
                    sx={{ fontWeight: 500 }}
                  >
                    {getTimeDisplay(item.updatedAt)}
                  </Typography>
                )}
              </Box>
            </Box>
            <Typography 
              color="text.secondary" 
              sx={{ 
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {item.description}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                📍 {item.location}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                📅 {new Date(item.date).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                📧 {item.contactInfo}
              </Typography>
            </Box>
          </CardContent>
          {user && item.postedBy && item.postedBy._id === user._id && (
            <CardActions sx={{ p: 2, pt: 0 }}>
              <Button
                startIcon={<EditIcon />}
                size="small"
                onClick={() => handleOpenDialog(item)}
                sx={{ mr: 1 }}
              >
                Edit
              </Button>
              <Button
                startIcon={<DeleteIcon />}
                size="small"
                color="error"
                onClick={() => handleDelete(item._id)}
              >
                Delete
              </Button>
              {item.status === 'active' && (
                <Button
                  size="small"
                  color="success"
                  onClick={() => handleStatusChange(item._id, 'claimed')}
                  sx={{ ml: 'auto' }}
                >
                  Mark as Claimed
                </Button>
              )}
            </CardActions>
          )}
        </Card>
      </Grid>
    );
  };

  if (isLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.1)} 100%)`,
          borderRadius: 4,
          p: 4,
          mb: 4
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            mb: 2,
            fontWeight: 700,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Lost and Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Help others find their lost items or report items you've found.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <Autocomplete
            freeSolo
            options={searchSuggestions}
            value={searchQuery}
            onChange={(_, newValue) => setSearchQuery(newValue || '')}
            onInputChange={(_, newValue) => setSearchQuery(newValue)}
            sx={{
              flexGrow: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: 'background.paper'
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Search items..."
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  )
                }}
              />
            )}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1.5,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
              }
            }}
          >
            Post New Item
          </Button>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            variant={showExpiredItems ? "contained" : "outlined"}
            onClick={() => setShowExpiredItems(!showExpiredItems)}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              opacity: showExpiredItems ? 1 : 0.8
            }}
          >
            {showExpiredItems ? "Hide Expired Items" : "Show Expired Items"}
          </Button>
          {showExpiredItems && (
            <Typography variant="caption" color="text.secondary">
              Showing expired items that were claimed more than 24 hours ago
            </Typography>
          )}
        </Box>
      </Box>

      <Paper 
        sx={{ 
          width: '100%',
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: 2
        }}
      >
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              py: 2,
              fontSize: '1rem',
              fontWeight: 500
            }
          }}
        >
          <Tab label="Lost Items" />
          <Tab label="Found Items" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : filteredItems.length > 0 ? (
            <Grid container spacing={3}>
              {filteredItems.map(renderItemCard)}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No items found. Try adjusting your search or post a new item.
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 24
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          {editingItem ? 'Edit Item' : `Post New ${tabValue === 0 ? 'Lost' : 'Found'} Item`}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            required
            value={newItem.title}
            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
            error={!newItem.title.trim()}
            helperText={!newItem.title.trim() ? 'Title is required' : ''}
            disabled={isSubmitting}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            required
            multiline
            rows={4}
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            error={!newItem.description.trim()}
            helperText={!newItem.description.trim() ? 'Description is required' : ''}
            disabled={isSubmitting}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Location"
            fullWidth
            required
            value={newItem.location}
            onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
            error={!newItem.location.trim()}
            helperText={!newItem.location.trim() ? 'Location is required' : ''}
            disabled={isSubmitting}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Date"
            type="date"
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
            value={newItem.date}
            onChange={(e) => setNewItem({ ...newItem, date: e.target.value })}
            error={!newItem.date}
            helperText={!newItem.date ? 'Date is required' : ''}
            disabled={isSubmitting}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Contact Information"
            fullWidth
            required
            value={newItem.contactInfo}
            onChange={(e) => setNewItem({ ...newItem, contactInfo: e.target.value })}
            error={!newItem.contactInfo.trim()}
            helperText={!newItem.contactInfo.trim() ? 'Contact information is required' : ''}
            disabled={isSubmitting}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={handleCloseDialog} 
            disabled={isSubmitting}
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={
              isSubmitting ||
              !newItem.title.trim() || 
              !newItem.description.trim() || 
              !newItem.location.trim() || 
              !newItem.date || 
              !newItem.contactInfo.trim()
            }
          >
            {isSubmitting ? 'Saving...' : editingItem ? 'Update' : 'Post'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 