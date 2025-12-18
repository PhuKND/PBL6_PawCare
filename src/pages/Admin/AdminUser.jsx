import React, { useState, useEffect, useCallback } from 'react';
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
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Tooltip,
  Collapse,
  Stack,
  Select,
  FormControl,
  MenuItem,
  Snackbar
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  CalendarToday as CalendarIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  AccountCircle as AccountCircleIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import http from '../../api/http';

const formatDate = (dateString) => {
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
};

const AdminUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState({});
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await http.get('/users/all');

      let userList = [];
      if (Array.isArray(response.data)) {
        userList = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        userList = response.data.data;
      } else if (response.data?.data?.content && Array.isArray(response.data.data.content)) {
        userList = response.data.data.content;
      }
      
      setUsers(userList);
    } catch (err) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách người dùng');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);

  const handleRefresh = useCallback(() => {
    loadUsers();
  }, []);

  const toggleRowExpand = useCallback((userId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  }, []);

  const handleStatusChange = useCallback(async (userId, newStatus) => {
    try {
      setUpdatingStatus((prev) => ({ ...prev, [userId]: true }));
      
      const isActiveValue = newStatus === 'true' ? true : newStatus === 'false' ? false : newStatus;
      
      const response = await http.put(`/users/status?id=${userId}&isActive=${isActiveValue}`);

      const updatedUser = response?.data?.data || response?.data;
      if (updatedUser) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, ...updatedUser } : user
          )
        );
      }

      setSnackbar({
        open: true,
        message: response?.data?.message || 'Cập nhật trạng thái người dùng thành công!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error updating user status:', err);
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Không thể cập nhật trạng thái người dùng',
        severity: 'error'
      });
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [userId]: false }));
    }
  }, []);

  const filteredUsers = users.filter((user) => {
    if (!searchTerm) return true;
    const query = searchTerm.toLowerCase();
    const username = (user.username || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    const fullName = (user.fullName || '').toLowerCase();
    const phoneNumber = (user.phoneNumber || '').toLowerCase();
    const address = (user.address || '').toLowerCase();
    return username.includes(query) || email.includes(query) || fullName.includes(query) || phoneNumber.includes(query) || address.includes(query);
  });

  const activeUsersCount = users.filter(u => u.isActive === true).length;
  const inactiveUsersCount = users.filter(u => u.isActive === false).length;
  const unknownStatusCount = users.filter(u => u.isActive === null || u.isActive === undefined).length;

  if (loading && users.length === 0) {
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
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 56, height: 56 }}>
              <PeopleIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                Quản lý Người dùng
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Xem và quản lý tất cả tài khoản người dùng trong hệ thống
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
                      {users.length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Tổng người dùng
                    </Typography>
                  </Box>
                  <PeopleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              color: 'white',
              borderRadius: 3
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {activeUsersCount}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Đang hoạt động
                    </Typography>
                  </Box>
                  <CheckCircleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
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
                      {inactiveUsersCount}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Không hoạt động
                    </Typography>
                  </Box>
                  <CancelIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              borderRadius: 3
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {unknownStatusCount}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Chưa xác định
                    </Typography>
                  </Box>
                  <PersonIcon sx={{ fontSize: 40, opacity: 0.8 }} />
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', flex: 1 }}>
                <TextField
                  placeholder="Tìm kiếm theo tên đăng nhập, email, họ tên, số điện thoại..."
                  value={searchTerm}
                  onChange={handleSearch}
                  size="small"
                  sx={{ minWidth: 300, flex: 1, maxWidth: 500 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title="Làm mới danh sách">
                  <IconButton 
                    onClick={handleRefresh} 
                    color="primary"
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      }
                    }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
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
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Avatar</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Tên đăng nhập</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Họ tên</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Trạng thái</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Đăng nhập cuối</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2, textAlign: 'center' }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <PeopleIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                        {searchTerm ? 'Không tìm thấy người dùng nào' : 'Chưa có người dùng nào'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Danh sách người dùng trống'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <React.Fragment key={user.id}>
                      <TableRow
                        sx={{
                          '&:hover': {
                            bgcolor: 'grey.50',
                            transition: 'all 0.2s ease-in-out'
                          },
                          transition: 'all 0.2s ease-in-out',
                          cursor: 'pointer'
                        }}
                        onClick={() => toggleRowExpand(user.id)}
                      >
                        <TableCell>
                          <Avatar 
                            src={user.avatarUrl} 
                            sx={{ 
                              bgcolor: 'primary.main', 
                              width: 48, 
                              height: 48,
                              border: '2px solid',
                              borderColor: 'divider'
                            }}
                          >
                            {user.avatarUrl ? null : <PersonIcon />}
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {user.username || (
                              <Typography component="span" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                Chưa có
                              </Typography>
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {user.fullName || (
                              <Typography component="span" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                Chưa có
                              </Typography>
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {user.email || (
                                <Typography component="span" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                  Chưa có email
                                </Typography>
                              )}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FormControl size="small" sx={{ minWidth: 160 }}>
                              <Select
                                value={user.isActive === null || user.isActive === undefined ? 'null' : user.isActive.toString()}
                                onChange={(e) => {
                                  const newValue = e.target.value;
                                  if (newValue !== 'null') {
                                    handleStatusChange(user.id, newValue);
                                  }
                                }}
                                disabled={updatingStatus[user.id]}
                                onClick={(e) => e.stopPropagation()}
                                sx={{
                                  '& .MuiSelect-select': {
                                    py: 0.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5
                                  }
                                }}
                              >
                                <MenuItem value="true">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CheckCircleIcon fontSize="small" color="success" />
                                    <span>Hoạt động</span>
                                  </Box>
                                </MenuItem>
                                <MenuItem value="false">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CancelIcon fontSize="small" color="error" />
                                    <span>Không hoạt động</span>
                                  </Box>
                                </MenuItem>
                                <MenuItem value="null" disabled>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PersonIcon fontSize="small" />
                                    <span>Chưa xác định</span>
                                  </Box>
                                </MenuItem>
                              </Select>
                            </FormControl>
                            {updatingStatus[user.id] && (
                              <CircularProgress size={16} />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {user.lastLogin ? formatDate(user.lastLogin) : (
                                <Typography component="span" sx={{ fontStyle: 'italic' }}>
                                  Chưa đăng nhập
                                </Typography>
                              )}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRowExpand(user.id);
                            }}
                          >
                            {expandedRows[user.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={7} sx={{ py: 0, border: 0 }}>
                          <Collapse in={expandedRows[user.id]} timeout="auto" unmountOnExit>
                            <Box sx={{ p: 3, bgcolor: 'grey.50' }}>
                              <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                  <Card sx={{ mb: 2 }}>
                                    <CardContent>
                                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                                        Thông tin tài khoản
                                      </Typography>
                                      <Stack spacing={1.5}>
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">ID người dùng</Typography>
                                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                            {user.id}
                                          </Typography>
                                        </Box>
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">Tên đăng nhập</Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {user.username || 'Chưa có'}
                                          </Typography>
                                        </Box>
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">Họ và tên</Typography>
                                          <Typography variant="body2">
                                            {user.fullName || 'Chưa có'}
                                          </Typography>
                                        </Box>
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">Email</Typography>
                                          <Typography variant="body2">
                                            {user.email || 'Chưa có'}
                                          </Typography>
                                        </Box>
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">Trạng thái</Typography>
                                          <Box sx={{ mt: 0.5 }}>
                                            {user.isActive === true ? (
                                              <Chip
                                                icon={<CheckCircleIcon />}
                                                label="Hoạt động"
                                                color="success"
                                                size="small"
                                                sx={{ fontWeight: 600 }}
                                              />
                                            ) : user.isActive === false ? (
                                              <Chip
                                                icon={<CancelIcon />}
                                                label="Không hoạt động"
                                                color="error"
                                                size="small"
                                                sx={{ fontWeight: 600 }}
                                              />
                                            ) : (
                                              <Chip
                                                label="Chưa xác định"
                                                color="default"
                                                size="small"
                                                variant="outlined"
                                                sx={{ fontWeight: 600 }}
                                              />
                                            )}
                                          </Box>
                                        </Box>
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">Ngày tạo tài khoản</Typography>
                                          <Typography variant="body2">
                                            {formatDate(user.createdAt)}
                                          </Typography>
                                        </Box>
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">Đăng nhập cuối</Typography>
                                          <Typography variant="body2">
                                            {user.lastLogin ? formatDate(user.lastLogin) : 'Chưa đăng nhập'}
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
                                        Thông tin liên hệ
                                      </Typography>
                                      <Stack spacing={1.5}>
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">Số điện thoại</Typography>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                            <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                            <Typography variant="body2">
                                              {user.phoneNumber || 'Chưa có'}
                                            </Typography>
                                          </Box>
                                        </Box>
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">Địa chỉ</Typography>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                            <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                            <Typography variant="body2">
                                              {user.address || 'Chưa có'}
                                            </Typography>
                                          </Box>
                                        </Box>
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">Thành phố</Typography>
                                          <Typography variant="body2">
                                            {user.city || 'Chưa có'}
                                          </Typography>
                                        </Box>
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">Phường/Xã</Typography>
                                          <Typography variant="body2">
                                            {user.ward || 'Chưa có'}
                                          </Typography>
                                        </Box>
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">Avatar</Typography>
                                          <Box sx={{ mt: 1 }}>
                                            {user.avatarUrl ? (
                                              <Avatar 
                                                src={user.avatarUrl} 
                                                sx={{ 
                                                  width: 80, 
                                                  height: 80,
                                                  border: '2px solid',
                                                  borderColor: 'divider'
                                                }}
                                              />
                                            ) : (
                                              <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}>
                                                <AccountCircleIcon sx={{ fontSize: 50 }} />
                                              </Avatar>
                                            )}
                                          </Box>
                                        </Box>
                                      </Stack>
                                    </CardContent>
                                  </Card>
                                </Grid>
                              </Grid>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {loading && users.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
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

export default AdminUser;

