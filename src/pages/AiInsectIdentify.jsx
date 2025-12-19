import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Stack,
  Alert
} from '@mui/material';
import { BugReport as BugReportIcon, Image as ImageIcon, CameraAlt as CameraIcon } from '@mui/icons-material';
import ImageUpload from '../components/ImageUpload';
import CameraModal from '../components/CameraModal';

const AiInsectIdentify = () => {
  const [openUpload, setOpenUpload] = useState(false);
  const [openCamera, setOpenCamera] = useState(false);
  const [lastLabel, setLastLabel] = useState('');

  const handleCloseUpload = () => {
    setOpenUpload(false);
  };

  const handleCloseCamera = () => {
    setOpenCamera(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 6 }}>
      <Container maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'error.main',
                color: 'white',
                mb: 2
              }}
            >
              <BugReportIcon sx={{ fontSize: 48 }} />
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
              Nhận diện côn trùng gây hại
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Tải ảnh hoặc chụp ảnh côn trùng gây hại cho thú cưng để gợi ý sản phẩm xử lý phù hợp
            </Typography>
          </Box>

          <Paper sx={{ p: 4, borderRadius: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Chọn cách cung cấp ảnh
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Bạn có thể tải ảnh có sẵn hoặc dùng camera để chụp trực tiếp côn trùng gây hại. Hệ thống AI sẽ phân tích và tự động tìm các sản phẩm giúp xử lý loại côn trùng đó.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="contained"
                startIcon={<ImageIcon />}
                onClick={() => setOpenUpload(true)}
                sx={{ flex: 1, py: 1.5 }}
              >
                Tải ảnh từ thiết bị
              </Button>
              <Button
                variant="outlined"
                startIcon={<CameraIcon />}
                onClick={() => setOpenCamera(true)}
                sx={{ flex: 1, py: 1.5 }}
              >
                Chụp ảnh bằng camera
              </Button>
            </Stack>
          </Paper>

          {!lastLabel && (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="body2">
                Sau khi AI nhận diện được loại côn trùng, hệ thống sẽ tự động chuyển sang trang tìm kiếm và hiển thị các sản phẩm liên quan để xử lý côn trùng đó.
              </Typography>
            </Alert>
          )}
        </motion.div>
      </Container>

      <ImageUpload
        open={openUpload}
        onClose={handleCloseUpload}
      />
      <CameraModal
        open={openCamera}
        onClose={handleCloseCamera}
      />
    </Box>
  );
};

export default AiInsectIdentify;


