import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import http, { fetchTopSellingProducts } from '../api/http';
import { formatCurrencyVnd, getFinalPrice } from '../utils/productPrice';

import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  Rating,
  IconButton,
  Paper,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Link,
  Skeleton,
  CircularProgress
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Pets as PetsIcon,
  Healing as HealingIcon,
  Assignment as AssignmentIcon,
  Place as PlaceIcon,
  FlashOn as FlashIcon,
  AccessTime as TimeIcon,
  Whatshot as FireIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Verified as VerifiedIcon,
  LocalShipping as LocalShippingIcon,
  SupportAgent as SupportAgentIcon,
  EmojiEvents as TrophyIcon,
  Psychology as PsychologyIcon,
} from '@mui/icons-material';

const HomePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const flashSaleScrollRef = useRef(null);
  const bestSellerScrollRef = useRef(null);

  const [currentSlide, setCurrentSlide] = useState(0);

  const [flashSaleTab, setFlashSaleTab] = useState(0);
  const [countdown, setCountdown] = useState({ hours: 10, minutes: 12, seconds: 53 });
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [loadingTopSelling, setLoadingTopSelling] = useState(true);
  const [featuredCategories, setFeaturedCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [loadingFlashSale, setLoadingFlashSale] = useState(true);

  const heroSlides = [
    {
      id: 1,
      title: 'Chăm sóc thú cưng thông minh với công nghệ AI',
      subtitle: 'Sử dụng AI để chẩn đoán các loại côn trùng gây hại cho thú cưng',
      primaryLabel: 'Xem sản phẩm',
      secondaryLabel: 'Thử AI Hub',
      imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=600&fit=crop'
    },
    {
      id: 2,
      title: 'Chăm sóc sức khỏe toàn diện cho thú cưng',
      subtitle: 'Thức ăn dinh dưỡng, vitamin, sữa tắm, phụ kiện chất lượng cao. Giao hàng nhanh chóng toàn quốc',
      primaryLabel: 'Xem sản phẩm',
      secondaryLabel: 'Tư vấn bác sĩ thú y',
      imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&h=600&fit=crop'
    },
    {
      id: 3,
      title: 'Ưu đãi đặc biệt - Giảm giá lên đến 50%',
      subtitle: 'Flash sale hàng ngày với hàng ngàn sản phẩm chăm sóc thú cưng chất lượng cao',
      primaryLabel: 'Mua ngay',
      secondaryLabel: 'Xem ưu đãi',
      imageUrl: 'https://phunugioi.com/wp-content/uploads/2022/06/Anh-cho-cute.jpg'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const quickActions = [
    {
      id: 1,
      icon: <PetsIcon sx={{ fontSize: 40 }} />,
      title: 'Mua sắm',
      route: '/products'
    },
    {
      id: 2,
      icon: <HealingIcon sx={{ fontSize: 40 }} />,
      title: 'Tư vấn bác sĩ thú y',
      route: '/consult'
    },
    {
      id: 3,
      icon: <PsychologyIcon sx={{ fontSize: 40 }} />,
      title: 'AI Hub',
      route: '/ai'
    },
    // {
    //   id: 4,
    //   icon: <PlaceIcon sx={{ fontSize: 40 }} />,
    //   title: 'Tìm cửa hàng',
    //   route: '/'
    // }
  ];

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await http.get('http://127.0.0.1:8080/api/v1/categories?page=0&size=20');
        const apiData = res?.data?.data || [];

        const normalized = Array.isArray(apiData)
          ? apiData
              .filter((item) => item && item.active)
              .sort((a, b) => (a.position || 0) - (b.position || 0))
              .slice(0, 9)
          : [];

        setFeaturedCategories(normalized);
      } catch (err) {
        console.error('Error loading featured categories:', err);
        setFeaturedCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const loadFlashSaleProducts = async () => {
      try {
        setLoadingFlashSale(true);
        const response = await http.get('/products/flash-selling', {
          params: { limit: 10 }
        });
        
        let products = [];
        if (Array.isArray(response?.data?.data)) {
          products = response.data.data;
        } else if (Array.isArray(response?.data)) {
          products = response.data;
        } else if (Array.isArray(response)) {
          products = response;
        }
        
        setFlashSaleProducts(products);
      } catch (err) {
        console.error('Error loading flash sale products:', err);
        setFlashSaleProducts([]);
      } finally {
        setLoadingFlashSale(false);
      }
    };
    
    loadFlashSaleProducts();
  }, []);

  useEffect(() => {
    const loadTopSellingProducts = async () => {
      try {
        setLoadingTopSelling(true);
        const response = await fetchTopSellingProducts();
        
        let products = [];
        if (Array.isArray(response)) {
          products = response;
        } else if (Array.isArray(response?.data)) {
          products = response.data;
        } else if (Array.isArray(response?.content)) {
          products = response.content;
        }
        
        setTopSellingProducts(products);
      } catch (err) {
        console.error('Error loading top selling products:', err);
        setTopSellingProducts([]);
      } finally {
        setLoadingTopSelling(false);
      }
    };
    
    loadTopSellingProducts();
  }, []);

  const flashSaleSessions = [
    { label: '08:00 - 22:00, Hôm nay', status: 'Đang diễn ra' },
    { label: '08:00 - 22:00, Ngày mai', status: 'Sắp diễn ra' },
    { label: '08:00 - 22:00, Ngày kia', status: 'Sắp diễn ra' }
  ];

  const scrollFlashSale = (direction) => {
    if (flashSaleScrollRef.current) {
      flashSaleScrollRef.current.scrollBy({
        left: direction === 'left' ? -300 : 300,
        behavior: 'smooth'
      });
    }
  };

  const scrollBestSeller = (direction) => {
    if (bestSellerScrollRef.current) {
      bestSellerScrollRef.current.scrollBy({
        left: direction === 'left' ? -300 : 300,
        behavior: 'smooth'
      });
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box
        sx={{
          position: 'relative',
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          overflow: 'hidden',
          minHeight: { xs: 400, md: 500 }
        }}
      >
        <Container maxWidth="xl" sx={{ position: 'relative', py: { xs: 4, md: 8 } }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={7}>
                  <Typography
                    variant={isMobile ? 'h4' : 'h3'}
                    sx={{ fontWeight: 'bold', mb: 2, lineHeight: 1.2 }}
                  >
                    {heroSlides[currentSlide].title}
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                    {heroSlides[currentSlide].subtitle}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                    <Button
                      variant="contained"
                      size="large"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => navigate('/products')}
                      sx={{
                        bgcolor: 'white',
                        color: 'primary.main',
                        fontWeight: 'bold',
                        px: 4,
                        '&:hover': { bgcolor: 'grey.100' }
                      }}
                    >
                      {heroSlides[currentSlide].primaryLabel}
                    </Button>
                    {/* <Button
                      variant="outlined"
                      size="large"
                      
                      onClick={() => navigate('/consult')}
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        fontWeight: 'bold',
                        px: 4,
                        '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                      }}
                    >
                      {heroSlides[currentSlide].secondaryLabel}
                    </Button> */}
                  </Box>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Card
                    sx={{
                      borderRadius: 4,
                      overflow: 'hidden',
                      boxShadow: theme.shadows[20]
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={heroSlides[currentSlide].imageUrl}
                      alt={heroSlides[currentSlide].title}
                      sx={{ height: { xs: 250, md: 350 }, objectFit: 'cover' }}
                    />
                  </Card>
                </Grid>
              </Grid>
            </motion.div>
          </AnimatePresence>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 4 }}>
            {heroSlides.map((_, index) => (
              <Box
                key={index}
                onClick={() => setCurrentSlide(index)}
                sx={{
                  width: currentSlide === index ? 32 : 8,
                  height: 8,
                  borderRadius: 4,
                  bgcolor: currentSlide === index ? 'white' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              />
            ))}
          </Box>

          <IconButton
            onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
            sx={{
              position: 'absolute',
              left: { xs: 8, md: 16 },
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <IconButton
            onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
            sx={{
              position: 'absolute',
              right: { xs: 8, md: 16 },
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
            }}
          >
            <ArrowForwardIcon />
          </IconButton>
        </Container>
      </Box>

      <Box sx={{ py: 4, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            {quickActions.map((action, index) => (
              <Grid item xs={6} sm={6} md={4} key={action.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card
                    onClick={() => navigate(action.route)}
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      textAlign: 'center',
                      p: 3,
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[8]
                      }
                    }}
                  >
                    <Box sx={{ color: 'primary.main', mb: 2 }}>
                      {action.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {action.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {action.description}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box sx={{ py: 6, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
              <TrophyIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                Danh mục nổi bật
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {loadingCategories && featuredCategories.length === 0
                ? Array.from({ length: 6 }).map((_, index) => (
                    <Grid item xs={6} sm={4} md={2} key={index}>
                      <Card
                        sx={{
                          height: '100%',
                          p: 3,
                          textAlign: 'center',
                          borderRadius: 3,
                        }}
                      >
                        <Skeleton
                          variant="circular"
                          width={56}
                          height={56}
                          sx={{ mx: 'auto', mb: 2 }}
                        />
                        <Skeleton variant="text" width="80%" sx={{ mx: 'auto', mb: 1 }} />
                        <Skeleton variant="text" width="60%" sx={{ mx: 'auto' }} />
                      </Card>
                    </Grid>
                  ))
                : featuredCategories.map((category, index) => {
                    const slug = (category.name || '').trim().replace(/\s+/g, '-');

                    return (
                      <Grid item xs={6} sm={4} md={2} key={category.id || index}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: index * 0.05 }}
                        >
                          <Card
                            onClick={() =>
                              navigate(
                                `/category/${encodeURIComponent(slug)}?categoryId=${encodeURIComponent(
                                  category.id
                                )}`
                              )
                            }
                            sx={{
                              height: '100%',
                              cursor: 'pointer',
                              textAlign: 'center',
                              p: 3,
                              transition: 'all 0.3s',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: theme.shadows[8],
                                bgcolor: 'primary.light',
                                color: 'white',
                              },
                            }}
                          >
                            <Box
                              sx={{
                                width: 64,
                                height: 64,
                                borderRadius: '50%',
                                overflow: 'hidden',
                                mx: 'auto',
                                mb: 2,
                                bgcolor: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {category.thumbnailUrl ? (
                                <CardMedia
                                  component="img"
                                  image={category.thumbnailUrl}
                                  alt={category.name}
                                  sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                  }}
                                />
                              ) : (
                                <PetsIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                              )}
                            </Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                              {category.name}
                            </Typography>
                            {category.description && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {category.description}
                              </Typography>
                            )}
                          </Card>
                        </motion.div>
                      </Grid>
                    );
                  })}
            </Grid>
          </motion.div>
        </Container>
      </Box>

      <Box sx={{ py: 6, bgcolor: '#E3F2FD', position: 'relative' }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 'bold',
                      color: '#FFA726',
                      fontSize: { xs: '1.5rem', md: '2rem' }
                    }}
                  >
                    ƯU ĐÃI TỐT NHẤT
                  </Typography>
                  <FlashIcon sx={{ fontSize: 32, color: '#FFA726' }} />
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 'bold',
                      color: theme.palette.primary.main,
                      fontSize: { xs: '1.5rem', md: '2rem' }
                    }}
                  >
                    GIÁ TỐT NHẤT
                  </Typography>
                </Box>
              </Box>
              {/* <Link
                href="#"
                sx={{
                  color: 'text.secondary',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  '&:hover': { color: 'primary.main' }
                }}
              >
                Xem thể lệ &gt;
              </Link> */}
            </Box>

            {/* <Paper sx={{ p: 2, mb: 3, bgcolor: 'white' }}>
              <Tabs
                value={flashSaleTab}
                onChange={(e, newValue) => setFlashSaleTab(newValue)}
                sx={{
                  '& .MuiTab-root': {
                    minWidth: { xs: 100, md: 150 },
                    fontSize: '0.875rem',
                    fontWeight: 500
                  },
                  '& .Mui-selected': {
                    color: '#D32F2F',
                    fontWeight: 'bold'
                  }
                }}
              > */}
                {/* {flashSaleSessions.map((session, index) => (
                  <Tab
                    key={index}
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: flashSaleTab === index ? 'bold' : 'normal' }}>
                          {session.label}
                        </Typography>
                        <Typography variant="caption" sx={{ color: flashSaleTab === index ? '#D32F2F' : 'text.secondary' }}>
                          {session.status}
                        </Typography>
                      </Box>
                    }
                  />
                ))} */}
              {/* </Tabs>
            </Paper> */}

           
            {/* <Paper
              sx={{
                p: 2,
                mb: 4,
                bgcolor: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexWrap: 'wrap'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimeIcon sx={{ color: '#D32F2F' }} />
                <Typography variant="body2" fontWeight="bold">
                  Kết thúc sau:
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip
                  label={String(countdown.hours).padStart(2, '0')}
                  sx={{
                    bgcolor: '#D32F2F',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    minWidth: 50,
                    height: 36
                  }}
                />
                <Typography sx={{ fontWeight: 'bold', color: '#D32F2F' }}>:</Typography>
                <Chip
                  label={String(countdown.minutes).padStart(2, '0')}
                  sx={{
                    bgcolor: '#D32F2F',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    minWidth: 50,
                    height: 36
                  }}
                />
                <Typography sx={{ fontWeight: 'bold', color: '#D32F2F' }}>:</Typography>
                <Chip
                  label={String(countdown.seconds).padStart(2, '0')}
                  sx={{
                    bgcolor: '#D32F2F',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    minWidth: 50,
                    height: 36
                  }}
                />
              </Box>
            </Paper> */}

            <Box sx={{ position: 'relative' }}>
              <IconButton
                onClick={() => scrollFlashSale('left')}
                sx={{
                  position: 'absolute',
                  left: -20,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'white',
                  boxShadow: theme.shadows[4],
                  zIndex: 2,
                  display: { xs: 'none', md: 'flex' },
                  '&:hover': { bgcolor: 'grey.100' }
                }}
              >
                <ChevronLeftIcon />
              </IconButton>

              <Box
                ref={flashSaleScrollRef}
                sx={{
                  display: 'flex',
                  gap: 2,
                  overflowX: 'auto',
                  pb: 2,
                  scrollBehavior: 'smooth',
                  '&::-webkit-scrollbar': { height: 8 },
                  '&::-webkit-scrollbar-thumb': {
                    bgcolor: 'grey.400',
                    borderRadius: 4
                  }
                }}
              >
                {loadingFlashSale ? (
                  <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                      Đang tải sản phẩm flash sale...
                    </Typography>
                  </Box>
                ) : flashSaleProducts.length === 0 ? (
                  <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Chưa có sản phẩm flash sale
                    </Typography>
                  </Box>
                ) : (
                  flashSaleProducts.map((product, index) => {
                    const discountPercent = product.discountPercent ? Number(product.discountPercent).toFixed(1) : 0;
                    const discountPrice = product.discountPrice || product.originPrice || 0;
                    const originPrice = product.originPrice || 0;
                    
                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        style={{ minWidth: 280 }}
                      >
                        <Card
                          onClick={() => navigate(`/product/${product.id}`)}
                          sx={{
                            height: '100%',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            bgcolor: 'white',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: theme.shadows[8]
                            }
                          }}
                        >
                          <Box sx={{ position: 'relative' }}>
                            <CardMedia
                              component="img"
                              image={product.imageUrl || 'https://via.placeholder.com/280x200?text=No+Image'}
                              alt={product.name}
                              sx={{ height: 200, objectFit: 'cover' }}
                            />
                            {discountPercent > 0 && (
                              <Chip
                                label={`-${discountPercent}%`}
                                sx={{
                                  position: 'absolute',
                                  top: 8,
                                  left: 8,
                                  bgcolor: '#D32F2F',
                                  color: 'white',
                                  fontWeight: 'bold',
                                  fontSize: '0.875rem',
                                  height: 28
                                }}
                              />
                            )}
                            {product.soldQuantity > 0 && (
                              <Chip
                                label={`Đã bán: ${product.soldQuantity.toLocaleString('vi-VN')}`}
                                size="small"
                                sx={{
                                  position: 'absolute',
                                  bottom: 8,
                                  right: 8,
                                  bgcolor: 'rgba(0, 0, 0, 0.6)',
                                  color: 'white',
                                  fontSize: '0.75rem',
                                  height: 24
                                }}
                              />
                            )}
                          </Box>
                          <CardContent sx={{ p: 2 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                mb: 1.5,
                                minHeight: 40,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                lineHeight: 1.4,
                                fontWeight: 500
                              }}
                            >
                              {product.name}
                            </Typography>
                            {product.description && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  mb: 1,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 1,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}
                              >
                                {product.description}
                              </Typography>
                            )}
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 'bold',
                                color: theme.palette.primary.main,
                                mb: 0.5,
                                fontSize: '1.1rem'
                              }}
                            >
                              {formatCurrencyVnd(discountPrice)}
                            </Typography>
                            {originPrice > discountPrice && (
                              <Typography
                                variant="body2"
                                sx={{
                                  color: 'text.secondary',
                                  textDecoration: 'line-through',
                                  mb: 1.5
                                }}
                              >
                                {formatCurrencyVnd(originPrice)}
                              </Typography>
                            )}
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                bgcolor: '#FFE0B2',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                mb: 1.5,
                                width: 'fit-content'
                              }}
                            >
                              <FireIcon sx={{ fontSize: 16, color: '#FF9800' }} />
                              <Typography variant="caption" sx={{ color: '#E65100', fontWeight: 'bold' }}>
                                Ưu đãi giá sốc
                              </Typography>
                            </Box>
                            {product.quantity !== undefined && (
                              <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1.5, display: 'block' }}>
                                Tồn kho: {product.quantity.toLocaleString('vi-VN')}
                              </Typography>
                            )}
                            <Button
                              fullWidth
                              variant="contained"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/product/${product.id}`);
                              }}
                              sx={{
                                bgcolor: theme.palette.primary.main,
                                color: 'white',
                                fontWeight: 'bold',
                                '&:hover': { bgcolor: theme.palette.primary.dark }
                              }}
                            >
                              Chọn mua
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })
                )}
              </Box>

              <IconButton
                onClick={() => scrollFlashSale('right')}
                sx={{
                  position: 'absolute',
                  right: -20,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'white',
                  boxShadow: theme.shadows[4],
                  zIndex: 2,
                  display: { xs: 'none', md: 'flex' },
                  '&:hover': { bgcolor: 'grey.100' }
                }}
              >
                <ChevronRightIcon />
              </IconButton>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/products');
                }}
                sx={{
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Xem tất cả &gt;
              </Link>
            </Box>
          </motion.div>
        </Container>
      </Box>

      <Box sx={{ py: 6, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
              <Paper
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 4,
                  bgcolor: '#D32F2F',
                  color: 'white'
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Sản phẩm bán chạy
                </Typography>
              </Paper>
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/products');
                }}
                sx={{
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Xem tất cả &gt;
              </Link>
            </Box>

            <Box sx={{ position: 'relative' }}>
              <IconButton
                onClick={() => scrollBestSeller('left')}
                sx={{
                  position: 'absolute',
                  left: -20,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'white',
                  boxShadow: theme.shadows[4],
                  zIndex: 2,
                  display: { xs: 'none', md: 'flex' },
                  '&:hover': { bgcolor: 'grey.100' }
                }}
              >
                <ChevronLeftIcon />
              </IconButton>

              <Box
                ref={bestSellerScrollRef}
                sx={{
                  display: 'flex',
                  gap: 2,
                  overflowX: 'auto',
                  pb: 2,
                  scrollBehavior: 'smooth',
                  '&::-webkit-scrollbar': { height: 8 },
                  '&::-webkit-scrollbar-thumb': {
                    bgcolor: 'grey.400',
                    borderRadius: 4
                  }
                }}
              >
                {loadingTopSelling ? (
                  <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                      Đang tải sản phẩm bán chạy...
                    </Typography>
                  </Box>
                ) : topSellingProducts.length === 0 ? (
                  <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Chưa có sản phẩm bán chạy
                    </Typography>
                  </Box>
                ) : (
                  topSellingProducts.map((product, index) => {
                    const finalPrice = getFinalPrice(product);
                    const hasDiscount = product.discountPercent && Number(product.discountPercent) > 0;
                    
                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        style={{ minWidth: 280 }}
                      >
                        <Card
                          onClick={() => navigate(`/product/${product.id}`)}
                          sx={{
                            height: '100%',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            bgcolor: 'white',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: theme.shadows[8]
                            }
                          }}
                        >
                          <Box sx={{ position: 'relative' }}>
                            <CardMedia
                              component="img"
                              image={product.imageUrl || 'https://via.placeholder.com/280x200?text=No+Image'}
                              alt={product.name}
                              sx={{ height: 200, objectFit: 'cover' }}
                            />
                            {hasDiscount && (
                              <Chip
                                label={`-${Number(product.discountPercent).toFixed(1)}%`}
                                sx={{
                                  position: 'absolute',
                                  top: 8,
                                  left: 8,
                                  bgcolor: '#D32F2F',
                                  color: 'white',
                                  fontWeight: 'bold',
                                  fontSize: '0.875rem',
                                  height: 28
                                }}
                              />
                            )}
                            {product.soldQuantity > 0 && (
                              <Chip
                                label={`Đã bán: ${product.soldQuantity.toLocaleString('vi-VN')}`}
                                size="small"
                                sx={{
                                  position: 'absolute',
                                  bottom: 8,
                                  right: 8,
                                  bgcolor: 'rgba(0, 0, 0, 0.6)',
                                  color: 'white',
                                  fontSize: '0.75rem',
                                  height: 24
                                }}
                              />
                            )}
                          </Box>
                          <CardContent sx={{ p: 2 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                mb: 1.5,
                                minHeight: 50,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                lineHeight: 1.4,
                                fontWeight: 500
                              }}
                            >
                              {product.name}
                            </Typography>
                            {product.description && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  mb: 1,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 1,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}
                              >
                                {product.description}
                              </Typography>
                            )}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Rating 
                                value={Number(product.ratingAvg) || 0} 
                                precision={0.1} 
                                readOnly 
                                size="small" 
                              />
                              <Typography variant="caption" color="text.secondary">
                                ({Number(product.ratingAvg || 0).toFixed(1)})
                              </Typography>
                            </Box>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 'bold',
                                color: theme.palette.primary.main,
                                mb: 0.5,
                                fontSize: '1.1rem'
                              }}
                            >
                              {formatCurrencyVnd(finalPrice)}
                            </Typography>
                            {hasDiscount && product.originPrice && (
                              <Typography
                                variant="body2"
                                sx={{
                                  color: 'text.secondary',
                                  textDecoration: 'line-through',
                                  mb: 1
                                }}
                              >
                                {formatCurrencyVnd(product.originPrice)}
                              </Typography>
                            )}
                            {product.quantity !== undefined && (
                              <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1.5, display: 'block' }}>
                                Tồn kho: {product.quantity.toLocaleString('vi-VN')}
                              </Typography>
                            )}
                            <Button
                              fullWidth
                              variant="contained"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/product/${product.id}`);
                              }}
                              sx={{
                                bgcolor: theme.palette.primary.main,
                                color: 'white',
                                fontWeight: 'bold',
                                '&:hover': { bgcolor: theme.palette.primary.dark }
                              }}
                            >
                              Chọn mua
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })
                )}
              </Box>

              <IconButton
                onClick={() => scrollBestSeller('right')}
                sx={{
                  position: 'absolute',
                  right: -20,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'white',
                  boxShadow: theme.shadows[4],
                  zIndex: 2,
                  display: { xs: 'none', md: 'flex' },
                  '&:hover': { bgcolor: 'grey.100' }
                }}
              >
                <ChevronRightIcon />
              </IconButton>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* <Box sx={{ py: 6, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          > */}
            {/* <Box sx={{ textAlign: 'center', mb: 4 }}>
              <PsychologyIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                Công cụ AI thông minh
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                Sử dụng công nghệ AI để chăm sóc sức khỏe thú cưng một cách thông minh
              </Typography>
            </Box> */}

            {/* <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    onClick={() => navigate('/ai/skin-check')}
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      p: 4,
                      borderRadius: 4,
                      background: 'linear-gradient(135deg, #10B98115 0%, #10B98105 100%)',
                      border: '2px solid #10B98130',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: theme.shadows[12],
                        borderColor: '#10B981',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: '50%',
                          bgcolor: '#10B98120',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <HealingIcon sx={{ fontSize: 32, color: '#10B981' }} />
                      </Box>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                          Chẩn đoán vấn đề da
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Phát hiện các vấn đề về da ở chó và mèo
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      variant="contained"
                      endIcon={<ArrowForwardIcon />}
                      sx={{ bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' } }}
                    >
                      Thử ngay
                    </Button>
                  </Card>
                </motion.div>
              </Grid>
              <Grid item xs={12} md={6}>
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    onClick={() => navigate('/ai/pet-identify')}
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      p: 4,
                      borderRadius: 4,
                      background: 'linear-gradient(135deg, #F59E0B15 0%, #F59E0B05 100%)',
                      border: '2px solid #F59E0B30',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: theme.shadows[12],
                        borderColor: '#F59E0B',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: '50%',
                          bgcolor: '#F59E0B20',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <PetsIcon sx={{ fontSize: 32, color: '#F59E0B' }} />
                      </Box>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                          Nhận diện loài thú cưng
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Xác định giống chó/mèo từ ảnh
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      variant="contained"
                      endIcon={<ArrowForwardIcon />}
                      sx={{ bgcolor: '#F59E0B', '&:hover': { bgcolor: '#D97706' } }}
                    >
                      Thử ngay
                    </Button>
                  </Card>
                </motion.div>
              </Grid>
            </Grid> */}

            {/* <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/ai')}
                endIcon={<ArrowForwardIcon />}
              >
                Xem tất cả công cụ AI
              </Button>
            </Box> */}
          {/* </motion.div>
        </Container>
      </Box> */}

      <Box sx={{ py: 6, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    height: '100%',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8]
                    }
                  }}
                >
                  <VerifiedIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Đổi trả trong 30 ngày
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Chính sách đổi trả linh hoạt và minh bạch
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    height: '100%',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8]
                    }
                  }}
                >
                  <SupportAgentIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Tư vấn cùng bác sĩ thú y
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Đội ngũ bác sĩ thú y giàu kinh nghiệm hỗ trợ 24/7
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    height: '100%',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8]
                    }
                  }}
                >
                  <LocalShippingIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Giao hàng nhanh chóng
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Giao hàng toàn quốc trong 24-48 giờ
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    height: '100%',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8]
                    }
                  }}
                >
                  <VerifiedIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Sản phẩm chính hãng
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    100% sản phẩm có giấy phép và nguồn gốc rõ ràng
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
