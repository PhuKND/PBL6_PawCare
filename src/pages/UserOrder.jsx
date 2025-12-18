import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Skeleton,
  Stack,
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Button,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Snackbar,
  Alert as MuiAlert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as AttachMoneyIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  Payment as PaymentIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  LocalShipping as LocalShippingIcon,
  Cancel as CancelIcon,
  CalendarToday as CalendarTodayIcon,
  Refresh as RefreshIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  RateReview as RateReviewIcon,
  Image as ImageIcon,
  Close as CloseIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import http from '../api/http';

function formatCurrencyVnd(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value || 0));
}

function formatDateTime(dateString) {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  } catch (error) {
    return dateString;
  }
}

const getStatusColor = (status) => {
  switch (status) {
    case 'PENDING':
      return 'warning';
    case 'CONFIRMED':
      return 'info';
    case 'SHIPPING':
      return 'primary';
    case 'COMPLETED':
      return 'success';
    case 'CANCELLED':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'PENDING':
      return <PendingIcon fontSize="small" />;
    case 'CONFIRMED':
      return <CheckCircleIcon fontSize="small" />;
    case 'SHIPPING':
      return <LocalShippingIcon fontSize="small" />;
    case 'COMPLETED':
      return <CheckCircleIcon fontSize="small" />;
    case 'CANCELLED':
      return <CancelIcon fontSize="small" />;
    default:
      return null;
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'PENDING':
      return 'Chờ xử lý';
    case 'CONFIRMED':
      return 'Đã xác nhận';
    case 'SHIPPING':
      return 'Đang giao hàng';
    case 'COMPLETED':
      return 'Hoàn thành';
    case 'CANCELLED':
      return 'Đã hủy';
    default:
      return status;
  }
};

const getPaymentStatusColor = (status) => {
  switch (status) {
    case 'SUCCESS':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'FAILED':
      return 'error';
    default:
      return 'default';
  }
};

const statusTabs = [
  { value: 'PENDING', label: 'Chờ xử lý', icon: <PendingIcon /> },
  { value: 'CONFIRMED', label: 'Đã xác nhận', icon: <CheckCircleIcon /> },
  { value: 'SHIPPING', label: 'Đang giao', icon: <LocalShippingIcon /> },
  { value: 'COMPLETED', label: 'Hoàn thành', icon: <CheckCircleIcon /> },
  { value: 'CANCELLED', label: 'Đã hủy', icon: <CancelIcon /> },
];

const UserOrder = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [expandedRows, setExpandedRows] = useState({});
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedReviewItem, setSelectedReviewItem] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
    image: null,
    imagePreview: null
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [sortBy, setSortBy] = useState('createdAt'); // 'createdAt' | 'totalAmount' | 'productName'
  const [sortDirection, setSortDirection] = useState('desc'); // 'desc' | 'asc'
  const [filterKeyword, setFilterKeyword] = useState('');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('ALL'); // ALL | COD | VNPAY

  const currentStatus = statusTabs[activeTab]?.value || 'PENDING';

  const loadOrders = useCallback(async (status) => {
    try {
      setLoading(true);
      setError('');
      const response = await http.get(`/order?status=${status}`);

      let orderList = [];
      if (Array.isArray(response.data)) {
        orderList = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        orderList = response.data.data;
      }

      setOrders(orderList);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError(err?.response?.data?.message || 'Không thể tải danh sách đơn hàng');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders(currentStatus);
  }, [currentStatus, loadOrders]);

  // Cleanup image preview URL
  useEffect(() => {
    return () => {
      if (reviewForm.imagePreview) {
        URL.revokeObjectURL(reviewForm.imagePreview);
      }
    };
  }, [reviewForm.imagePreview]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setExpandedRows({});
  };

  const handleRefresh = useCallback(() => {
    loadOrders(currentStatus);
  }, [currentStatus, loadOrders]);

  const toggleRowExpand = useCallback((orderId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  }, []);

  const handleOpenReviewDialog = useCallback((order, item) => {
    setSelectedReviewItem({ order, item });
    setReviewForm({
      rating: 5,
      comment: '',
      image: null,
      imagePreview: null
    });
    setReviewDialogOpen(true);
  }, []);

  const handleCloseReviewDialog = useCallback(() => {
    if (!submittingReview) {
      setReviewDialogOpen(false);
      setSelectedReviewItem(null);
      setReviewForm({
        rating: 5,
        comment: '',
        image: null,
        imagePreview: null
      });
    }
  }, [submittingReview]);

  const handleReviewFormChange = useCallback((field, value) => {
    setReviewForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleImageChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      setReviewForm((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  }, []);

  const handleRemoveImage = useCallback(() => {
    if (reviewForm.imagePreview) {
      URL.revokeObjectURL(reviewForm.imagePreview);
    }
    setReviewForm((prev) => ({
      ...prev,
      image: null,
      imagePreview: null
    }));
  }, [reviewForm.imagePreview]);

  const handleSubmitReview = useCallback(async () => {
    if (!selectedReviewItem) return;

    if (!reviewForm.comment || reviewForm.comment.trim() === '') {
      setSnackbar({
        open: true,
        message: 'Vui lòng nhập đánh giá',
        severity: 'error'
      });
      return;
    }

    try {
      setSubmittingReview(true);
      const formData = new FormData();
      formData.append('order_id', selectedReviewItem.order.order_id);
      formData.append('item_id', selectedReviewItem.item.item_id);
      formData.append('rating', String(reviewForm.rating));
      formData.append('comment', reviewForm.comment.trim());
      
      if (reviewForm.image) {
        formData.append('image', reviewForm.image);
      }

      const response = await http.post('/reviews', formData);
      
      if (response?.data?.code === 201 || response?.data?.data) {
        setSnackbar({
          open: true,
          message: 'Đánh giá sản phẩm thành công!',
          severity: 'success'
        });
        handleCloseReviewDialog();
        // Reload orders để cập nhật
        await loadOrders(currentStatus);
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.',
        severity: 'error'
      });
    } finally {
      setSubmittingReview(false);
    }
  }, [selectedReviewItem, reviewForm, loadOrders, currentStatus, handleCloseReviewDialog]);

  const displayedOrders = useMemo(() => {
    let result = [...orders];

    // Filter by product name keyword
    const keyword = filterKeyword.trim().toLowerCase();
    if (keyword) {
      result = result.filter((order) =>
        (order.orderItems || []).some((item) =>
          (item.name || '').toLowerCase().includes(keyword)
        )
      );
    }

    // Filter by payment method
    if (filterPaymentMethod !== 'ALL') {
      const target = filterPaymentMethod.toUpperCase();
      result = result.filter((order) => {
        const raw = (order.orderPayment?.paymentMethod || '').toUpperCase();
        const normalized = raw.replace(/[\s_]/g, ''); // VN_PAY -> VNPAY
        if (target === 'VNPAY') {
          return normalized.includes('VNPAY');
        }
        return normalized === target;
      });
    }

    // Sort
    const dir = sortDirection === 'asc' ? 1 : -1;
    const getProductNameKey = (order) => {
      const names = (order.orderItems || [])
        .map((item) => item.name || '')
        .filter(Boolean);
      if (!names.length) return '';
      names.sort((a, b) => a.localeCompare(b, 'vi', { sensitivity: 'base' }));
      return names[0];
    };

    result.sort((a, b) => {
      if (sortBy === 'productName') {
        const aName = getProductNameKey(a);
        const bName = getProductNameKey(b);
        return dir * aName.localeCompare(bName, 'vi', { sensitivity: 'base' });
      }

      let aVal = 0;
      let bVal = 0;
      if (sortBy === 'createdAt') {
        aVal = new Date(a.createdAt || 0).getTime() || 0;
        bVal = new Date(b.createdAt || 0).getTime() || 0;
      } else if (sortBy === 'totalAmount') {
        aVal = Number(a.totalAmount || 0);
        bVal = Number(b.totalAmount || 0);
      }

      if (aVal === bVal) return 0;
      return aVal > bVal ? dir : -dir;
    });

    return result;
  }, [orders, filterKeyword, filterPaymentMethod, sortBy, sortDirection]);

  if (loading && orders.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Skeleton variant="rectangular" width="100%" height={120} sx={{ borderRadius: 3 }} />
          <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 3 }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <ShoppingCartIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                  Đơn hàng của tôi
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Xem và theo dõi đơn hàng của bạn
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={handleRefresh}
              color="primary"
              sx={{
                bgcolor: 'primary.light',
                '&:hover': { bgcolor: 'primary.main', color: 'white' }
              }}
              disabled={loading}
            >
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>

        <Paper
          elevation={3}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            mb: 3
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant={isMobile ? 'scrollable' : 'fullWidth'}
            scrollButtons="auto"
            sx={{
              borderBottom: '1px solid',
              borderColor: 'divider',
              '& .MuiTab-root': {
                minHeight: 72,
                textTransform: 'none',
                fontSize: '0.95rem',
                fontWeight: 500,
              },
              '& .Mui-selected': {
                color: 'primary.main',
                fontWeight: 700,
              }
            }}
          >
            {statusTabs.map((tab, index) => (
              <Tab
                key={tab.value}
                icon={tab.icon}
                iconPosition="start"
                label={
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'inherit' }}>
                      {tab.label}
                    </Typography>
                    {!loading && (
                      <Typography variant="caption" color="text.secondary">
                        {orders.filter((o) => {
                          const status = o.status?.toUpperCase();
                          if (tab.value === 'COMPLETED') {
                            return status === 'COMPLETED' || status === 'COMPLETED';
                          }
                          if (tab.value === 'CANCELLED') {
                            return status === 'CANCELLED' || status === 'CANCELED';
                          }
                          return status === tab.value;
                        }).length} đơn
                      </Typography>
                    )}
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Paper>

        {/* Bộ lọc & sắp xếp */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            p: 2.5,
            mb: 3,
            bgcolor: 'background.paper',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="sort-by-label">Sắp xếp theo</InputLabel>
                <Select
                  labelId="sort-by-label"
                  value={sortBy}
                  label="Sắp xếp theo"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="createdAt">Thời gian tạo</MenuItem>
                  <MenuItem value="totalAmount">Tổng tiền</MenuItem>
                  <MenuItem value="productName">Tên sản phẩm</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="sort-direction-label">Thứ tự</InputLabel>
                <Select
                  labelId="sort-direction-label"
                  value={sortDirection}
                  label="Thứ tự"
                  onChange={(e) => setSortDirection(e.target.value)}
                >
                  <MenuItem value="desc">Giảm dần</MenuItem>
                  <MenuItem value="asc">Tăng dần</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Tìm theo tên sản phẩm"
                value={filterKeyword}
                onChange={(e) => setFilterKeyword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="payment-filter-label">Thanh toán</InputLabel>
                <Select
                  labelId="payment-filter-label"
                  value={filterPaymentMethod}
                  label="Thanh toán"
                  onChange={(e) => setFilterPaymentMethod(e.target.value)}
                >
                  <MenuItem value="ALL">Tất cả</MenuItem>
                  <MenuItem value="COD">COD</MenuItem>
                  <MenuItem value="VNPAY">VNPAY</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={1} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  setSortBy('createdAt');
                  setSortDirection('desc');
                  setFilterKeyword('');
                  setFilterPaymentMethod('ALL');
                }}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Xóa lọc
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 2,
              '& .MuiAlert-icon': {
                fontSize: 28
              }
            }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {loading && orders.length === 0 ? (
          <Box sx={{ p: 3 }}>
            <Stack spacing={2}>
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
              ))}
            </Stack>
          </Box>
        ) : orders.length === 0 ? (
          <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 3 }}>
            <ShoppingCartIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              Chưa có đơn hàng {getStatusLabel(currentStatus).toLowerCase()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Các đơn hàng {getStatusLabel(currentStatus).toLowerCase()} sẽ hiển thị ở đây
            </Typography>
          </Paper>
        ) : displayedOrders.length === 0 ? (
          <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 3 }}>
            <ShoppingCartIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              Không có đơn hàng phù hợp bộ lọc
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Hãy thử xóa hoặc thay đổi điều kiện lọc/sắp xếp.
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={3}>
            {displayedOrders.map((order) => (
              <Card
                key={order.order_id}
                sx={{
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ flex: 1, minWidth: 200 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Mã đơn hàng
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, mb: 1 }}>
                        {order.order_id}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          icon={getStatusIcon(order.status)}
                          label={getStatusLabel(order.status)}
                          color={getStatusColor(order.status)}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                        <Chip
                          icon={<PaymentIcon fontSize="small" />}
                          label={order.orderPayment?.status || 'N/A'}
                          color={getPaymentStatusColor(order.orderPayment?.status)}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Tổng tiền
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                        {formatCurrencyVnd(order.totalAmount)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        <CalendarTodayIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                        {formatDateTime(order.createdAt)}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOnIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Địa chỉ
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {order.address || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {order.ward}, {order.city}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Số điện thoại
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {order.phoneNumber || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Số lượng sản phẩm
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {order.orderItems?.length || 0} sản phẩm
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Phương thức thanh toán
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {order.orderPayment?.paymentMethod || 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => toggleRowExpand(order.order_id)}
                      endIcon={expandedRows[order.order_id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    >
                      {expandedRows[order.order_id] ? 'Thu gọn' : 'Xem chi tiết'}
                    </Button>
                  </Box>

                  <Collapse in={expandedRows[order.order_id]} timeout="auto" unmountOnExit>
                    <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                            <CardContent>
                              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                                Thông tin giao hàng
                              </Typography>
                              <Stack spacing={1.5}>
                                <Box>
                                  <Typography variant="caption" color="text.secondary">Địa chỉ</Typography>
                                  <Typography variant="body2">
                                    {order.address || 'N/A'}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography variant="caption" color="text.secondary">Thành phố</Typography>
                                  <Typography variant="body2">
                                    {order.city || 'N/A'}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography variant="caption" color="text.secondary">Phường/Xã</Typography>
                                  <Typography variant="body2">
                                    {order.ward || 'N/A'}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography variant="caption" color="text.secondary">Số điện thoại</Typography>
                                  <Typography variant="body2">
                                    {order.phoneNumber || 'N/A'}
                                  </Typography>
                                </Box>
                                {order.note && (
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">Ghi chú</Typography>
                                    <Typography variant="body2">
                                      {order.note}
                                    </Typography>
                                  </Box>
                                )}
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                            <CardContent>
                              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                                Thông tin thanh toán
                              </Typography>
                              <Stack spacing={1.5}>
                                <Box>
                                  <Typography variant="caption" color="text.secondary">Phương thức</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {order.orderPayment?.paymentMethod || 'N/A'}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography variant="caption" color="text.secondary">Trạng thái</Typography>
                                  <Box sx={{ mt: 0.5 }}>
                                    <Chip
                                      icon={getStatusIcon(order.orderPayment?.status)}
                                      label={order.orderPayment?.status || 'N/A'}
                                      color={getPaymentStatusColor(order.orderPayment?.status)}
                                      size="small"
                                      sx={{ fontWeight: 600 }}
                                    />
                                  </Box>
                                </Box>
                                <Box>
                                  <Typography variant="caption" color="text.secondary">Ngày thanh toán</Typography>
                                  <Typography variant="body2">
                                    {formatDateTime(order.orderPayment?.createdAt)}
                                  </Typography>
                                </Box>
                                {order.orderPayment?.paymentNote && (
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">Ghi chú</Typography>
                                    <Typography variant="body2">
                                      {order.orderPayment.paymentNote}
                                    </Typography>
                                  </Box>
                                )}
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={12}>
                          <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                            <CardContent>
                              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                                Sản phẩm trong đơn ({order.orderItems?.length || 0})
                              </Typography>
                              <List>
                                {order.orderItems?.map((item, index) => (
                                  <React.Fragment key={item.item_id || index}>
                                    <ListItem
                                      sx={{
                                        bgcolor: 'white',
                                        borderRadius: 2,
                                        mb: 1,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        alignItems: 'flex-start'
                                      }}
                                    >
                                      <ListItemAvatar>
                                        <Avatar
                                          src={item.imageUrl}
                                          variant="rounded"
                                          sx={{ width: 80, height: 80, mr: 2 }}
                                        />
                                      </ListItemAvatar>
                                      <ListItemText
                                        primary={
                                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
                                              {item.name}
                                            </Typography>
                                            {(order.status === 'COMPLETED' || order.status === 'COMPLETED') && (
                                              <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<RateReviewIcon />}
                                                onClick={() => handleOpenReviewDialog(order, item)}
                                                sx={{
                                                  ml: 2,
                                                  textTransform: 'none',
                                                  fontWeight: 600,
                                                  borderColor: 'primary.main',
                                                  color: 'primary.main',
                                                  '&:hover': {
                                                    bgcolor: 'primary.main',
                                                    color: 'white',
                                                    borderColor: 'primary.main'
                                                  }
                                                }}
                                              >
                                                Đánh giá
                                              </Button>
                                            )}
                                          </Box>
                                        }
                                        secondary={
                                          <Box sx={{ mt: 1 }}>
                                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1 }}>
                                              <Typography variant="caption" color="text.secondary">
                                                Giá gốc: {formatCurrencyVnd(item.originPrice)}
                                              </Typography>
                                              {item.discountPrice !== item.originPrice && (
                                                <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                                                  Giá sau giảm: {formatCurrencyVnd(item.discountPrice)}
                                                </Typography>
                                              )}
                                              <Typography variant="caption" color="text.secondary">
                                                Số lượng: {item.quantity}
                                              </Typography>
                                            </Box>
                                            <Typography variant="body2" color="primary.main" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                                              Tổng: {formatCurrencyVnd(item.total)}
                                            </Typography>
                                          </Box>
                                        }
                                      />
                                    </ListItem>
                                    {index < order.orderItems.length - 1 && <Divider />}
                                  </React.Fragment>
                                ))}
                              </List>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}

        {/* Review Dialog */}
        <Dialog
          open={reviewDialogOpen}
          onClose={handleCloseReviewDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 700, pb: 1, background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <RateReviewIcon />
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Đánh giá sản phẩm
                </Typography>
              </Box>
              <IconButton
                onClick={handleCloseReviewDialog}
                disabled={submittingReview}
                sx={{ color: 'white' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers sx={{ mt: 2 }}>
            {selectedReviewItem && (
              <Box>
                <Box sx={{ display: 'flex', gap: 2, mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Avatar
                    src={selectedReviewItem.item.imageUrl}
                    variant="rounded"
                    sx={{ width: 60, height: 60 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {selectedReviewItem.item.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Mã đơn: {selectedReviewItem.order.order_id.substring(0, 8)}...
                    </Typography>
                  </Box>
                </Box>

                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Đánh giá của bạn *
                    </Typography>
                    <Rating
                      value={reviewForm.rating}
                      onChange={(event, newValue) => {
                        handleReviewFormChange('rating', newValue || 5);
                      }}
                      size="large"
                      sx={{
                        '& .MuiRating-iconFilled': {
                          color: 'warning.main'
                        }
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      {reviewForm.rating === 5 && 'Tuyệt vời!'}
                      {reviewForm.rating === 4 && 'Rất tốt'}
                      {reviewForm.rating === 3 && 'Tốt'}
                      {reviewForm.rating === 2 && 'Tạm được'}
                      {reviewForm.rating === 1 && 'Không hài lòng'}
                    </Typography>
                  </Box>

                  <Box>
                    <TextField
                      label="Nhận xét của bạn *"
                      multiline
                      rows={4}
                      fullWidth
                      value={reviewForm.comment}
                      onChange={(e) => handleReviewFormChange('comment', e.target.value)}
                      placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                      helperText={`${reviewForm.comment.length} ký tự`}
                    />
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Hình ảnh (tùy chọn)
                    </Typography>
                    {reviewForm.imagePreview ? (
                      <Box sx={{ position: 'relative', display: 'inline-block' }}>
                        <Box
                          component="img"
                          src={reviewForm.imagePreview}
                          alt="Preview"
                          sx={{
                            width: '100%',
                            maxWidth: 300,
                            maxHeight: 300,
                            borderRadius: 2,
                            objectFit: 'cover',
                            border: '1px solid',
                            borderColor: 'divider'
                          }}
                        />
                        <IconButton
                          onClick={handleRemoveImage}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'error.main',
                            color: 'white',
                            '&:hover': {
                              bgcolor: 'error.dark'
                            }
                          }}
                          size="small"
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ) : (
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<ImageIcon />}
                        sx={{ textTransform: 'none' }}
                      >
                        Chọn ảnh
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </Button>
                    )}
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      Tải lên hình ảnh để chia sẻ trải nghiệm của bạn
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={handleCloseReviewDialog}
              disabled={submittingReview}
              sx={{ fontWeight: 600 }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmitReview}
              variant="contained"
              disabled={submittingReview || !reviewForm.comment.trim()}
              startIcon={submittingReview ? <CircularProgress size={16} color="inherit" /> : <RateReviewIcon />}
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #FF5252 30%, #FF7043 90%)',
                },
                '&:disabled': {
                  background: 'grey.300'
                }
              }}
            >
              {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <MuiAlert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </MuiAlert>
        </Snackbar>
      </motion.div>
    </Container>
  );
};

export default UserOrder;

