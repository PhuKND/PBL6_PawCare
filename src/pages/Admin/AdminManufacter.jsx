import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
  Snackbar
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Business as BusinessIcon,
  LocationCity as LocationCityIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  MoreVert as MoreVertIcon,
  Image as ImageIcon,
  Event as EventIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import http from '../../api/http';

const AdminManufacter = () => {
  const [manufacturers, setManufacturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedManufacturer, setSelectedManufacturer] = useState(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [previewUrl, setPreviewUrl] = useState('');
  const [toast, setToast] = useState({ open: false, severity: 'success', message: '' });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    country: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    foundingDate: '', // YYYY-MM-DD (for <input type="date" />)
    thumbnailUrl: '', // existing image url
    position: '',
    imageFile: null // new file from user
  });

  const showToast = (message, severity = 'success') => {
    setToast({ open: true, severity, message });
  };

  const parseApiError = useCallback((err) => {
    const data = err?.response?.data;
    return (
      data?.message ||
      data?.error ||
      (typeof data === 'string' ? data : '') ||
      err?.message ||
      'Không thể lưu nhà sản xuất'
    );
  }, []);

  const formatDateInput = (value) => {
    // ISO -> YYYY-MM-DD for input date (use UTC to avoid timezone shift)
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const toSlashDate = (yyyyMmDd) => {
    // "2025-01-25" -> "2025/01/25" (match Postman)
    if (!yyyyMmDd || typeof yyyyMmDd !== 'string') return '';
    const parts = yyyyMmDd.split('-');
    if (parts.length !== 3) return '';
    const [y, m, d] = parts;
    if (!y || !m || !d) return '';
    return `${y}/${m}/${d}`;
  };

  const urlToFile = async (url, filenameBase = 'image') => {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) throw new Error('Không thể tải ảnh hiện tại');
    const blob = await res.blob();
    const mime = blob.type || 'image/webp';
    const ext = mime.includes('/') ? mime.split('/')[1] : 'webp';
    return new File([blob], `${filenameBase}.${ext}`, { type: mime });
  };

  const resetForm = useCallback(() => {
    setForm({
      name: '',
      description: '',
      country: '',
      address: '',
      city: '',
      phone: '',
      email: '',
      foundingDate: '',
      thumbnailUrl: '',
      position: '',
      imageFile: null
    });
  }, []);

  const loadManufacturers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await http.get('/manufacturers');
      const data = res?.data?.data || res?.data || [];
      setManufacturers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading manufacturers:', err);
      setError(parseApiError(err) || 'Không thể tải danh sách nhà sản xuất');
      setManufacturers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadManufacturers();
  }, [loadManufacturers]);

  useEffect(() => {
    // Preview priority: new file > existing thumbnailUrl
    if (form.imageFile) {
      const objectUrl = URL.createObjectURL(form.imageFile);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    setPreviewUrl(form.thumbnailUrl || '');
  }, [form.imageFile, form.thumbnailUrl]);

  const handleSearch = (event) => setSearchTerm(event.target.value);
  const handleRefresh = () => loadManufacturers();

  const handleMenuOpen = (event, manufacturer) => {
    setAnchorEl(event.currentTarget);
    setSelectedManufacturer(manufacturer);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenAdd = () => {
    setIsEdit(false);
    setEditingId(null);
    resetForm();
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (submitting) return;
    setDialogOpen(false);
    setIsEdit(false);
    setEditingId(null);
    resetForm();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, imageFile: file }));
    }
  };

  const clearSelectedFile = () => {
    setForm((prev) => ({ ...prev, imageFile: null }));
  };

  const handleConfirmDelete = async () => {
    if (!selectedManufacturer?.id) {
      setDeleteDialogOpen(false);
      return;
    }

    try {
      setDeleting(true);
      await http.delete(`/manufacturers/${selectedManufacturer.id}`);
      showToast('Xóa nhà sản xuất thành công', 'success');
      setDeleteDialogOpen(false);
      await loadManufacturers();
    } catch (err) {
      console.error('Delete manufacturer error:', err);
      showToast(parseApiError(err) || 'Không thể xóa nhà sản xuất', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name?.trim()) {
      showToast('Vui lòng nhập tên nhà sản xuất', 'error');
      return;
    }

    try {
      setSubmitting(true);

      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('description', (form.description || '').trim());
      fd.append('country', (form.country || '').trim());
      fd.append('address', (form.address || '').trim());
      fd.append('city', (form.city || '').trim());
      fd.append('phone', (form.phone || '').trim());
      fd.append('email', (form.email || '').trim());

      // foundingDate: send as YYYY/MM/DD like Postman (backend already accepts this)
      if (form.foundingDate) {
        const slashDate = toSlashDate(form.foundingDate);
        if (slashDate) fd.append('foundingDate', slashDate);
      }

      // position: always send if user entered something (server will parse number)
      if (form.position !== undefined && form.position !== null && String(form.position).trim() !== '') {
        fd.append('position', String(form.position).trim());
      }

      // image: match Postman behavior (always send image on PUT)
      if (form.imageFile) {
        fd.append('image', form.imageFile);
      } else if (isEdit && form.thumbnailUrl) {
        // Try to re-upload existing image so backend won't reject missing image
        try {
          const existing = await urlToFile(form.thumbnailUrl, 'existing');
          fd.append('image', existing);
        } catch (e) {
          // If cannot fetch due to CORS/blocked, tell user to pick a new image
          console.warn('Cannot re-upload existing image:', e);
          showToast('Không tải được ảnh hiện tại. Vui lòng chọn ảnh mới để cập nhật.', 'warning');
        }
      }

      const config = {
        // Important: override any default JSON headers from http.js
        headers: { 'Content-Type': 'multipart/form-data' }
      };

      if (isEdit && editingId) {
        await http.put(`/manufacturers/${editingId}`, fd, config);
        showToast('Cập nhật nhà sản xuất thành công', 'success');
      } else {
        await http.post('/manufacturers', fd, config);
        showToast('Tạo nhà sản xuất thành công', 'success');
      }

      await loadManufacturers();
      handleCloseDialog();
    } catch (err) {
      console.error('Create/Update manufacturer error:', err);
      showToast(parseApiError(err), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredManufacturers = useMemo(() => {
    if (!searchTerm) return manufacturers;
    const q = searchTerm.toLowerCase();
    return manufacturers.filter(
      (m) =>
        (m.name || '').toLowerCase().includes(q) ||
        (m.description || '').toLowerCase().includes(q) ||
        (m.city || '').toLowerCase().includes(q) ||
        (m.country || '').toLowerCase().includes(q)
    );
  }, [manufacturers, searchTerm]);

  const formatDate = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString('vi-VN');
  };

  if (loading && manufacturers.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
              <BusinessIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                Quản lý Nhà sản xuất
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Danh sách và thông tin nhà sản xuất
              </Typography>
            </Box>
          </Box>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: 3
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {manufacturers.length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Tổng nhà sản xuất
                    </Typography>
                  </Box>
                  <BusinessIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                borderRadius: 3
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {manufacturers.filter((m) => m.country && m.country.toLowerCase().includes('vi')).length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Tại Việt Nam
                    </Typography>
                  </Box>
                  <LocationCityIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box
            sx={{
              p: 3,
              borderBottom: '1px solid',
              borderColor: 'divider',
              background: 'linear-gradient(90deg, #f8f9fa 0%, #ffffff 100%)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  placeholder="Tìm kiếm nhà sản xuất..."
                  value={searchTerm}
                  onChange={handleSearch}
                  size="small"
                  sx={{ minWidth: 300 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    )
                  }}
                />
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
                  onClick={handleOpenAdd}
                  sx={{
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    borderRadius: 2,
                    px: 2.5,
                    py: 1
                  }}
                >
                  Thêm nhà sản xuất
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
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Tên</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Mô tả</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Quốc gia</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Thành phố</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Liên hệ</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Ngày thành lập</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2, textAlign: 'center' }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredManufacturers.map((m) => (
                  <TableRow
                    key={m.id}
                    sx={{
                      '&:hover': {
                        bgcolor: 'grey.50',
                        transition: 'all 0.2s ease-in-out'
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    <TableCell>
                      <Avatar src={m.thumbnailUrl} sx={{ width: 60, height: 60, borderRadius: 2 }} variant="rounded">
                        <ImageIcon />
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {m.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {m.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 300 }}>
                        {m.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={m.country || '-'} size="small" color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{m.city || '-'}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {m.address}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">{m.phone || '-'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">{m.email || '-'}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <EventIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">{formatDate(m.foundingDate)}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <IconButton onClick={(e) => handleMenuOpen(e, m)} color="primary">
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {!loading && filteredManufacturers.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <BusinessIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                {searchTerm ? 'Không tìm thấy nhà sản xuất nào' : 'Chưa có nhà sản xuất nào'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Hãy thêm nhà sản xuất đầu tiên'}
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
          <MenuItem
            onClick={() => {
              if (selectedManufacturer) {
                setIsEdit(true);
                setEditingId(selectedManufacturer.id);

                setForm({
                  name: selectedManufacturer.name || '',
                  description: selectedManufacturer.description || '',
                  country: selectedManufacturer.country || '',
                  address: selectedManufacturer.address || '',
                  city: selectedManufacturer.city || '',
                  phone: selectedManufacturer.phone || '',
                  email: selectedManufacturer.email || '',
                  foundingDate: formatDateInput(selectedManufacturer.foundingDate),
                  thumbnailUrl: selectedManufacturer.thumbnailUrl || '',
                  position:
                    selectedManufacturer.position !== undefined && selectedManufacturer.position !== null
                      ? String(selectedManufacturer.position)
                      : '',
                  imageFile: null
                });

                setDialogOpen(true);
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
              if (selectedManufacturer) {
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

          <Divider />

          <MenuItem
            onClick={() => {
              handleMenuClose();
              handleRefresh();
            }}
            sx={{ color: 'text.secondary' }}
          >
            <ListItemIcon>
              <RefreshIcon />
            </ListItemIcon>
            <ListItemText>Làm mới</ListItemText>
          </MenuItem>
        </Menu>

        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{isEdit ? 'Chỉnh sửa nhà sản xuất' : 'Thêm nhà sản xuất'}</span>
            <IconButton onClick={handleCloseDialog} disabled={submitting} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Tên nhà sản xuất *"
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
                <TextField label="Quốc gia" name="country" value={form.country} onChange={handleChange} fullWidth size="small" />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField label="Thành phố" name="city" value={form.city} onChange={handleChange} fullWidth size="small" />
              </Grid>

              <Grid item xs={12}>
                <TextField label="Địa chỉ" name="address" value={form.address} onChange={handleChange} fullWidth size="small" />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Số điện thoại"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Ngày thành lập"
                  name="foundingDate"
                  type="date"
                  value={form.foundingDate}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  helperText="Sẽ gửi lên server dạng YYYY/MM/DD (giống Postman)"
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
                  placeholder="VD: 1, 2..."
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Button variant="outlined" component="label" size="small" startIcon={<ImageIcon />}>
                    Chọn ảnh (upload)
                    <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                  </Button>

                  {form.imageFile && (
                    <Button variant="text" color="error" size="small" onClick={clearSelectedFile}>
                      Bỏ chọn ảnh
                    </Button>
                  )}
                </Box>

                <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                  {form.imageFile ? `Đã chọn: ${form.imageFile.name}` : form.thumbnailUrl ? 'Ảnh hiện tại' : 'Chưa chọn ảnh'}
                </Typography>

                {previewUrl && (
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
                    <Avatar variant="rounded" src={previewUrl} alt="preview" sx={{ width: 72, height: 72, borderRadius: 1 }}>
                      <ImageIcon />
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Xem trước ảnh
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                        {form.imageFile ? form.imageFile.name : 'Ảnh hiện có'}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} disabled={submitting}>
              Hủy
            </Button>
            <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo mới'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={deleteDialogOpen}
          onClose={() => {
            if (!deleting) setDeleteDialogOpen(false);
          }}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 700 }}>
            Xác nhận xóa nhà sản xuất
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="body1">
              Bạn có chắc chắn muốn xóa nhà sản xuất{' '}
              <Typography component="span" sx={{ fontWeight: 700 }}>
                {selectedManufacturer?.name}
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

        <Snackbar
          open={toast.open}
          autoHideDuration={3500}
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setToast((t) => ({ ...t, open: false }))}
            severity={toast.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      </motion.div>
    </Container>
  );
};

export default AdminManufacter;
