import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  InputBase,
  Box,
  Container,
  Badge,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  useTheme,
  Menu,
  MenuItem,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import {
  Search as SearchIcon,
  ShoppingCart as ShoppingCartIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  AccountCircle as AccountCircleIcon,
  ShoppingBag as ShoppingBagIcon,
  LocationOn as LocationOnIcon,
  Schedule as ScheduleIcon,
  Logout as LogoutIcon,
  Assessment as AssessmentIcon,
  Pets as PetsIcon,
  Psychology as PsychologyIcon,
} from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';
import { styled, alpha } from '@mui/material/styles';
import { Chip } from '@mui/material';

import { clearAuthTokens, apiLogout, getUserRole } from '../api/auth';
import http from '../api/http';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    paddingRight: `calc(1em + ${theme.spacing(8)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '40ch',
    },
  },
}));

const Header = ({ onSearch }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [userRole, setUserRole] = useState('USER');
  const [anchorEl, setAnchorEl] = useState(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const checkAuthStatus = () => {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (accessToken && refreshToken) {
        setIsLoggedIn(true);
        const role = getUserRole();
        setUserRole(role);

        const u = JSON.parse(localStorage.getItem('user') || '{}');
        setUserInfo({
          name: u.name || u.username || 'User',
          email: u.email || 'user@example.com',
          avatarUrl: u.avatarUrl || '',
        });
      } else {
        setIsLoggedIn(false);
        setUserInfo(null);
        setUserRole('USER');
      }
    };

    checkAuthStatus();
    window.addEventListener('storage', checkAuthStatus);

    const handleUserLogin = (event) => {
      setIsLoggedIn(true);
      setUserInfo(event.detail.userInfo);
      const role = getUserRole();
      setUserRole(role);
    };
    window.addEventListener('userLoggedIn', handleUserLogin);

    return () => {
      window.removeEventListener('storage', checkAuthStatus);
      window.removeEventListener('userLoggedIn', handleUserLogin);
    };
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await http.get('http://127.0.0.1:8080/api/v1/categories?page=0&size=20');
        const apiData = res?.data?.data || [];

        const normalized = Array.isArray(apiData)
          ? apiData
              .filter((item) => item && item.active)
              .sort((a, b) => (a.position || 0) - (b.position || 0))
          : [];

        setCategories(normalized);
      } catch (error) {
        console.error('Failed to load categories for header:', error);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  const overviewCategory = { id: 'static-overview', name: 'Tổng quan sản phẩm' };
  const consultCategory = { id: 'static-consult', name: 'Tư vấn Bác sĩ thú y' };

  const productCategories = categories.filter((category) => {
    const name = (category?.name || '').toLowerCase();
    return name !== 'tổng quan sản phẩm' && !name.includes('tư vấn bác sĩ thú y') && !name.includes('tư vấn');
  });

  const displayCategories = [overviewCategory, ...productCategories, consultCategory];

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await http.get('http://127.0.0.1:8080/api/v1/users/info');
        const data = res?.data?.data || res?.data || {};
        setUserInfo((prev) => ({
          ...prev,
          name: data.fullName || data.name || prev?.name || 'User',
          email: data.email || prev?.email || 'user@example.com',
          avatarUrl: data.avatarUrl || prev?.avatarUrl || '',
        }));
      } catch (err) {
        console.warn('Could not load user info for header avatar:', err);
      }
    };

    if (isLoggedIn) {
      fetchUserInfo();
    }
  }, [isLoggedIn]);


  const handleSearch = (e) => {
    e.preventDefault();
    const keyword = searchQuery.trim();
    if (!keyword) return;

    navigate(`/search?keyword=${encodeURIComponent(keyword)}&page=0&size=10`);
  };

  const toggleMenu = () => setIsMenuOpen((s) => !s);

  const handleUserMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleUserMenuClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      clearAuthTokens();
      setIsLoggedIn(false);
      setUserInfo(null);
      setUserRole('USER');
      setAnchorEl(null);

      const logoutEvent = new CustomEvent('userLoggedOut');
      window.dispatchEvent(logoutEvent);

      navigate('/');
      window.location.reload();
    }
  };

  const handleMenuItemClick = (action) => {
    setAnchorEl(null);
    switch (action) {
      case 'admin-dashboard':
        navigate('/admin/dashboard');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'orders':
        navigate('/orders');
        break;
      case 'addresses':
        navigate('/addresses');
        break;
      case 'vaccination-schedule':
        navigate('/vaccination-schedule');
        break;
      case 'ai-hub':
        navigate('/ai');
        break;
      case 'logout':
        handleLogout();
        break;
      default:
        break;
    }
  };

  const goCategory = (category) => {
    if (!category) return;

    const name = (category.name || '').toLowerCase();

    if (name === 'tổng quan sản phẩm') {
      navigate('/products');
      return;
    }

    if (name === 'tư vấn bác sĩ thú y' || name.includes('tư vấn')) {
      navigate('/consult');
      return;
    }

    const slug = (category.name || '').trim().replace(/\s+/g, '-');
    const categoryId = category.id;

    if (categoryId) {
      navigate(`/category/${encodeURIComponent(slug)}?categoryId=${encodeURIComponent(categoryId)}`);
    } else {
      navigate(`/category/${encodeURIComponent(slug)}`);
    }
  };

  return (
    <>
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 1 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon fontSize="small" />
                <Typography variant="body2">Tư vấn: 0123456789</Typography>
              </Box>
              <Typography variant="body2">Giờ làm việc: 8:00 - 22:00</Typography>
            </Box>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
              <Typography variant="body2">Hỗ trợ khách hàng</Typography>
              {!isLoggedIn && (
                <Typography
                  variant="body2"
                  onClick={() => navigate('/login')}
                  sx={{ cursor: 'pointer', '&:hover': { color: 'warning.light' } }}
                >
                  Đăng nhập
                </Typography>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      <AppBar position="sticky" elevation={1} sx={{ bgcolor: 'white', color: 'text.primary' }}>
        <Container maxWidth="lg">
          <Toolbar sx={{ py: 2 }}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/')}
              style={{ display: 'flex', alignItems: 'center', gap: theme.spacing(1.5), cursor: 'pointer' }}
            >
              <PetsIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              <Box>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  PawCare
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Chăm sóc thú cưng thông minh
                </Typography>
              </Box>
            </motion.div>

            <Box sx={{ flexGrow: 1, mx: 4, display: { xs: 'none', lg: 'block' } }}>
              <form onSubmit={handleSearch}>
                <Search sx={{ bgcolor: 'grey.100', color: 'text.primary' }}>
                  <SearchIconWrapper>
                    <SearchIcon />
                  </SearchIconWrapper>
                  <StyledInputBase
                    placeholder="Tìm thức ăn, vitamin, sữa tắm, vòng chống ve..."
                    inputProps={{ 'aria-label': 'search' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      display: 'flex',
                      gap: 1,
                    }}
                  >
                    <Button type="submit" variant="contained" sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}>
                      Tìm kiếm
                    </Button>
                  </Box>
                </Search>
              </form>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Chip
                  icon={<PsychologyIcon />}
                  label="AI Hub"
                  onClick={() => navigate('/ai')}
                  sx={{
                    bgcolor: 'secondary.main',
                    color: 'white',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: { xs: 'none', md: 'flex' },
                    '&:hover': { bgcolor: 'secondary.dark' },
                  }}
                />
              </motion.div>

              {isLoggedIn ? (
                <motion.div whileHover={{ scale: 1.1 }}>
                  <IconButton
                    onClick={handleUserMenuClick}
                    sx={{ display: { xs: 'none', md: 'flex' }, color: 'text.primary', '&:hover': { color: 'primary.main' } }}
                  >
                    <Avatar
                      src={userInfo?.avatarUrl}
                      sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
                    >
                      {userInfo?.name?.charAt(0) || <PersonIcon />}
                    </Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleUserMenuClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    sx={{
                      '& .MuiPaper-root': {
                        mt: 1,
                        minWidth: 200,
                        borderRadius: 2,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    {userRole === 'ADMIN' && (
                      <MenuItem onClick={() => handleMenuItemClick('admin-dashboard')}>
                        <AssessmentIcon sx={{ mr: 2, color: 'text.secondary' }} />
                        Bảng điều khiển Admin
                      </MenuItem>
                    )}
                    <MenuItem onClick={() => handleMenuItemClick('profile')}>
                      <AccountCircleIcon sx={{ mr: 2, color: 'text.secondary' }} />
                      Thông tin cá nhân
                    </MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick('orders')}>
                      <ShoppingBagIcon sx={{ mr: 2, color: 'text.secondary' }} />
                      Đơn hàng của tôi
                    </MenuItem>

                    {/* <MenuItem 
                      onClick={() => handleMenuItemClick('orders')}
                      sx={{
                        '&:hover': {
                          bgcolor: 'primary.light',
                          '& .MuiSvgIcon-root': {
                            color: 'primary.main'
                          }
                        }
                      }}
                    >
                      <ShoppingBagIcon sx={{ mr: 2, color: 'text.secondary' }} />
                      Đơn hàng của tôi
                    </MenuItem> */}
                      {/* <ShoppingBagIcon sx={{ mr: 2, color: 'text.secondary' }} /> */}
                      {/* <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Đơn hàng của tôi
                        </Typography> */}
                        {/* <Typography variant="caption" color="text.secondary">
                          Xem và theo dõi đơn hàng
                        </Typography> */}
                      {/* </Box> */}
                    
                    {/* <MenuItem onClick={() => handleMenuItemClick('addresses')}>
                      <LocationOnIcon sx={{ mr: 2, color: 'text.secondary' }} />
                      Địa chỉ nhận hàng
                    </MenuItem> */}
                    {/* <MenuItem onClick={() => handleMenuItemClick('vaccination-schedule')}>
                      <ScheduleIcon sx={{ mr: 2, color: 'text.secondary' }} />
                      Lịch hẹn tiêm chủng
                    </MenuItem> */}
                    <MenuItem onClick={() => handleMenuItemClick('ai-hub')}>
                      <PsychologyIcon sx={{ mr: 2, color: 'text.secondary' }} />
                      AI Hub
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={() => handleMenuItemClick('logout')}>
                      <LogoutIcon sx={{ mr: 2, color: 'error.main' }} />
                      Đăng xuất
                    </MenuItem>
                  </Menu>
                </motion.div>
              ) : (
                <motion.div whileHover={{ scale: 1.1 }}>
                  <Button
                    startIcon={<PersonIcon />}
                    sx={{ display: { xs: 'none', md: 'flex' }, color: 'text.primary', '&:hover': { color: 'primary.main' } }}
                    onClick={() => navigate('/login')}
                  >
                    Đăng nhập
                  </Button>
                </motion.div>
              )}

              {/* Cart (one place only) */}
              <motion.div whileHover={{ scale: 1.1 }}>
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
                  onClick={() => {
                    const token = localStorage.getItem('accessToken');
                    if (!token) {
                      setAuthDialogOpen(true);
                    } else {
                      navigate('/cart');
                    }
                  }}
                >
                  <IconButton sx={{ color: 'text.primary', '&:hover': { color: 'primary.main' } }}>
                    <Badge badgeContent={0} color="error">
                      <ShoppingCartIcon />
                    </Badge>
                  </IconButton>
                  <Typography variant="body2" sx={{ display: { xs: 'none', md: 'block' } }}>
                    Giỏ hàng
                  </Typography>
                </Box>
              </motion.div>

              {/* Mobile menu button */}
              <IconButton onClick={toggleMenu} sx={{ display: { xs: 'block', lg: 'none' } }}>
                <MenuIcon />
              </IconButton>
            </Box>
          </Toolbar>

          {/* Search (mobile) */}
          <Box sx={{ display: { xs: 'block', lg: 'none' }, pb: 2 }}>
            <form onSubmit={handleSearch}>
              <Search sx={{ bgcolor: 'grey.100', color: 'text.primary' }}>
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>
                  <StyledInputBase
                    placeholder="Tìm thức ăn, vitamin, sữa tắm..."
                    inputProps={{ 'aria-label': 'search' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
              </Search>
            </form>
          </Box>
        </Container>
      </AppBar>

      {/* Categories (desktop) */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white' }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: { xs: 'none', lg: 'flex' },
              gap: 4,
              py: 1.5,
              '& > *': { cursor: 'pointer' },
            }}
          >
            {displayCategories.map((category) => (
              <motion.div
                key={category.id || category.name}
                whileHover={{ y: -2 }}
                onClick={() => goCategory(category)}
              >
                <Typography variant="body1" sx={{ fontWeight: 500, '&:hover': { color: 'warning.light' } }}>
                  {category.name}
                </Typography>
              </motion.div>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Drawer (mobile) */}
      <Drawer
        anchor="top"
        open={isMenuOpen}
        onClose={toggleMenu}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': { top: 'auto', height: 'auto', maxHeight: '80vh' },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Menu</Typography>
            <IconButton onClick={toggleMenu}>
              <CloseIcon />
            </IconButton>
          </Box>

          <List>
            {displayCategories.map((category) => (
              <ListItemButton
                key={category.id || category.name}
                onClick={() => {
                  toggleMenu();
                  goCategory(category);
                }}
              >
                <ListItemText primary={category.name} />
              </ListItemButton>
            ))}

            <Divider sx={{ my: 1 }} />

            {!isLoggedIn && (
              <ListItemButton
                onClick={() => {
                  toggleMenu();
                  navigate('/login');
                }}
              >
                <ListItemText primary="Đăng nhập" />
              </ListItemButton>
            )}

            {isLoggedIn && (
              <>
                {/* Admin */}
                {userRole === 'ADMIN' && (
                  <ListItemButton
                    onClick={() => {
                      toggleMenu();
                      handleMenuItemClick('admin-dashboard');
                    }}
                  >
                    <ListItemText primary="Bảng điều khiển Admin" />
                  </ListItemButton>
                )}

                <ListItemButton
                  onClick={() => {
                    toggleMenu();
                    handleMenuItemClick('profile');
                  }}
                >
                  <ListItemText primary="Thông tin cá nhân" />
                </ListItemButton>

                <ListItemButton
                  onClick={() => {
                    toggleMenu();
                    handleMenuItemClick('orders');
                  }}
                  sx={{
                    '&:hover': {
                      bgcolor: 'primary.light',
                    }
                  }}
                >
                  <ShoppingBagIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText 
                    primary="Đơn hàng của tôi"
                    secondary="Xem và theo dõi đơn hàng"
                  />
                </ListItemButton>

                <ListItemButton
                  onClick={() => {
                    toggleMenu();
                    handleMenuItemClick('addresses');
                  }}
                >
                  <ListItemText primary="Địa chỉ nhận hàng" />
                </ListItemButton>

                <ListItemButton
                  onClick={() => {
                    toggleMenu();
                    handleMenuItemClick('vaccination-schedule');
                  }}
                >
                  <ListItemText primary="Lịch hẹn tiêm chủng" />
                </ListItemButton>

                <ListItemButton
                  onClick={() => {
                    toggleMenu();
                    handleMenuItemClick('ai-hub');
                  }}
                >
                  <ListItemText primary="AI Hub" />
                </ListItemButton>

                <Divider sx={{ my: 1 }} />

                <ListItemButton
                  onClick={() => {
                    toggleMenu();
                    handleMenuItemClick('logout');
                  }}
                >
                  <ListItemText primary="Đăng xuất" />
                </ListItemButton>
              </>
            )}

            <ListItemButton
              onClick={() => {
                toggleMenu();
              }}
            >
              <ListItemText primary="Hỗ trợ khách hàng" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>

      {/* Auth dialog (Cart) */}
      <Dialog open={authDialogOpen} onClose={() => setAuthDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Yêu cầu đăng nhập</DialogTitle>
        <DialogContent dividers>
          <Typography>Vui lòng đăng nhập để xem giỏ hàng của bạn.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAuthDialogOpen(false)}>Để sau</Button>
          <Button
            variant="contained"
            onClick={() => {
              setAuthDialogOpen(false);
              navigate('/login');
            }}
          >
            Đăng nhập
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Header;
