import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Alert,
  Snackbar,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  PhotoCamera as PhotoIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import newsService from '../../services/newsService';

// Define News interface
interface News {
  _id: string;
  title: string;
  content: string;
  date: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
}

const NewsManagement: React.FC = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [newNewsItem, setNewNewsItem] = useState<Omit<News, '_id' | 'createdAt' | 'updatedAt'>>({
    title: '',
    content: '',
    date: dayjs().format('YYYY-MM-DD'),
    category: '',
    priority: 'medium',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [imageUploadLoading, setImageUploadLoading] = useState(false);

  // Fetch news on component mount
  useEffect(() => {
    fetchNews();
  }, []);

  // Fetch news from API
  const fetchNews = async () => {
    setLoading(true);
    try {
      const data = await newsService.getNews();
      setNews(data);
    } catch (error) {
      console.error('Error fetching news:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch news',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Open dialog to add new news
  const handleAddNews = () => {
    setSelectedNews(null);
    setNewNewsItem({
      title: '',
      content: '',
      date: dayjs().format('YYYY-MM-DD'),
      category: 'other',
      priority: 'medium',
    });
    setOpenDialog(true);
  };

  // Open dialog to view news
  const handleViewNews = (news: News) => {
    setSelectedNews(news);
    setOpenViewDialog(true);
  };

  // Open dialog to edit news
  const handleEditNews = (news: News) => {
    setSelectedNews(news);
    setNewNewsItem({
      title: news.title,
      content: news.content,
      date: news.date,
      category: news.category,
      priority: news.priority,
      imageUrl: news.imageUrl,
    });
    setOpenDialog(true);
  };

  // Open dialog to confirm news deletion
  const handleDeleteNews = (news: News) => {
    setSelectedNews(news);
    setOpenDeleteDialog(true);
  };

  // Handle input change for new/edited news
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewNewsItem({
      ...newNewsItem,
      [name]: value,
    });
  };

  // Handle select change for news priority
  const handleSelectChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setNewNewsItem({
        ...newNewsItem,
        [name]: value,
      });
    }
  };

  // Handle date change
  const handleDateChange = (date: any | null) => {
    if (date) {
      setNewNewsItem({
        ...newNewsItem,
        date: date.format('YYYY-MM-DD'),
      });
    }
  };

  // Mock image upload functionality
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploadLoading(true);
    // Mock API call to upload image
    setTimeout(() => {
      const imageUrl = URL.createObjectURL(file);
      setNewNewsItem({
        ...newNewsItem,
        imageUrl,
      });
      setImageUploadLoading(false);
    }, 1500);
  };

  // Handle save news (create or update)
  const handleSaveNews = async () => {
    if (!newNewsItem.title || !newNewsItem.content || !newNewsItem.date || !newNewsItem.category) {
      setSnackbar({
        open: true,
        message: 'Please fill all required fields',
        severity: 'error',
      });
      return;
    }

    try {
      if (selectedNews) {
        // Update existing news
        await newsService.updateNews(selectedNews._id, newNewsItem);
        setSnackbar({
          open: true,
          message: 'News updated successfully',
          severity: 'success',
        });
      } else {
        // Create new news
        await newsService.createNews(newNewsItem);
        setSnackbar({
          open: true,
          message: 'News created successfully',
          severity: 'success',
        });
      }
      setOpenDialog(false);
      fetchNews();
    } catch (error) {
      console.error('Error saving news:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save news',
        severity: 'error',
      });
    }
  };

  // Handle delete news
  const handleConfirmDelete = async () => {
    if (!selectedNews) return;

    try {
      await newsService.deleteNews(selectedNews._id);
      setOpenDeleteDialog(false);
      fetchNews();
      setSnackbar({
        open: true,
        message: 'News deleted successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error deleting news:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete news',
        severity: 'error',
      });
    }
  };

  // Filter news by priority, category, and search term
  const filteredNews = news.filter(
    (item) =>
      (filterPriority === 'all' || item.priority === filterPriority) &&
      (filterCategory === 'all' || item.category === filterCategory) &&
      (item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get color for news priority
  const getPriorityColor = (priority: string): "success" | "warning" | "error" => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'success';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Extract unique categories from news
  const categories = ['all', ...Array.from(new Set(news.map((item) => item.category)))];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>
          News Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddNews}
          sx={{ 
            borderRadius: '8px',
            boxShadow: 2,
            textTransform: 'none'
          }}
        >
          Add News
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: '10px' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Search News"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select
                value={filterPriority}
                label="Priority"
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <MenuItem value="all">All Priorities</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={filterCategory}
                label="Category"
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Loading Indicator */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: '10px', boxShadow: 2 }}>
          <Table>
            <TableHead sx={{ backgroundColor: 'background.default' }}>
              <TableRow>
                <TableCell><Typography fontWeight={600}>Title</Typography></TableCell>
                <TableCell><Typography fontWeight={600}>Category</Typography></TableCell>
                <TableCell><Typography fontWeight={600}>Priority</Typography></TableCell>
                <TableCell><Typography fontWeight={600}>Date</Typography></TableCell>
                <TableCell><Typography fontWeight={600}>Created</Typography></TableCell>
                <TableCell align="right"><Typography fontWeight={600}>Actions</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredNews.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item) => (
                <TableRow key={item._id} hover>
                  <TableCell>
                    <Typography fontWeight={500}>{item.title}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={item.category} 
                      color="primary"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} 
                      color={getPriorityColor(item.priority)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon fontSize="small" color="action" />
                      <Typography variant="body2">{formatDate(item.date)}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{formatDate(item.createdAt)}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Tooltip title="View">
                        <IconButton size="small" color="primary" onClick={() => handleViewNews(item)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" color="primary" onClick={() => handleEditNews(item)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDeleteNews(item)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredNews.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      )}

      {/* Add/Edit News Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedNews ? 'Edit News' : 'Add News'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="title"
                label="Title"
                variant="outlined"
                value={newNewsItem.title}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Date"
                  value={dayjs(newNewsItem.date)}
                  onChange={handleDateChange}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={newNewsItem.category}
                  label="Category"
                  onChange={handleSelectChange as any}
                  required
                >
                  <MenuItem value="academic">Academic</MenuItem>
                  <MenuItem value="administrative">Administrative</MenuItem>
                  <MenuItem value="admission">Admission</MenuItem>
                  <MenuItem value="sports">Sports</MenuItem>
                  <MenuItem value="cultural">Cultural</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={newNewsItem.priority}
                  label="Priority"
                  onChange={handleSelectChange as any}
                  required
                >
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="content"
                label="Content"
                variant="outlined"
                multiline
                rows={6}
                value={newNewsItem.content}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoIcon />}
                  disabled={imageUploadLoading}
                >
                  Upload Image
                  <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                </Button>
                {imageUploadLoading && <CircularProgress size={24} />}
                {newNewsItem.imageUrl && (
                  <Box sx={{ ml: 2, position: 'relative' }}>
                    <img 
                      src={newNewsItem.imageUrl} 
                      alt="Preview" 
                      style={{ maxWidth: '100px', maxHeight: '60px', borderRadius: '4px' }} 
                    />
                    <IconButton 
                      size="small" 
                      sx={{ position: 'absolute', top: -10, right: -10, bgcolor: 'background.paper' }}
                      onClick={() => setNewNewsItem({ ...newNewsItem, imageUrl: undefined })}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSaveNews}
            disabled={!newNewsItem.title || !newNewsItem.content || !newNewsItem.category}
          >
            {selectedNews ? 'Update News' : 'Publish News'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View News Dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>{selectedNews?.title}</Typography>
            <Chip 
              label={selectedNews?.priority.charAt(0).toUpperCase() + (selectedNews?.priority.slice(1) || '')} 
              color={getPriorityColor(selectedNews?.priority || 'low')}
              size="small"
            />
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label={selectedNews?.category} color="primary" size="small" />
                  <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                    <CalendarIcon fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {selectedNews ? formatDate(selectedNews.date) : ''}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              {selectedNews?.imageUrl && (
                <Box sx={{ mb: 2, width: '100%', maxHeight: '300px', overflow: 'hidden', borderRadius: '10px' }}>
                  <img 
                    src={selectedNews.imageUrl} 
                    alt={selectedNews.title} 
                    style={{ width: '100%', objectFit: 'cover' }} 
                  />
                </Box>
              )}
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {selectedNews?.content}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              setOpenViewDialog(false);
              handleEditNews(selectedNews as News);
            }}
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the news "{selectedNews?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NewsManagement; 