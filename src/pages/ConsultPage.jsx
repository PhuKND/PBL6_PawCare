import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  Button,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Healing as HealingIcon,
  Videocam as VideocamIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import ChatWindow from '../components/ChatWindow';

export default function ConsultPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Get current user from localStorage (phải có id + username)
  const currentUserRaw = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUser = {
    id: currentUserRaw.id || currentUserRaw.userId,
    username: currentUserRaw.username
  };

  // Partner user là admin support (lấy ID từ env)
  const adminId = import.meta.env.VITE_SUPPORT_ADMIN_ID || null;
  const partnerUser = {
    id: adminId,
    username: 'admin',
    fullName: 'Bác sĩ thú y'
  };

  const quickPrompts = ['Ngứa da', 'Rụng lông', 'Nấm da', 'Ve/rận', 'Hôi tai'];

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

  if (!currentUser.id || !currentUser.username) {
    return (
      <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh', py: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Vui lòng đăng nhập để sử dụng tính năng tư vấn
        </Typography>
      </Box>
    );
  }

  if (!adminId) {
    return (
      <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh', py: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Cấu hình thiếu VITE_SUPPORT_ADMIN_ID. Vui lòng liên hệ quản trị viên.
        </Typography>
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


