import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  TextField,
  Button,
  Chip,
  useTheme,
  useMediaQuery,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Grid,
  InputAdornment
} from '@mui/material';
import {
  Support as SupportIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  Chat as ChatIcon,
  Phone as PhoneIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import http from '../../api/http';
import { getChatPeople } from '../../api/chat';
import ChatWindow from '../../components/ChatWindow';

export default function AdminSupport() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Get current admin user (phải có id + username)
  const currentUserRaw = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUser = {
    id: currentUserRaw.id || currentUserRaw.userId,
    username: currentUserRaw.username || 'admin'
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      // Dùng /chat/people thay vì /users/all
      const userList = await getChatPeople();
      setUsers(userList);
    } catch (err) {
      console.error('Error loading chat people:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const quickPrompts = [
    'Xin chào, tôi có thể giúp gì cho bạn?',
    'Cảm ơn bạn đã liên hệ',
    'Vui lòng cung cấp thêm thông tin',
    'Tôi sẽ kiểm tra và phản hồi sớm nhất'
  ];

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    const q = searchTerm.toLowerCase();
    return users.filter(
      (user) =>
        (user.username || '').toLowerCase().includes(q) ||
        (user.fullName || '').toLowerCase().includes(q) ||
        (user.email || '').toLowerCase().includes(q)
    );
  }, [users, searchTerm]);

  const renderChatHeader = useCallback(({ connected, partnerUser, partnerDisplayName }) => {
    const user = users.find(u => (u.id === partnerUser?.id) || (u.username === partnerUser?.username));
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          src={partnerUser?.avatarUrl || user?.avatarUrl}
          sx={{ bgcolor: 'primary.main' }}
        >
          {(partnerUser?.avatarUrl || user?.avatarUrl) ? null : <PersonIcon />}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ fontWeight: 'bold' }}>
            {partnerDisplayName || partnerUser?.fullName || user?.fullName || partnerUser?.username || user?.username || 'Người dùng'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Chip
              label={connected ? 'Trực tuyến' : 'Đang kết nối...'}
              color={connected ? 'success' : 'default'}
              size="small"
            />
            <Typography variant="body2" color="text.secondary">
              {user?.email || partnerUser?.username || user?.username}
            </Typography>
          </Box>
        </Box>
        {/* <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
          <Button variant="outlined" size="small" startIcon={<PhoneIcon />}>
            Gọi
          </Button>
          <Button variant="outlined" size="small" startIcon={<EmailIcon />}>
            Email
          </Button>
        </Box> */}
      </Box>
    );
  }, [users, isMobile]);

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
              <SupportIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                Hỗ trợ khách hàng
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Quản lý và trả lời tin nhắn hỗ trợ từ khách hàng
              </Typography>
            </Box>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Conversations List */}
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', height: 'calc(100vh - 200px)' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'white' }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Tìm kiếm cuộc trò chuyện..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Box sx={{ overflowY: 'auto', height: 'calc(100% - 80px)' }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : filteredUsers.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <ChatIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      {searchTerm ? 'Không tìm thấy người dùng' : 'Chưa có người dùng nào'}
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ p: 0 }}>
                    {filteredUsers.map((user) => (
                      <ListItem
                        key={user.id || user.username}
                        button
                        onClick={() => setSelectedUser(user)}
                        selected={selectedUser?.id === user.id}
                        sx={{
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          '&:hover': { bgcolor: 'grey.50' },
                          '&.Mui-selected': {
                            bgcolor: 'primary.light',
                            '&:hover': { bgcolor: 'primary.light' }
                          }
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            src={user.avatarUrl}
                            sx={{ bgcolor: 'primary.main' }}
                          >
                            {user.avatarUrl ? null : <PersonIcon />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {user.fullName || user.username || 'Người dùng'}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              {user.email || user.username}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Chat Area */}
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
              {selectedUser && selectedUser.id ? (
                <ChatWindow
                  currentUser={currentUser}
                  partnerUser={{
                    id: selectedUser.id,
                    username: selectedUser.username,
                    fullName: selectedUser.fullName,
                    avatarUrl: selectedUser.avatarUrl
                  }}
                  partnerDisplayName={selectedUser.fullName || selectedUser.username}
                  quickPrompts={quickPrompts}
                  onHeaderRender={renderChatHeader}
                />
              ) : (
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 4,
                    bgcolor: 'grey.50'
                  }}
                >
                  <ChatIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    Chọn cuộc trò chuyện để bắt đầu
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Chọn một khách hàng từ danh sách bên trái để xem và trả lời tin nhắn
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
}

