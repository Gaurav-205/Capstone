import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  InputAdornment,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { API_URL } from '../config';

interface Item {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  status: 'lost' | 'found' | 'claimed';
  reportedBy: {
    id: string;
    name: string;
  };
  image?: string;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const LostAndFound: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    status: 'lost' as 'lost' | 'found' | 'claimed',
    contactInfo: {
      name: '',
      email: '',
      phone: ''
    },
    image: ''
  });

  const categories = [
    'Electronics',
    'Books',
    'Clothing',
    'Accessories',
    'Documents',
    'Others'
  ];

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/lost-found`);
      setItems(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch items');
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (item?: Item) => {
    if (item) {
      setSelectedItem(item);
      const editableStatus = item.status === 'claimed' ? 'claimed' : item.status;
      setFormData({
        title: item.title,
        description: item.description,
        category: item.category,
        location: item.location,
        status: editableStatus,
        contactInfo: item.contactInfo,
        image: item.image || ''
      });
    } else {
      setSelectedItem(null);
      setFormData({
        title: '',
        description: '',
        category: '',
        location: '',
        status: 'lost',
        contactInfo: {
          name: user?.name || '',
          email: user?.email || '',
          phone: ''
        },
        image: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedItem(null);
  };

  const handleSubmit = async () => {
    try {
      if (!user) {
        setSnackbar({
          open: true,
          message: 'Please login to report an item',
          severity: 'error'
        });
        return;
      }

      const data = {
        ...formData,
        date: new Date().toISOString(),
        reportedBy: {
          id: user.id,
          name: user.name
        }
      };

      if (selectedItem) {
        await axios.put(`${API_URL}/lost-found/${selectedItem._id}`, data);
        setSnackbar({
          open: true,
          message: 'Item updated successfully',
          severity: 'success'
        });
      } else {
        await axios.post(`${API_URL}/lost-found`, data);
        setSnackbar({
          open: true,
          message: 'Item reported successfully',
          severity: 'success'
        });
      }

      handleCloseDialog();
      fetchItems();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to save item',
        severity: 'error'
      });
      console.error('Error saving item:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`${API_URL}/lost-found/${id}`);
        setSnackbar({
          open: true,
          message: 'Item deleted successfully',
          severity: 'success'
        });
        fetchItems();
      } catch (err) {
        setSnackbar({
          open: true,
          message: 'Failed to delete item',
          severity: 'error'
        });
        console.error('Error deleting item:', err);
      }
    }
  };

  const handleClaim = async (id: string) => {
    try {
      await axios.put(`${API_URL}/lost-found/${id}/claim`);
      setSnackbar({
        open: true,
        message: 'Item claimed successfully',
        severity: 'success'
      });
      fetchItems();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to claim item',
        severity: 'error'
      });
      console.error('Error claiming item:', err);
    }
  };

  const filteredItems = items.filter(item => {
    const searchLower = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower) ||
      item.category.toLowerCase().includes(searchLower) ||
      item.location.toLowerCase().includes(searchLower)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'lost':
        return 'error';
      case 'found':
        return 'success';
      case 'claimed':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Lost & Found
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Report Item
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab label="All Items" />
          <Tab label="Lost Items" />
          <Tab label="Found Items" />
          <Tab label="Claimed Items" />
        </Tabs>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {filteredItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item._id}>
              <Card>
                {item.image && (
                  <Box
                    component="img"
                    sx={{
                      width: '100%',
                      height: 200,
                      objectFit: 'cover'
                    }}
                    src={item.image}
                    alt={item.title}
                  />
                )}
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" component="div">
                      {item.title}
                    </Typography>
                    <Chip
                      label={item.status.toUpperCase()}
                      color={getStatusColor(item.status)}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Category: {item.category}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Location: {item.location}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Date: {new Date(item.date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    {item.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  {item.status !== 'claimed' && (
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => handleClaim(item._id)}
                    >
                      Claim
                    </Button>
                  )}
                  {user?.id === item.reportedBy.id && (
                    <>
                      <IconButton size="small" onClick={() => handleOpenDialog(item)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(item._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          {filteredItems.filter(item => item.status === 'lost').map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item._id}>
              <Card>
                {item.image && (
                  <Box
                    component="img"
                    sx={{
                      width: '100%',
                      height: 200,
                      objectFit: 'cover'
                    }}
                    src={item.image}
                    alt={item.title}
                  />
                )}
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" component="div">
                      {item.title}
                    </Typography>
                    <Chip
                      label={item.status.toUpperCase()}
                      color={getStatusColor(item.status)}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Category: {item.category}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Location: {item.location}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Date: {new Date(item.date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    {item.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  {item.status !== 'claimed' && (
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => handleClaim(item._id)}
                    >
                      Claim
                    </Button>
                  )}
                  {user?.id === item.reportedBy.id && (
                    <>
                      <IconButton size="small" onClick={() => handleOpenDialog(item)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(item._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          {filteredItems.filter(item => item.status === 'found').map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item._id}>
              <Card>
                {item.image && (
                  <Box
                    component="img"
                    sx={{
                      width: '100%',
                      height: 200,
                      objectFit: 'cover'
                    }}
                    src={item.image}
                    alt={item.title}
                  />
                )}
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" component="div">
                      {item.title}
                    </Typography>
                    <Chip
                      label={item.status.toUpperCase()}
                      color={getStatusColor(item.status)}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Category: {item.category}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Location: {item.location}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Date: {new Date(item.date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    {item.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  {item.status !== 'claimed' && (
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => handleClaim(item._id)}
                    >
                      Claim
                    </Button>
                  )}
                  {user?.id === item.reportedBy.id && (
                    <>
                      <IconButton size="small" onClick={() => handleOpenDialog(item)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(item._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          {filteredItems.filter(item => item.status === 'claimed').map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item._id}>
              <Card>
                {item.image && (
                  <Box
                    component="img"
                    sx={{
                      width: '100%',
                      height: 200,
                      objectFit: 'cover'
                    }}
                    src={item.image}
                    alt={item.title}
                  />
                )}
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" component="div">
                      {item.title}
                    </Typography>
                    <Chip
                      label={item.status.toUpperCase()}
                      color={getStatusColor(item.status)}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Category: {item.category}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Location: {item.location}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Date: {new Date(item.date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    {item.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  {item.status !== 'claimed' && (
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => handleClaim(item._id)}
                    >
                      Claim
                    </Button>
                  )}
                  {user?.id === item.reportedBy.id && (
                    <>
                      <IconButton size="small" onClick={() => handleOpenDialog(item)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(item._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedItem ? 'Edit Item' : 'Report Item'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({
                    ...formData,
                    status: e.target.value as 'lost' | 'found' | 'claimed'
                  })}
                  label="Status"
                  disabled={formData.status === 'claimed'}
                >
                  <MenuItem value="lost">Lost</MenuItem>
                  <MenuItem value="found">Found</MenuItem>
                  {formData.status === 'claimed' && (
                    <MenuItem value="claimed">Claimed</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={4}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  label="Category"
                  required
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Image URL"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                helperText="Optional: Provide a URL for the item's image"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Contact Information
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={formData.contactInfo.name}
                onChange={(e) => setFormData({
                  ...formData,
                  contactInfo: { ...formData.contactInfo, name: e.target.value }
                })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.contactInfo.email}
                onChange={(e) => setFormData({
                  ...formData,
                  contactInfo: { ...formData.contactInfo, email: e.target.value }
                })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.contactInfo.phone}
                onChange={(e) => setFormData({
                  ...formData,
                  contactInfo: { ...formData.contactInfo, phone: e.target.value }
                })}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedItem ? 'Update' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LostAndFound; 