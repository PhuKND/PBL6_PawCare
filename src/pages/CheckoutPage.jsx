import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  TextField,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Chip,
  useTheme,
  useMediaQuery,
  Stepper,
  Step,
  StepLabel,
  Avatar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Payment as PaymentIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  ShoppingCart as ShoppingCartIcon,
  Notes as NotesIcon,
} from '@mui/icons-material';
import http from '../api/http';

const formatCurrency = (price, currency = 'VND') => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency,
  }).format(Number(price || 0));
};

const steps = ['Thông tin giao hàng', 'Xác nhận đơn hàng', 'Thanh toán'];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [userInfo, setUserInfo] = useState({
    email: '',
    fullName: '',
    phoneNumber: '',
    address: '',
    city: '',
    ward: '',
    avatarUrl: '',
  });

  const [orderData, setOrderData] = useState({
    address: '',
    city: '',
    ward: '',
    phoneNumber: '',
    note: '',
    paymentType: 'VNPAY',
    paymentNote: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      let items = [];
      const selectedFromCart = location.state?.selectedItems;
      if (Array.isArray(selectedFromCart) && selectedFromCart.length > 0) {
        items = selectedFromCart;
      } else {
        const cartResponse = await http.get('/carts/items/mycarts');
        if (Array.isArray(cartResponse.data)) {
          items = cartResponse.data;
        } else if (cartResponse.data?.data && Array.isArray(cartResponse.data.data)) {
          items = cartResponse.data.data;
        } else if (cartResponse.data?.data?.content && Array.isArray(cartResponse.data.data.content)) {
          items = cartResponse.data.data.content;
        }
      }

      if (items.length === 0) {
        setError('Không có sản phẩm được chọn để thanh toán. Vui lòng quay lại giỏ hàng.');
        setTimeout(() => navigate('/cart'), 2000);
        return;
      }

      setCartItems(items);


      try {
        const userResponse = await http.get('http://127.0.0.1:8080/api/v1/users/info');
        const userData = userResponse.data?.data || userResponse.data;
        const user = {
          email: userData.email || '',
          fullName: userData.fullName || '',
          phoneNumber: userData.phoneNumber || '',
          address: userData.address || '',
          city: userData.city || '',
          ward: userData.ward || '',
          avatarUrl: userData.avatarUrl || '',
        };
        setUserInfo(user);
        setOrderData((prev) => ({
          ...prev,
          phoneNumber: user.phoneNumber,
          address: user.address,
          city: user.city,
          ward: user.ward,
        }));
      } catch (err) {
        console.warn('Could not load user info:', err);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      let errorMessage = 'Không thể tải dữ liệu. Vui lòng thử lại.';
      
      if (err?.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        setTimeout(() => navigate('/login'), 2000);
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setOrderData({ ...orderData, [field]: value });
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!orderData.address || !orderData.city || !orderData.ward || !orderData.phoneNumber) {
        setError('Vui lòng điền đầy đủ thông tin giao hàng.');
        return;
      }
      setActiveStep(activeStep + 1);
      setError('');
    } else if (activeStep === 1) {
      setActiveStep(activeStep + 1);
      handleSubmitOrder();
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
    setError('');
  };

  const handleSubmitOrder = async () => {
    try {
      setSubmitting(true);
      setError('');

      const itemOrders = cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const orderPayload = {
        itemOrders,
        address: orderData.address,
        city: orderData.city,
        ward: orderData.ward,
        note: orderData.note || '',
        phoneNumber: orderData.phoneNumber,
        paymentType: orderData.paymentType,
        paymentNote: orderData.paymentNote || '',
      };

      const response = await http.post('http://127.0.0.1:8080/api/v1/order/', orderPayload);

      const orderResponse = response.data?.data || response.data;

      if (orderData.paymentType === 'VNPAY') {
        if (orderResponse?.redirectUrl) {
          window.location.href = orderResponse.redirectUrl;
        } else {
          setError('Không nhận được URL thanh toán. Vui lòng thử lại.');
        }
      } else {
        navigate('/orders');
      }
    } catch (err) {
      console.error('Error submitting order:', err);
      let errorMessage = 'Không thể tạo đơn hàng. Vui lòng thử lại.';
      
      if (err?.code === 'ERR_NETWORK' || err?.code === 'ERR_FAILED') {
        errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối và thử lại.';
      } else if (err?.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        setTimeout(() => navigate('/login'), 2000);
      } else if (err?.response?.status === 400) {
        errorMessage = err?.response?.data?.message || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalPrice = calculateTotal();
  const currency = cartItems[0]?.currency || 'VND';

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/cart')}
              sx={{
                mb: 2,
                color: 'text.secondary',
                '&:hover': {
                  bgcolor: 'grey.100',
                  color: 'primary.main',
                },
              }}
            >
              Quay lại giỏ hàng
            </Button>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 3,
                borderRadius: 3,
                bgcolor: 'background.paper',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                }}
              >
                <PaymentIcon sx={{ fontSize: 32, color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
                  Thanh toán
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Hoàn tất đơn hàng của bạn
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Stepper */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 3,
              bgcolor: 'background.paper',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <Stepper activeStep={activeStep} alternativeLabel={!isMobile}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Left Column - Form */}
            <Grid item xs={12} md={8}>
              {activeStep === 0 && (
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    p: 3,
                    bgcolor: 'background.paper',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      mb: 3,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'grey.50',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Avatar
                      src={userInfo.avatarUrl}
                      alt={userInfo.fullName || 'User'}
                      sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}
                    >
                      {(userInfo.fullName || 'U').charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {userInfo.fullName || 'Người dùng'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {userInfo.email || 'Chưa có email'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {userInfo.phoneNumber || 'Chưa có số điện thoại'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <LocationOnIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
                      Thông tin giao hàng
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Số điện thoại"
                        value={orderData.phoneNumber}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        required
                        InputProps={{
                          startAdornment: (
                            <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                              <PhoneIcon sx={{ color: 'primary.main' }} />
                            </Box>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Địa chỉ"
                        value={orderData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        required
                        InputProps={{
                          startAdornment: (
                            <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                              <LocationOnIcon sx={{ color: 'primary.main' }} />
                            </Box>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Thành phố"
                        value={orderData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        required
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phường/Xã"
                        value={orderData.ward}
                        onChange={(e) => handleInputChange('ward', e.target.value)}
                        required
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Ghi chú giao hàng (tùy chọn)"
                        value={orderData.note}
                        onChange={(e) => handleInputChange('note', e.target.value)}
                        multiline
                        rows={3}
                        InputProps={{
                          startAdornment: (
                            <Box sx={{ mr: 1, display: 'flex', alignItems: 'flex-start', pt: 1 }}>
                              <NotesIcon sx={{ color: 'primary.main' }} />
                            </Box>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              )}

              {activeStep === 1 && (
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    p: 3,
                    bgcolor: 'background.paper',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <ShoppingCartIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
                      Xác nhận đơn hàng
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />

                  {/* Order Items */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                      Sản phẩm ({cartItems.length})
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {cartItems.map((item) => (
                        <Card
                          key={item.productId}
                          variant="outlined"
                          sx={{
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Grid container spacing={2} alignItems="center">
                              <Grid item xs={4} sm={3}>
                                <CardMedia
                                  component="img"
                                  image={item.imageUrl || 'https://via.placeholder.com/150'}
                                  alt={item.productName}
                                  sx={{
                                    height: 80,
                                    width: '100%',
                                    objectFit: 'cover',
                                    borderRadius: 1,
                                  }}
                                />
                              </Grid>
                              <Grid item xs={8} sm={6}>
                                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                  {item.productName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Số lượng: {item.quantity}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Giá: {formatCurrency(item.originPrice, item.currency)}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={3} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                  {formatCurrency(item.totalPrice, item.currency)}
                                </Typography>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  {/* Delivery Info */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                      Thông tin giao hàng
                    </Typography>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'grey.50',
                      }}
                    >
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Số điện thoại:</strong> {orderData.phoneNumber}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Địa chỉ:</strong> {orderData.address}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Thành phố:</strong> {orderData.city}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Phường/Xã:</strong> {orderData.ward}
                      </Typography>
                      {orderData.note && (
                        <Typography variant="body2">
                          <strong>Ghi chú:</strong> {orderData.note}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Payment Method */}
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                      Phương thức thanh toán
                    </Typography>
                    <FormControl component="fieldset">
                      <RadioGroup
                        value={orderData.paymentType}
                        onChange={(e) => handleInputChange('paymentType', e.target.value)}
                      >
                        <FormControlLabel
                          value="VNPAY"
                          control={<Radio />}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PaymentIcon sx={{ color: 'primary.main' }} />
                              <Typography>VNPAY</Typography>
                            </Box>
                          }
                        />
                        <FormControlLabel
                          value="COD"
                          control={<Radio />}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PaymentIcon sx={{ color: 'primary.main' }} />
                              <Typography>Thanh toán khi nhận hàng (COD)</Typography>
                            </Box>
                          }
                        />
                      </RadioGroup>
                    </FormControl>
                    {orderData.paymentType === 'VNPAY' && (
                      <TextField
                        fullWidth
                        label="Ghi chú thanh toán (tùy chọn)"
                        value={orderData.paymentNote}
                        onChange={(e) => handleInputChange('paymentNote', e.target.value)}
                        sx={{ mt: 2 }}
                      />
                    )}
                  </Box>
                </Paper>
              )}

              {activeStep === 2 && (
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    p: 3,
                    bgcolor: 'background.paper',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                    textAlign: 'center',
                  }}
                >
                  <CircularProgress size={60} sx={{ mb: 3 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Đang xử lý đơn hàng...
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Vui lòng đợi trong giây lát
                  </Typography>
                </Paper>
              )}

              {/* Navigation Buttons */}
              {activeStep < 2 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <Button
                    onClick={activeStep === 0 ? () => navigate('/cart') : handleBack}
                    disabled={submitting}
                    sx={{ borderRadius: 2 }}
                  >
                    {activeStep === 0 ? 'Quay lại' : 'Trước đó'}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={submitting}
                    startIcon={submitting ? <CircularProgress size={20} /> : <PaymentIcon />}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 700,
                      px: 4,
                      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
                      },
                    }}
                  >
                    {activeStep === 0
                      ? 'Tiếp tục'
                      : submitting
                      ? 'Đang xử lý...'
                      : 'Thanh toán'}
                  </Button>
                </Box>
              )}
            </Grid>

            {/* Right Column - Order Summary */}
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  p: 3,
                  bgcolor: 'background.paper',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  position: { md: 'sticky' },
                  top: 100,
                  border: '2px solid',
                  borderColor: 'primary.light',
                  backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <ShoppingCartIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
                    Tóm tắt đơn hàng
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body1" color="text.secondary">
                    Số sản phẩm:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {totalItems}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    Tạm tính:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formatCurrency(totalPrice, currency)}
                  </Typography>
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Tổng cộng:
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
                    {formatCurrency(totalPrice, currency)}
                  </Typography>
                </Box>

                <Chip
                  label={`Thanh toán qua ${orderData.paymentType || 'VNPAY'}`}
                  color="primary"
                  variant="outlined"
                  sx={{ width: '100%', mb: 2, fontWeight: 600 }}
                />
                
                
              </Paper>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
}

