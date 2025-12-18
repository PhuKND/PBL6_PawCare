import React, { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  Chip,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Healing as HealingIcon
} from '@mui/icons-material';
import http from '../api/http';
import ChatWindow from '../components/ChatWindow';

export default function ConsultPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [currentUser, setCurrentUser] = useState(null);
  const [partnerUser, setPartnerUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const quickPrompts = ['Ngứa da', 'Rụng lông', 'Nấm da', 'Ve/rận', 'Hôi tai'];

  // Load current user info và admin info khi component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        setError('');

        // Gọi 2 API song song
        const [userResponse, adminResponse] = await Promise.all([
          http.get('/users/info'),
          http.get('/users/admin-info')
        ]);

        // Parse current user (sender)
        const userData = userResponse?.data?.data || userResponse?.data;
        if (!userData?.id) {
          throw new Error('Không thể lấy thông tin người dùng. Vui lòng đăng nhập lại.');
        }

        const currentUserData = {
          id: userData.id,
          username: userData.email?.split('@')[0] || userData.fullName || 'user',
          fullName: userData.fullName,
          email: userData.email
        };

        // Parse admin info
        const adminData = adminResponse?.data?.data || adminResponse?.data;
        if (!adminData?.id) {
          throw new Error('Không thể lấy thông tin admin. Vui lòng thử lại sau.');
        }

        const partnerUserData = {
          id: adminData.id,
          username: 'admin',
          fullName: adminData.fullName || 'Bác sĩ thú y',
          avatarUrl: adminData.avatarUrl
        };

        setCurrentUser(currentUserData);
        setPartnerUser(partnerUserData);
      } catch (err) {
        console.error('Error loading user data:', err);
        const errorMessage = 
          err?.response?.data?.message || 
          err?.message || 
          'Không thể tải thông tin. Vui lòng thử lại.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const header = useMemo(() => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Avatar sx={{ bgcolor: 'primary.main' }}>
        <HealingIcon />
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ fontWeight: 'bold' }}>
          Tư vấn với Bác sĩ thú y
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
          <Chip label="Trực tuyến" color="success" size="small" />
          <Typography variant="body2" color="text.secondary">
            Phản hồi trong ~1 phút
          </Typography>
        </Box>
      </Box>
    </Box>
  ), [isMobile]);

  // Loading state
  if (loading) {
    return (
      <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh', py: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Đang tải thông tin...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="md">
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Lỗi tải dữ liệu
            </Typography>
            <Typography variant="body2">
              {error}
            </Typography>
          </Alert>
        </Container>
      </Box>
    );
  }

  // Kiểm tra đã có đủ data
  if (!currentUser?.id || !partnerUser?.id) {
    return (
      <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh', py: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          <Typography variant="body1">
            Không thể khởi tạo chat. Vui lòng thử lại sau.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', height: isMobile ? '80vh' : '85vh', display: 'flex', flexDirection: 'column' }}>
            <ChatWindow
              currentUser={currentUser}
              partnerUser={partnerUser}
              partnerDisplayName="Bác sĩ thú y"
              quickPrompts={quickPrompts}
              onHeaderRender={() => header}
            />
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}


