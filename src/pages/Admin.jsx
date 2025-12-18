import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  useTheme,
  useMediaQuery,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  Inventory as InventoryIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Pets as PetsIcon,
  TrendingUp as TrendingUpIcon,
  Category as CategoryIcon,
  Support as SupportIcon,
  ChevronLeft as ChevronLeftIcon,
  Business as BusinessIcon,
  HelpOutline as HelpOutlineIcon
} from '@mui/icons-material';
import { clearAuthTokens, apiLogout, isAdmin, getUserRole } from '../api/auth';
import AdminDashboard from './Admin/AdminDashboard';
import CategoriesManagement from './Admin/CategoriesManagement';
import AdminProducts from './Admin/AdminProducts';
import AdminUser from './Admin/AdminUser';
import AdminManufacter from './Admin/AdminManufacter';
import AdminOrder from './Admin/AdminOrder';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminSupport from './Admin/AdminSupport';
import AdminHDSD from './Admin/AdminHDSD';

const drawerWidth = 280;

const Admin = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const menuItems = [
    {
      text: 'Bảng điều khiển',
      icon: <DashboardIcon />,
      path: '/admin/dashboard',
      color: '#4caf50'
    },
    {
      text: 'Quản lý người dùng',
      icon: <PeopleIcon />,
      path: '/admin/users',
      color: '#2196f3'
    },
    {
      text: 'Quản lý đơn hàng',
      icon: <ShoppingCartIcon />,
      path: '/admin/orders',
      color: '#ff9800'
    },
    {
      text: 'Quản lý sản phẩm',
      icon: <InventoryIcon />,
      path: '/admin/products',
      color: '#9c27b0'
    },
    {
      text: 'Danh mục sản phẩm',
      icon: <CategoryIcon />,
      path: '/admin/categories',
      color: '#f44336'
    },
    {
      text: 'Nhà sản xuất',
      icon: <BusinessIcon />,
      path: '/admin/manufacturers',
      color: '#26a69a'
    },
    // {
    //   text: 'Báo cáo thống kê',
    //   icon: <AssessmentIcon />,
    //   path: '/admin/reports',
    //   color: '#607d8b'
    // },
    {
      text: 'Hỗ trợ khách hàng',
      icon: <SupportIcon />,
      path: '/admin/support',
      color: '#795548'
    },
    {
      text: 'Hướng dẫn sử dụng',
      icon: <HelpOutlineIcon />,
      path: '/admin/hdsd',
      color: '#607d8b'
    }
  ];

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/login');
      return;
    }

    setUserInfo({
      name: 'Admin User',
      email: 'admin@pawcare.com',
      role: 'ADMIN'
    });
  }, [navigate]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      clearAuthTokens();
      navigate('/login');
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, textAlign: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48, mr: 2 }}>
              <PetsIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                PawCare
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Admin Panel
              </Typography>
            </Box>
          </Box>
        </motion.div>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List sx={{ px: 2, py: 1 }}>
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      bgcolor: isActive ? `${item.color}15` : 'transparent',
                      border: isActive ? `1px solid ${item.color}30` : '1px solid transparent',
                      '&:hover': {
                        bgcolor: `${item.color}10`,
                        transform: 'translateX(4px)',
                        transition: 'all 0.2s ease-in-out'
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40, color: isActive ? item.color : 'text.secondary' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontWeight: isActive ? 600 : 500,
                          color: isActive ? item.color : 'text.primary',
                          fontSize: '0.95rem'
                        }
                      }}
                    />
                    {isActive && (
                      <Chip
                        label="Active"
                        size="small"
                        sx={{
                          bgcolor: item.color,
                          color: 'white',
                          fontSize: '0.7rem',
                          height: 20
                        }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              </motion.div>
            );
          })}
        </List>
      </Box>

      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
              <AccountCircleIcon />
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {userInfo?.name || 'Admin User'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {userInfo?.email || 'admin@medstore.com'}
              </Typography>
              <Chip
                label="ADMIN"
                size="small"
                sx={{
                  bgcolor: 'success.main',
                  color: 'white',
                  fontSize: '0.7rem',
                  height: 18,
                  mt: 0.5
                }}
              />
            </Box>
          </Box>
        </motion.div>
      </Box>
    </Box>
  );

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <AppBar
          position="fixed"
          sx={{
            width: { md: `calc(100% - ${drawerWidth}px)` },
            ml: { md: `${drawerWidth}px` },
            bgcolor: 'white',
            color: 'text.primary',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>

            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {menuItems.find(item => item.path === location.pathname)?.text || 'Bảng điều khiển Admin'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Quản lý hệ thống PawCare
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* <Tooltip title="Thông báo">
                <IconButton sx={{ color: 'text.secondary' }}>
                  <Badge badgeContent={3} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip> */}

              <Tooltip title="Tài khoản">
                <IconButton onClick={handleProfileMenuOpen} sx={{ color: 'text.secondary' }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                    <AccountCircleIcon />
                  </Avatar>
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                sx={{
                  '& .MuiPaper-root': {
                    mt: 1,
                    minWidth: 200,
                    borderRadius: 2,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/'); }}>
                  <ShoppingCartIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  Trang mua sắm
                </MenuItem>
                <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/admin/profile'); }}>
                  <AccountCircleIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  Thông tin cá nhân
                </MenuItem>
                <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/admin/hdsd'); }}>
                  <HelpOutlineIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  Hướng dẫn sử dụng
                </MenuItem>
                
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 2, color: 'error.main' }} />
                  Đăng xuất
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
                bgcolor: 'background.paper',
                borderRight: '1px solid',
                borderColor: 'divider'
              }
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
                bgcolor: 'background.paper',
                borderRight: '1px solid',
                borderColor: 'divider'
              }
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { md: `calc(100% - ${drawerWidth}px)` },
            minHeight: '100vh',
            bgcolor: 'grey.50'
          }}
        >
          <Toolbar />
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUser />} />
                <Route path="orders" element={<AdminOrder />} />
                <Route path="categories" element={<CategoriesManagement />} />
                <Route path="manufacturers" element={<AdminManufacter />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="support" element={<AdminSupport />} />
                <Route path="hdsd" element={<AdminHDSD />} />
                <Route path="" element={<AdminDashboard />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>
    </ProtectedRoute>
  );
};

export default Admin;
