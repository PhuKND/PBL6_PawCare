import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  LinearProgress,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Rating
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as MoneyIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  LocalPharmacy as PharmacyIcon,
  Inventory as InventoryIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import http from '../../api/http';

const AdminDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(false);
  const [loadingRevenueData, setLoadingRevenueData] = useState(false);
  const [loadingRecentOrders, setLoadingRecentOrders] = useState(false);
  const [loadingCategoryData, setLoadingCategoryData] = useState(false);
  const [loadingTopProducts, setLoadingTopProducts] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [revenueData, setRevenueData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    revenueGrowth: 0,
    orderGrowth: 0,
    userGrowth: 0,
    productGrowth: 0
  });

  const transformRevenueData = (apiData) => {
    if (!apiData || typeof apiData !== 'object') return [];
    
    const monthMap = {
      january: 'Tháng 1',
      february: 'Tháng 2',
      march: 'Tháng 3',
      april: 'Tháng 4',
      may: 'Tháng 5',
      june: 'Tháng 6',
      july: 'Tháng 7',
      august: 'Tháng 8',
      september: 'Tháng 9',
      october: 'Tháng 10',
      november: 'Tháng 11',
      december: 'Tháng 12'
    };

    const monthShortMap = {
      january: 'T1',
      february: 'T2',
      march: 'T3',
      april: 'T4',
      may: 'T5',
      june: 'T6',
      july: 'T7',
      august: 'T8',
      september: 'T9',
      october: 'T10',
      november: 'T11',
      december: 'T12'
    };

    return Object.keys(monthMap).map((key) => ({
      month: monthShortMap[key],
      monthFull: monthMap[key],
      revenue: Number(apiData[key] || 0)
    }));
  };

  const categoryColors = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1',
    '#ffb347', '#87ceeb', '#dda0dd', '#f0e68c', '#98d8c8',
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7'
  ];

  const transformCategoryData = (apiData) => {
    if (!Array.isArray(apiData) || apiData.length === 0) return [];
    
    return apiData.map((item, index) => ({
      name: item.categoryName || 'Không tên',
      value: Number(item.percentage || 0),
      color: categoryColors[index % categoryColors.length]
    }));
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      
      const diffMs = now.getTime() - date.getTime();
      
      if (diffMs < 0) return 'Vừa xong';
      
      const diffSeconds = Math.floor(diffMs / 1000);
      if (diffSeconds < 60) return `${diffSeconds} giây trước`;
      
      const diffMinutes = Math.floor(diffSeconds / 60);
      if (diffMinutes < 60) return `${diffMinutes} phút trước`;
      
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours} giờ trước`;
      
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 30) return `${diffDays} ngày trước`;
      
      const diffMonths = Math.floor(diffDays / 30);
      if (diffMonths < 12) {
        const remainingDays = diffDays % 30;
        if (remainingDays > 0) {
          return `${diffMonths} tháng ${remainingDays} ngày trước`;
        }
        return `${diffMonths} tháng trước`;
      }
      
      const diffYears = Math.floor(diffMonths / 12);
      const remainingMonths = diffMonths % 12;
      const remainingDays = diffDays % 365;
      const remainingHours = diffHours % 24;
      const remainingMinutes = diffMinutes % 60;
      const remainingSeconds = diffSeconds % 60;
      
      const parts = [];
      if (diffYears > 0) parts.push(`${diffYears} năm`);
      if (remainingMonths > 0) parts.push(`${remainingMonths} tháng`);
      if (remainingDays > 0) parts.push(`${remainingDays} ngày`);
      if (remainingHours > 0) parts.push(`${remainingHours} giờ`);
      if (remainingMinutes > 0) parts.push(`${remainingMinutes} phút`);
      if (remainingSeconds > 0 && parts.length < 3) parts.push(`${remainingSeconds} giây`);
      
      return parts.length > 0 ? `${parts.join(' ')} trước` : 'Vừa xong';
    } catch (error) {
      return 'N/A';
    }
  };

  useEffect(() => {
    const loadTopProducts = async () => {
      setLoadingTopProducts(true);
      try {
        const response = await http.get('/products/top-selling');
        let products = [];
        
        if (Array.isArray(response.data)) {
          products = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          products = response.data.data;
        }

        setTopProducts(products);
      } catch (err) {
        console.error('Error loading top selling products:', err);
        setTopProducts([]);
      } finally {
        setLoadingTopProducts(false);
      }
    };

    loadTopProducts();
  }, []);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const productCountResponse = await http.get('/products/counts');
        const productCount = productCountResponse?.data?.data ?? productCountResponse?.data ?? 0;

        const orderCountResponse = await http.get('/order/count');
        const orderCount = orderCountResponse?.data?.data ?? orderCountResponse?.data ?? 0;

        const userCountResponse = await http.get('/users/count');
        const userCount = userCountResponse?.data?.data ?? userCountResponse?.data ?? 0;

        const revenueResponse = await http.get('/order/revenues');
        const revenue = revenueResponse?.data?.data ?? revenueResponse?.data ?? 0;

        setStats((prev) => ({
          ...prev,
          totalProducts: Number(productCount) || 0,
          totalOrders: Number(orderCount) || 0,
          totalUsers: Number(userCount) || 0,
          totalRevenue: Number(revenue) || 0
        }));
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  useEffect(() => {
    const loadRevenueByMonth = async () => {
      setLoadingRevenueData(true);
      try {
        const response = await http.get(`/order/revenues/months?year=${selectedYear}`);
        const apiData = response?.data?.data ?? {};
        const transformedData = transformRevenueData(apiData);
        setRevenueData(transformedData);
      } catch (err) {
        console.error('Error loading revenue by month:', err);
        setRevenueData([]);
      } finally {
        setLoadingRevenueData(false);
      }
    };

    loadRevenueByMonth();
  }, [selectedYear]);

  useEffect(() => {
    const loadRecentOrders = async () => {
      setLoadingRecentOrders(true);
      try {
        const response = await http.get('/order/all');
        let orders = [];
        
        if (Array.isArray(response.data)) {
          orders = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          orders = response.data.data;
        }

        const sortedOrders = orders
          .sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
          })
          .slice(0, 10);

        setRecentOrders(sortedOrders);
      } catch (err) {
        console.error('Error loading recent orders:', err);
        setRecentOrders([]);
      } finally {
        setLoadingRecentOrders(false);
      }
    };

    loadRecentOrders();
  }, []);

  useEffect(() => {
    const loadCategoryData = async () => {
      setLoadingCategoryData(true);
      try {
        const response = await http.get('/products/categories/counts');
        let apiData = [];
        
        if (Array.isArray(response.data)) {
          apiData = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          apiData = response.data.data;
        }

        const transformedData = transformCategoryData(apiData);
        setCategoryData(transformedData);
      } catch (err) {
        console.error('Error loading category data:', err);
        setCategoryData([]);
      } finally {
        setLoadingCategoryData(false);
      }
    };

    loadCategoryData();
  }, []);

  const StatCard = ({ title, value, icon, color, prefix = '' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${color}15, ${color}05)` }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
              {icon}
            </Avatar>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: color }}>
                {prefix}{value.toLocaleString('vi-VN')}
              </Typography>
              {/* <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {growth > 0 ? (
                  <ArrowUpIcon sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                ) : (
                  <ArrowDownIcon sx={{ color: 'error.main', fontSize: 16, mr: 0.5 }} />
                )}
                <Typography
                  variant="body2"
                  sx={{
                    color: growth > 0 ? 'success.main' : 'error.main',
                    fontWeight: 600
                  }}
                >
                  {Math.abs(growth)}%
                </Typography>
              </Box> */}
            </Box>
          </Box>
          <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {title}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'shipped': return 'info';
      case 'processing': return 'primary';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'pending': return 'Chờ xử lý';
      case 'shipped': return 'Đã giao';
      case 'processing': return 'Đang xử lý';
      default: return status;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 4 }}>
      <Container maxWidth="xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >

          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                  Bảng điều khiển Admin
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Tổng quan về hoạt động của MedStore
                </Typography>
              </Box>
              <Tooltip title="Làm mới dữ liệu">
                <IconButton
                  onClick={() => window.location.reload()}
                  sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
            {loading && <LinearProgress sx={{ mb: 2 }} />}
          </Box>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Tổng doanh thu"
                value={stats.totalRevenue}
                // growth={stats.revenueGrowth}
                icon={<MoneyIcon />}
                color="#4caf50"
                prefix="₫"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Tổng đơn hàng"
                value={stats.totalOrders}
                // growth={stats.orderGrowth}
                icon={<ShoppingCartIcon />}
                color="#2196f3"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Tổng người dùng"
                value={stats.totalUsers}
                // growth={stats.userGrowth}
                icon={<PeopleIcon />}
                color="#ff9800"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Tổng sản phẩm"
                value={stats.totalProducts}
                // growth={stats.productGrowth}
                icon={<InventoryIcon />}
                color="#9c27b0"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 4 }}>

            <Grid item xs={12} lg={8}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Paper sx={{ p: 3, height: 400 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Biểu đồ doanh thu theo tháng
                    </Typography>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel id="year-select-label">Năm</InputLabel>
                      <Select
                        labelId="year-select-label"
                        value={selectedYear}
                        label="Năm"
                        onChange={(e) => setSelectedYear(e.target.value)}
                        sx={{
                          bgcolor: 'white',
                          borderRadius: 1
                        }}
                      >
                        {Array.from({ length: 5 }, (_, i) => {
                          const year = new Date().getFullYear() - i;
                          return (
                            <MenuItem key={year} value={year}>
                              {year}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </Box>
                  {loadingRevenueData ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                      <CircularProgress />
                    </Box>
                  ) : revenueData.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                      <Typography variant="body2" color="text.secondary">
                        Không có dữ liệu doanh thu cho năm {selectedYear}
                      </Typography>
                    </Box>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip 
                          formatter={(value) => [`₫${Number(value).toLocaleString('vi-VN')}`, 'Doanh thu']}
                          labelFormatter={(label) => `Tháng ${label}`}
                        />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#4caf50"
                          strokeWidth={3}
                          dot={{ fill: '#4caf50', strokeWidth: 2, r: 6 }}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </Paper>
              </motion.div>
            </Grid>

            <Grid item xs={12} lg={4}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Paper sx={{ p: 3, height: 400, overflow: 'hidden' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Phân bố theo danh mục
                    </Typography>
                    {loadingCategoryData && <CircularProgress size={20} />}
                  </Box>
                  <Box
                    sx={{
                      height: 320,
                      overflowY: 'auto',
                      pr: 1,
                      '&::-webkit-scrollbar': {
                        width: 6
                      },
                      '&::-webkit-scrollbar-track': {
                        bgcolor: 'transparent'
                      },
                      '&::-webkit-scrollbar-thumb': {
                        bgcolor: 'rgba(0,0,0,0.2)',
                        borderRadius: 3
                      }
                    }}
                  >
                    {loadingCategoryData ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
                        <CircularProgress />
                      </Box>
                    ) : categoryData.length === 0 ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
                        <Typography variant="body2" color="text.secondary">
                          Không có dữ liệu danh mục
                        </Typography>
                      </Box>
                    ) : (
                      <>
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart
                            margin={{
                              top: 8,
                              right: 8,
                              bottom: 8,
                              left: 8
                            }}
                          >
                            <Pie
                              data={categoryData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={90}
                              paddingAngle={5}
                              dataKey="value"
                              label={false}
                              labelLine={false}
                            >
                              {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip 
                              formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Tỷ lệ']}
                              labelFormatter={(label) => label}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <Box sx={{ mt: 2 }}>
                          {categoryData.map((item, index) => (
                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    bgcolor: item.color,
                                    borderRadius: '50%',
                                    mr: 1,
                                    flexShrink: 0
                                  }}
                                />
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {item.name}
                                </Typography>
                              </Box>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: item.color, ml: 1 }}>
                                {item.value.toFixed(1)}%
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </>
                    )}
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>

 
          <Grid container spacing={3}>
    
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Paper sx={{ p: 3, height: 400, overflow: 'auto' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Đơn hàng gần đây
                    </Typography>
                    {loadingRecentOrders && <CircularProgress size={20} />}
                  </Box>
                  {loadingRecentOrders ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                      <CircularProgress />
                    </Box>
                  ) : recentOrders.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                      <Typography variant="body2" color="text.secondary">
                        Chưa có đơn hàng nào
                      </Typography>
                    </Box>
                  ) : (
                    <List>
                      {recentOrders.map((order, index) => (
                        <React.Fragment key={order.order_id || index}>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: 'primary.main' }}>
                                <ShoppingCartIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                                    {order.order_id?.substring(0)}
                                  </Typography>
                                  <Chip
                                    label={getStatusText(order.status)}
                                    color={getStatusColor(order.status)}
                                    size="small"
                                    sx={{ fontWeight: 600 }}
                                  />
                                </Box>
                              }
                              secondary={
                                <Box sx={{ mt: 1 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                                    <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                    <Typography variant="body2" color="text.secondary">
                                      {order.phoneNumber || 'N/A'}
                                    </Typography>
                                  </Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main', mb: 0.5 }}>
                                    ₫{Number(order.totalAmount || 0).toLocaleString('vi-VN')}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {getTimeAgo(order.createdAt)}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                          {index < recentOrders.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  )}
                </Paper>
              </motion.div>
            </Grid>

      
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Paper sx={{ p: 3, height: 400, overflow: 'auto' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Sản phẩm bán chạy
                    </Typography>
                    {loadingTopProducts && <CircularProgress size={20} />}
                  </Box>
                  {loadingTopProducts ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                      <CircularProgress />
                    </Box>
                  ) : topProducts.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                      <Typography variant="body2" color="text.secondary">
                        Chưa có sản phẩm bán chạy
                      </Typography>
                    </Box>
                  ) : (
                    <List>
                      {topProducts.map((product, index) => (
                        <React.Fragment key={product.id || index}>
                          <ListItem sx={{ px: 0, alignItems: 'flex-start' }}>
                            <ListItemAvatar>
                              <Avatar
                                src={product.imageUrl}
                                variant="rounded"
                                sx={{
                                  bgcolor: 'success.main',
                                  width: 56,
                                  height: 56,
                                  borderRadius: 2
                                }}
                              >
                                {!product.imageUrl && <PharmacyIcon />}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                                  <Typography
                                    variant="subtitle2"
                                    sx={{
                                      fontWeight: 600,
                                      flex: 1,
                                      minWidth: 0,
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis'
                                    }}
                                  >
                                    {product.name}
                                  </Typography>
                                  {/* <Chip
                                    label={`#${index + 1}`}
                                    color="primary"
                                    size="small"
                                    icon={<StarIcon />}
                                    sx={{ flexShrink: 0 }}
                                  /> */}
                                </Box>
                              }
                              secondary={
                                <Box sx={{ mt: 1 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <ShoppingCartIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                    <Typography variant="body2" color="text.secondary">
                                      Đã bán: {product.soldQuantity || 0}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <Rating
                                      value={Number(product.ratingAvg) || 0}
                                      precision={0.1}
                                      readOnly
                                      size="small"
                                    />
                                    <Typography variant="caption" color="text.secondary">
                                      ({Number(product.ratingAvg) || 0})
                                    </Typography>
                                  </Box>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 600,
                                      color: 'success.main',
                                      mt: 0.5
                                    }}
                                  >
                                    {product.discountPrice
                                      ? `₫${Number(product.discountPrice).toLocaleString('vi-VN')}`
                                      : product.originPrice
                                      ? `₫${Number(product.originPrice).toLocaleString('vi-VN')}`
                                      : 'N/A'}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                          {index < topProducts.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  )}
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
