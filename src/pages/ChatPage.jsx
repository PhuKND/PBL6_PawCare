import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Paper,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import ChatWindow from '../components/ChatWindow';

export default function ChatPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { partner } = useParams();

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUsername = currentUser.username;

  if (!currentUsername) {
    return <Navigate to="/login" replace />;
  }

  if (!partner) {
    return (
      <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh', py: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Không tìm thấy người dùng để trò chuyện
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
              currentUsername={currentUsername}
              partnerUsername={partner}
              partnerDisplayName={partner}
            />
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}

