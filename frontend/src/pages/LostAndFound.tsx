import React, { useState, useEffect, useCallback } from 'react';
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
  Tooltip
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
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

export default function LostAndFound() {
  const [tabValue, setTabValue] = useState(0);
  const [items, setItems] = useState<Item[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newItem, setNewItem] = useState<CreateItemData>(initialItemState);

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

  const handleOpenDialog = () => {
    if (!user) {
      setError('Please log in to post an item');
      return;
    }
    setOpenDialog(true);
    setNewItem({
      ...initialItemState,
      category: tabValue === 0 ? 'lost' : 'found',
      contactInfo: user.email || ''
    });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewItem(initialItemState);
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

      // Ensure category is set correctly
      const submitData: CreateItemData = {
        ...newItem,
        category: tabValue === 0 ? 'lost' : 'found' as 'lost' | 'found'
      };

      const createdItem = await itemService.createItem(submitData);
      console.log('Created item:', createdItem);

      setSuccess('Item posted successfully!');
      handleCloseDialog();
      await loadItems();
    } catch (error: any) {
      console.error('Error creating item:', error);
      setError(error.message || 'Error creating item. Please try again.');
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

  const filteredItems = items.filter(item => 
    tabValue === 0 ? item.category === 'lost' : item.category === 'found'
  );

  const renderItemCard = (item: Item) => (
    <Grid item xs={12} sm={6} md={4} key={item._id}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {item.title}
          </Typography>
          <Typography color="text.secondary" gutterBottom>
            {item.description}
          </Typography>
          <Typography variant="body2">
            Location: {item.location}
          </Typography>
          <Typography variant="body2">
            Date: {new Date(item.date).toLocaleDateString()}
          </Typography>
          <Typography variant="body2">
            Contact: {item.contactInfo}
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Chip
              label={item.status}
              color={
                item.status === 'active'
                  ? 'primary'
                  : item.status === 'claimed'
                  ? 'success'
                  : 'default'
              }
              size="small"
            />
          </Box>
        </CardContent>
        <CardActions>
          {user && item.postedBy._id === user._id && (
            <>
              <Tooltip title="Delete Item">
                <IconButton
                  onClick={() => handleDelete(item._id)}
                  color="error"
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
              {item.status === 'active' && (
                <Tooltip title="Mark as Claimed">
                  <Button
                    size="small"
                    onClick={() => handleStatusChange(item._id, 'claimed')}
                    color="primary"
                  >
                    Mark as Claimed
                  </Button>
                </Tooltip>
              )}
            </>
          )}
        </CardActions>
      </Card>
    </Grid>
  );

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

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Lost and Found
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Post New Item
        </Button>
      </Box>

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Lost Items" />
          <Tab label="Found Items" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {filteredItems.length === 0 ? (
              <Grid item xs={12}>
                <Typography variant="body1" color="text.secondary" align="center">
                  No lost items found. Be the first to post one!
                </Typography>
              </Grid>
            ) : (
              filteredItems.map(renderItemCard)
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {filteredItems.length === 0 ? (
              <Grid item xs={12}>
                <Typography variant="body1" color="text.secondary" align="center">
                  No found items posted yet. Be the first to post one!
                </Typography>
              </Grid>
            ) : (
              filteredItems.map(renderItemCard)
            )}
          </Grid>
        </TabPanel>
      </Paper>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Post New {tabValue === 0 ? 'Lost' : 'Found'} Item</DialogTitle>
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
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={isSubmitting}>Cancel</Button>
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
            {isSubmitting ? 'Posting...' : 'Post'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 