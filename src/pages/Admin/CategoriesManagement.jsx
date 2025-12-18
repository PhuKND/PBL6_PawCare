import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Pagination,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Category as CategoryIcon,
  Image as ImageIcon,
  Sort as SortIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { fetchCategories } from '../../api/http';
import http from '../../api/http';
import AddCategoryModal from './AddCategoryModal';

const CategoriesManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    id: '',
    name: '',
    description: '',
    position: '',
    active: true,
    deleted: false,
    imageFile: null,
    thumbnailUrl: ''
  });

  useEffect(() => {
    loadCategories();
  }, [currentPage]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetchCategories(currentPage, pageSize);
      
      if (response.code === 200) {
        setCategories(response.data || []);
        
        setTotalPages(Math.ceil((response.totalElements || response.data?.length || 0) / pageSize));
      } else {
        setError(response.message || 'Không thể tải danh sách danh mục');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra khi tải dữ liệu');
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page - 1); 
  };

  const handleMenuOpen = (event, category) => {
    setAnchorEl(event.currentTarget);
    setSelectedCategory(category);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRefresh = () => {
    loadCategories();
  };

  const handleAddCategory = () => {
    setAddModalOpen(true);
  };

  const handleAddSuccess = (newCategory) => {
    setCategories(prev => [newCategory, ...prev]);
    setAddModalOpen(false);
  };

  const handleEditOpen = (category) => {
    setForm({
      id: category.id || '',
      name: category.name || '',
      description: category.description || '',
      position: category.position ?? '',
      active: Boolean(category.active),
      deleted: Boolean(category.deleted),
      imageFile: null,
      thumbnailUrl: category.thumbnailUrl || ''
    });
    setEditOpen(true);
  };

  const handleEditClose = () => {
    if (submitting) return;
    setEditOpen(false);
    setForm({
      id: '',
      name: '',
      description: '',
      position: '',
      active: true,
      deleted: false,
      imageFile: null,
      thumbnailUrl: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = (name) => (e) => {
    const checked = e.target.checked;
    setForm((prev) => ({ ...prev, [name]: checked }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, imageFile: file }));
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCategory?.id) {
      setDeleteDialogOpen(false);
      return;
    }

    try {
      setDeleting(true);
      await http.delete(`http://127.0.0.1:8080/api/v1/categories/${selectedCategory.id}`);
      await loadCategories();
    } catch (err) {
      console.error('Delete category error:', err);
      alert(err?.response?.data?.message || err?.message || 'Không thể xóa danh mục');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!form.id) {
      alert('Thiếu ID danh mục');
      return;
    }
    if (!form.name) {
      alert('Vui lòng nhập tên danh mục');
      return;
    }
    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append('id', form.id);
      fd.append('name', form.name);
      fd.append('description', form.description || '');
      fd.append('position', form.position === '' ? '' : form.position);
      fd.append('active', form.active ? '1' : '0');
      fd.append('deleted', form.deleted ? '1' : '0');
      if (form.imageFile) {
        fd.append('image', form.imageFile);
      }

      await http.put('http://127.0.0.1:8080/api/v1/categories', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      await loadCategories();
      handleEditClose();
    } catch (err) {
      console.error('Update category error:', err);
      alert(err?.response?.data?.message || err?.message || 'Không thể cập nhật danh mục');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (active) => {
    return active ? 'success' : 'error';
  };

  const getStatusText = (active) => {
    return active ? 'Hoạt động' : 'Không hoạt động';
  };

  if (loading && categories.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >

        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
              <CategoryIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                Quản lý Danh mục
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Quản lý các danh mục sản phẩm trong hệ thống
              </Typography>
            </Box>
          </Box>
        </Box>


        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 3
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {categories.length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Tổng danh mục
                    </Typography>
                  </Box>
                  <CategoryIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              borderRadius: 3
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {categories.filter(cat => cat.active).length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Đang hoạt động
                    </Typography>
                  </Box>
                  <VisibilityIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>


        <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>

          <Box sx={{ 
            p: 3, 
            borderBottom: '1px solid', 
            borderColor: 'divider',
            background: 'linear-gradient(90deg, #f8f9fa 0%, #ffffff 100%)'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  placeholder="Tìm kiếm danh mục..."
                  value={searchTerm}
                  onChange={handleSearch}
                  size="small"
                  sx={{ minWidth: 300 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  size="small"
                >
                  Bộ lọc
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title="Làm mới">
                  <IconButton onClick={handleRefresh} color="primary">
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddCategory}
                  sx={{
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    borderRadius: 2,
                    px: 3,
                    py: 1
                  }}
                >
                  Thêm danh mục
                </Button>
              </Box>
            </Box>
          </Box>


          {error && (
            <Alert severity="error" sx={{ m: 3 }}>
              {error}
            </Alert>
          )}


          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Hình ảnh</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Tên danh mục</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Mô tả</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Vị trí</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Trạng thái</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2, textAlign: 'center' }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCategories.map((category, index) => (
                  <TableRow
                    key={category.id}
                    sx={{
                      '&:hover': {
                        bgcolor: 'grey.50',
                        transition: 'all 0.2s ease-in-out'
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                      <TableCell>
                        <Avatar
                          src={category.thumbnailUrl}
                          sx={{ width: 60, height: 60, borderRadius: 2 }}
                          variant="rounded"
                        >
                          <ImageIcon />
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {category.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {category.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 300 }}>
                          {category.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={category.position}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(category.active)}
                          color={getStatusColor(category.active)}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, category)}
                          color="primary"
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>


          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Pagination
                count={totalPages}
                page={currentPage + 1}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}


          {!loading && filteredCategories.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <CategoryIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                {searchTerm ? 'Không tìm thấy danh mục nào' : 'Chưa có danh mục nào'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Hãy thêm danh mục đầu tiên'}
              </Typography>
            </Box>
          )}
        </Paper>


        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              borderRadius: 2,
              minWidth: 200,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }
          }}
        >
          {/* <MenuItem onClick={handleMenuClose}> */}
            {/* <ListItemIcon>
              <VisibilityIcon color="primary" />
            </ListItemIcon> */}
            {/* <ListItemText>Xem chi tiết</ListItemText> */}
          {/* </MenuItem> */}
          <MenuItem
            onClick={() => {
              if (selectedCategory) {
                handleEditOpen(selectedCategory);
              }
              handleMenuClose();
            }}
          >
            <ListItemIcon>
              <EditIcon color="primary" />
            </ListItemIcon>
            <ListItemText>Chỉnh sửa</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              if (selectedCategory) {
                setDeleteDialogOpen(true);
              }
              setAnchorEl(null);
            }}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <DeleteIcon color="error" />
            </ListItemIcon>
            <ListItemText>Xóa</ListItemText>
          </MenuItem>
        </Menu>

          
        <AddCategoryModal
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSuccess={handleAddSuccess}
        />

        <Dialog
          open={deleteDialogOpen}
          onClose={() => {
            if (!deleting) setDeleteDialogOpen(false);
          }}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 700 }}>
            Xác nhận xóa danh mục
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="body1">
              Bạn có chắc chắn muốn xóa danh mục{' '}
              <Typography component="span" sx={{ fontWeight: 700 }}>
                {selectedCategory?.name}
              </Typography>
              ? Hành động này không thể hoàn tác.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
              Hủy
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={editOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>Chỉnh sửa danh mục</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Tên danh mục *"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  fullWidth
                  required
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Mô tả"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Vị trí"
                  name="position"
                  value={form.position}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  control={<Switch checked={form.active} onChange={handleToggle('active')} color="primary" />}
                  label="Hoạt động"
                />
                <FormControlLabel
                  control={<Switch checked={form.deleted} onChange={handleToggle('deleted')} color="error" />}
                  label="Đã xóa"
                  sx={{ ml: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="outlined" component="label" size="small" startIcon={<ImageIcon />}>
                  Chọn ảnh (upload)
                  <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                </Button>
                <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                  {form.imageFile
                    ? `Đã chọn: ${form.imageFile.name}`
                    : form.thumbnailUrl
                      ? 'Ảnh hiện tại'
                      : 'Chưa chọn ảnh'}
                </Typography>
                {(form.imageFile || form.thumbnailUrl) && (
                  <Box
                    sx={{
                      mt: 1.5,
                      width: '100%',
                      border: '1px dashed',
                      borderColor: 'divider',
                      borderRadius: 2,
                      p: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      bgcolor: 'grey.50'
                    }}
                  >
                    <Avatar
                      variant="rounded"
                      src={form.imageFile ? URL.createObjectURL(form.imageFile) : form.thumbnailUrl}
                      alt="preview"
                      sx={{ width: 72, height: 72, borderRadius: 1 }}
                    >
                      <ImageIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Xem trước ảnh
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {form.imageFile ? form.imageFile.name : 'Ảnh hiện có'}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleEditClose} disabled={submitting}>
              Hủy
            </Button>
            <Button variant="contained" onClick={handleSubmitEdit} disabled={submitting}>
              {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  );
};

export default CategoriesManagement;
