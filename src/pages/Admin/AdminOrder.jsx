import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
  Select,
  FormControl,
  MenuItem,
  Skeleton,
  Stack,
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Snackbar
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
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
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Sort as SortIcon,
} from '@mui/icons-material';
import http from '../../api/http';

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

const getPaymentStatusIcon = (status) => {
  switch (status) {
    case 'SUCCESS':
      return <CheckCircleIcon fontSize="small" />;
    case 'PENDING':
      return <PendingIcon fontSize="small" />;
    case 'FAILED':
      return <CancelIcon fontSize="small" />;
    default:
      return <PaymentIcon fontSize="small" />;
  }
};

// Normalize order status coming from API (also support "CANCELED")
const normalizeOrderStatus = (status) => {
  const s = (status || 'PENDING').toString().toUpperCase();
  if (s === 'CANCELED') return 'CANCELLED';
  return s;
};

const STATUS_LABELS = {
  PENDING: 'Chờ xử lý',
  CONFIRMED: 'Đã xác nhận',
  SHIPPING: 'Đang giao',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

// Allowed transitions (workflow rules)
const STATUS_TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPING', 'CANCELLED'],
  SHIPPING: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

const getAllowedNextStatuses = (status) => STATUS_TRANSITIONS[normalizeOrderStatus(status)] || [];

const renderOrderStatusOption = (status) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    {getStatusIcon(status)}
    <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
      <Typography variant="body2" sx={{ fontWeight: 700 }}>{status}</Typography>
      <Typography variant="caption" color="text.secondary">
        {STATUS_LABELS[status] || ''}
      </Typography>
    </Box>
  </Box>
);


const AdminOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState({});
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await http.get('/order/all');

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
    loadOrders();
  }, [loadOrders]);

  const handleSearch = useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);

  const handleRefresh = useCallback(() => {
    loadOrders();
  }, [loadOrders]);

  const toggleRowExpand = useCallback((orderId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  }, []);

  const handleStatusChange = useCallback(async (orderId, newStatus, currentStatusRaw) => {
    const fromStatus = normalizeOrderStatus(currentStatusRaw);
    const toStatus = normalizeOrderStatus(newStatus);

    if (fromStatus === toStatus) return;

    const allowedNext = getAllowedNextStatuses(fromStatus);
    if (!allowedNext.includes(toStatus)) {
      setSnackbar({
        open: true,
        message: `Không thể chuyển trạng thái từ ${fromStatus} sang ${toStatus}.`,
        severity: 'warning'
      });
      return;
    }

    try {
      setUpdatingStatus((prev) => ({ ...prev, [orderId]: true }));
      await http.put('/order/status', {
        orderId,
        status: toStatus
      });

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.order_id === orderId ? { ...order, status: toStatus } : order
        )
      );

      setSnackbar({
        open: true,
        message: 'Cập nhật trạng thái đơn hàng thành công!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error updating order status:', err);
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Không thể cập nhật trạng thái đơn hàng',
        severity: 'error'
      });
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [orderId]: false }));
    }
  }, []);

const filteredOrders = useMemo(() => {
    let result = orders;
    
    // Filter by search term
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter((order) => {
        const orderId = (order.order_id || '').toLowerCase();
        const phone = (order.phoneNumber || '').toLowerCase();
        const address = (order.address || '').toLowerCase();
        const status = (order.status || '').toLowerCase();
        return orderId.includes(q) || phone.includes(q) || address.includes(q) || status.includes(q);
      });
    }

    // Sort orders
    if (sortField) {
      result = [...result].sort((a, b) => {
        let aValue, bValue;

        switch (sortField) {
          case 'order_id':
            aValue = (a.order_id || '').toLowerCase();
            bValue = (b.order_id || '').toLowerCase();
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt || 0).getTime();
            bValue = new Date(b.createdAt || 0).getTime();
            break;
          case 'phoneNumber':
            aValue = (a.phoneNumber || '').toLowerCase();
            bValue = (b.phoneNumber || '').toLowerCase();
            break;
          case 'address':
            aValue = (a.address || '').toLowerCase();
            bValue = (b.address || '').toLowerCase();
            break;
          case 'orderItemsCount':
            aValue = (a.orderItems?.length || 0);
            bValue = (b.orderItems?.length || 0);
            break;
          case 'totalAmount':
            aValue = Number(a.totalAmount || 0);
            bValue = Number(b.totalAmount || 0);
            break;
          case 'paymentStatus':
            aValue = (a.orderPayment?.status || '').toLowerCase();
            bValue = (b.orderPayment?.status || '').toLowerCase();
            break;
          case 'status':
            // Sắp xếp theo thứ tự workflow: PENDING -> CONFIRMED -> SHIPPING -> COMPLETED -> CANCELLED
            const statusOrder = {
              'PENDING': 1,
              'CONFIRMED': 2,
              'SHIPPING': 3,
              'COMPLETED': 4,
              'CANCELLED': 5,
              'CANCELED': 5 // Hỗ trợ cả CANCELED
            };
            const aStatus = (a.status || '').toUpperCase();
            const bStatus = (b.status || '').toUpperCase();
            aValue = statusOrder[aStatus] || 999; // Status không xác định sẽ ở cuối
            bValue = statusOrder[bStatus] || 999;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [orders, searchTerm, sortField, sortOrder]);

  const statusCounts = useMemo(() => {
    const counts = {
      PENDING: 0,
      CONFIRMED: 0,
      SHIPPING: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };

    for (const o of orders) {
      const s = normalizeOrderStatus(o.status);
      if (counts[s] !== undefined) counts[s] += 1;
    }

    return counts;
  }, [orders]);

const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => normalizeOrderStatus(o.status) === 'COMPLETED')
      .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  }, [orders]);

if (loading && orders.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Skeleton variant="rectangular" width="100%" height={120} sx={{ borderRadius: 3 }} />
          <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 3 }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
              <ShoppingCartIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                Quản lý Đơn hàng
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Xem và quản lý tất cả đơn hàng trong hệ thống
              </Typography>
            </Box>
          </Box>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)', 
                color: 'white', 
                borderRadius: 3,
                boxShadow: '0 8px 16px rgba(255, 152, 0, 0.3)',
                height: '100%'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {loading ? <Skeleton width={60} /> : statusCounts.PENDING}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.95rem' }}>Chờ xử lý</Typography>
                    </Box>
                    <PendingIcon sx={{ fontSize: 48, opacity: 0.9 }} />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)', 
                color: 'white', 
                borderRadius: 3,
                boxShadow: '0 8px 16px rgba(33, 150, 243, 0.3)',
                height: '100%'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {loading ? <Skeleton width={60} /> : statusCounts.CONFIRMED}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.95rem' }}>Đã xác nhận</Typography>
                    </Box>
                    <CheckCircleIcon sx={{ fontSize: 48, opacity: 0.9 }} />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)', 
                color: 'white', 
                borderRadius: 3,
                boxShadow: '0 8px 16px rgba(156, 39, 176, 0.3)',
                height: '100%'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {loading ? <Skeleton width={60} /> : statusCounts.SHIPPING}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.95rem' }}>Đang giao</Typography>
                    </Box>
                    <LocalShippingIcon sx={{ fontSize: 48, opacity: 0.9 }} />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)', 
                color: 'white', 
                borderRadius: 3,
                boxShadow: '0 8px 16px rgba(76, 175, 80, 0.3)',
                height: '100%'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {loading ? <Skeleton width={60} /> : statusCounts.COMPLETED}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.95rem' }}>Hoàn thành</Typography>
                    </Box>
                    <CheckCircleIcon sx={{ fontSize: 48, opacity: 0.9 }} />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)', 
                color: 'white', 
                borderRadius: 3,
                boxShadow: '0 8px 16px rgba(244, 67, 54, 0.3)',
                height: '100%'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {loading ? <Skeleton width={60} /> : statusCounts.CANCELLED}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.95rem' }}>Đã hủy</Typography>
                    </Box>
                    <CancelIcon sx={{ fontSize: 48, opacity: 0.9 }} />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      {loading ? <Skeleton width={100} /> : orders.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Tổng đơn hàng</Typography>
                  </Box>
                  <ShoppingCartIcon sx={{ fontSize: 48, color: 'primary.main', opacity: 0.9 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      {loading ? <Skeleton width={150} /> : formatCurrencyVnd(totalRevenue)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Tổng doanh thu</Typography>
                  </Box>
                  <AttachMoneyIcon sx={{ fontSize: 48, color: 'success.main', opacity: 0.9 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper 
          elevation={3} 
          sx={{ 
            borderRadius: 3, 
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}
        >
          <Box sx={{ 
            p: 3, 
            borderBottom: '1px solid', 
            borderColor: 'divider', 
            background: 'linear-gradient(90deg, #f8f9fa 0%, #ffffff 100%)'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', flex: 1 }}>
                <TextField
                  placeholder="Tìm kiếm đơn hàng theo ID, số điện thoại, địa chỉ..."
                  value={searchTerm}
                  onChange={handleSearch}
                  size="medium"
                  sx={{ 
                    minWidth: 320,
                    flex: 1,
                    maxWidth: 500,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'white',
                      '&:hover': {
                        backgroundColor: 'grey.50'
                      }
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                {searchTerm && (
                  <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                    Tìm thấy {filteredOrders.length} đơn hàng
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SortIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                    Sắp xếp:
                  </Typography>
                </Box>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <Select
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value)}
                    displayEmpty
                    sx={{
                      bgcolor: 'white',
                      borderRadius: 2,
                      '& .MuiSelect-select': {
                        py: 1
                      }
                    }}
                  >
                    <MenuItem value="createdAt">Ngày đặt hàng</MenuItem>
                    <MenuItem value="order_id">Mã đơn hàng</MenuItem>
                    <MenuItem value="phoneNumber">Số điện thoại</MenuItem>
                    <MenuItem value="address">Địa chỉ</MenuItem>
                    <MenuItem value="orderItemsCount">Số lượng SP</MenuItem>
                    <MenuItem value="totalAmount">Tổng tiền</MenuItem>
                    <MenuItem value="paymentStatus">Thanh toán</MenuItem>
                    <MenuItem value="status">Trạng thái</MenuItem>
                  </Select>
                </FormControl>
                <Tooltip title={sortOrder === 'asc' ? 'Tăng dần (A-Z, 0-9)' : 'Giảm dần (Z-A, 9-0)'}>
                  <IconButton
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    sx={{
                      bgcolor: sortOrder === 'asc' ? 'success.light' : 'info.light',
                      color: sortOrder === 'asc' ? 'success.main' : 'info.main',
                      '&:hover': {
                        bgcolor: sortOrder === 'asc' ? 'success.main' : 'info.main',
                        color: 'white'
                      }
                    }}
                  >
                    {sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Làm mới dữ liệu">
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
                </Tooltip>
              </Box>
            </Box>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                m: 3,
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
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
                ))}
              </Stack>
            </Box>
          ) : filteredOrders.length === 0 ? (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <ShoppingCartIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                {searchTerm ? 'Không tìm thấy đơn hàng nào' : 'Chưa có đơn hàng nào'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Danh sách đơn hàng trống'}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Mã đơn</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Ngày đặt</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Khách hàng</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Địa chỉ</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Số lượng SP</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Tổng tiền</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Thanh toán</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Trạng thái</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2, textAlign: 'center' }}>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <React.Fragment key={order.order_id}>
                      <TableRow
                        sx={{
                          '&:hover': {
                            bgcolor: 'grey.50',
                            transition: 'all 0.2s ease-in-out'
                          },
                          transition: 'all 0.2s ease-in-out',
                          cursor: 'pointer'
                        }}
                        onClick={() => toggleRowExpand(order.order_id)}
                      >
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                            {order.order_id?.substring(0, 8)}...
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {formatDateTime(order.createdAt)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {order.phoneNumber || 'N/A'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                maxWidth: 200,
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {order.address || 'N/A'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {order.orderItems?.length || 0} sản phẩm
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {formatCurrencyVnd(order.totalAmount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getPaymentStatusIcon(order.orderPayment?.status)}
                            label={order.orderPayment?.status || 'N/A'}
                            color={getPaymentStatusColor(order.orderPayment?.status)}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          {(() => {
                            const currentStatus = normalizeOrderStatus(order.status);
                            const nextStatuses = getAllowedNextStatuses(currentStatus);
                            const locked = nextStatuses.length === 0;
                            const updating = Boolean(updatingStatus[order.order_id]);

                            if (locked) {
                              return (
                                <Tooltip title="Trạng thái cuối - không thể thay đổi">
                                  <Chip
                                    icon={getStatusIcon(currentStatus)}
                                    label={currentStatus}
                                    color={getStatusColor(currentStatus)}
                                    size="small"
                                    sx={{ fontWeight: 700 }}
                                  />
                                </Tooltip>
                              );
                            }

                            return (
                              <Tooltip title={`Có thể chuyển sang: ${nextStatuses.join(', ')}`}>
                                <FormControl size="small" sx={{ minWidth: 180 }} onClick={(e) => e.stopPropagation()}>
                                  <Select
                                    value={currentStatus}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => handleStatusChange(order.order_id, e.target.value, currentStatus)}
                                    disabled={updating}
                                    renderValue={(selected) => (
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {getStatusIcon(selected)}
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                          {selected}
                                        </Typography>
                                      </Box>
                                    )}
                                    sx={{
                                      bgcolor: 'white',
                                      borderRadius: 2,
                                      '& .MuiSelect-select': {
                                        py: 0.75,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                      }
                                    }}
                                  >
                                    <MenuItem value={currentStatus} disabled>
                                      {renderOrderStatusOption(currentStatus)}
                                    </MenuItem>
                                    <Divider />
                                    {nextStatuses.map((s) => (
                                      <MenuItem key={s} value={s}>
                                        {renderOrderStatusOption(s)}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </Tooltip>
                            );
                          })()}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRowExpand(order.order_id);
                            }}
                          >
                            {expandedRows[order.order_id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={9} sx={{ py: 0, border: 0 }}>
                          <Collapse in={expandedRows[order.order_id]} timeout="auto" unmountOnExit>
                            <Box sx={{ p: 3, bgcolor: 'grey.50' }}>
                              <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                  <Card sx={{ mb: 2 }}>
                                    <CardContent>
                                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                                        Thông tin đơn hàng
                                      </Typography>
                                      <Stack spacing={1.5}>
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">Mã đơn hàng</Typography>
                                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                            {order.order_id}
                                          </Typography>
                                        </Box>
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">Trạng thái</Typography>
                                          <Box sx={{ mt: 0.5 }}>
                                            <Chip
                                              icon={getStatusIcon(normalizeOrderStatus(order.status))}
                                              label={normalizeOrderStatus(order.status)}
                                              color={getStatusColor(normalizeOrderStatus(order.status))}
                                              size="small"
                                              sx={{ fontWeight: 600 }}
                                            />
                                          </Box>
                                        </Box>
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">Tổng tiền</Typography>
                                          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                            {formatCurrencyVnd(order.totalAmount)}
                                          </Typography>
                                        </Box>
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">Ngày tạo</Typography>
                                          <Typography variant="body2">
                                            {formatDateTime(order.createdAt)}
                                          </Typography>
                                        </Box>
                                      </Stack>
                                    </CardContent>
                                  </Card>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Card sx={{ mb: 2 }}>
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
                                <Grid item xs={12}>
                                  <Card>
                                    <CardContent>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                          Thông tin thanh toán
                                        </Typography>
                                        <Chip
                                          icon={getPaymentStatusIcon(order.orderPayment?.status)}
                                          label={order.orderPayment?.status || 'N/A'}
                                          color={getPaymentStatusColor(order.orderPayment?.status)}
                                          size="small"
                                          sx={{ fontWeight: 600 }}
                                        />
                                      </Box>
                                      <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6} md={3}>
                                          <Typography variant="caption" color="text.secondary">Phương thức</Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {order.orderPayment?.paymentMethod || 'N/A'}
                                          </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                          <Typography variant="caption" color="text.secondary">Trạng thái</Typography>
                                          <Typography variant="body2">
                                            {order.orderPayment?.status || 'N/A'}
                                          </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                          <Typography variant="caption" color="text.secondary">Ghi chú</Typography>
                                          <Typography variant="body2">
                                            {order.orderPayment?.paymentNote || 'Không có'}
                                          </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                          <Typography variant="caption" color="text.secondary">Ngày thanh toán</Typography>
                                          <Typography variant="body2">
                                            {formatDateTime(order.orderPayment?.createdAt)}
                                          </Typography>
                                        </Grid>
                                      </Grid>
                                    </CardContent>
                                  </Card>
                                </Grid>
                                <Grid item xs={12}>
                                  <Card>
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
                                                borderColor: 'divider'
                                              }}
                                            >
                                              <ListItemAvatar>
                                                <Avatar
                                                  src={item.imageUrl}
                                                  variant="rounded"
                                                  sx={{ width: 60, height: 60 }}
                                                />
                                              </ListItemAvatar>
                                              <ListItemText
                                                primary={
                                                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                    {item.name}
                                                  </Typography>
                                                }
                                                secondary={
                                                  <Box sx={{ mt: 1 }}>
                                                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
                                                      <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700 }}>
                                                        Tổng: {formatCurrencyVnd(item.total)}
                                                      </Typography>
                                                    </Box>
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
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </motion.div>
    </Container>
  );
};

export default AdminOrder;

