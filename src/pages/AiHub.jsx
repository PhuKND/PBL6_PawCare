import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  useTheme,
} from '@mui/material';
import {
  Pets as PetsIcon,
  Healing as HealingIcon,
  Psychology as PsychologyIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

const AiHub = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const aiTools = [
    {
      id: 'skin-check',
      title: 'Chẩn đoán vấn đề da',
      subtitle: 'Phát hiện các vấn đề về da ở chó và mèo',
      description: 'Tải ảnh vùng da bị ảnh hưởng của thú cưng để nhận được chẩn đoán sơ bộ về các vấn đề da liễu phổ biến.',
      icon: <HealingIcon sx={{ fontSize: 64 }} />,
      color: '#10B981',
      route: '/ai/skin-check',
    },
    {
      id: 'pet-identify',
      title: 'Nhận diện loài thú cưng',
      subtitle: 'Xác định giống chó/mèo từ ảnh',
      description: 'Chụp hoặc tải ảnh thú cưng để AI nhận diện giống loài và cung cấp thông tin về đặc điểm, tính cách.',
      icon: <PetsIcon sx={{ fontSize: 64 }} />,
      color: '#F59E0B',
      route: '/ai/pet-identify',
    },
    {
      id: 'insect-identify',
      title: 'Nhận diện côn trùng gây hại',
      subtitle: 'Phát hiện côn trùng gây hại cho thú cưng',
      description: 'Tải ảnh hoặc chụp ảnh côn trùng để AI nhận diện và gợi ý các sản phẩm xử lý, bảo vệ thú cưng hiệu quả.',
      icon: <PsychologyIcon sx={{ fontSize: 64 }} />,
      color: '#EF4444',
      route: '/ai/insect-identify',
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 8 }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h2"
              sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}
            >
              AI Hub - Công cụ thông minh
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Sử dụng công nghệ AI để chăm sóc sức khỏe thú cưng một cách thông minh và tiện lợi
            </Typography>
          </Box>

          <Grid container spacing={4} sx={{ mb: 6 }}>
            {aiTools.map((tool, index) => (
              <Grid item xs={12} md={6} key={tool.id}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  whileHover={{ y: -8 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      borderRadius: 4,
                      background: `linear-gradient(135deg, ${tool.color}15 0%, ${tool.color}05 100%)`,
                      border: `2px solid ${tool.color}30`,
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: theme.shadows[12],
                        borderColor: tool.color,
                      },
                    }}
                    onClick={() => navigate(tool.route)}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 120,
                          height: 120,
                          borderRadius: '50%',
                          bgcolor: `${tool.color}20`,
                          mb: 3,
                          mx: 'auto',
                        }}
                      >
                        <Box sx={{ color: tool.color }}>{tool.icon}</Box>
                      </Box>
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 'bold', mb: 1, textAlign: 'center' }}
                      >
                        {tool.title}
                      </Typography>
                      <Typography
                        variant="subtitle1"
                        color="text.secondary"
                        sx={{ mb: 2, textAlign: 'center' }}
                      >
                        {tool.subtitle}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        {tool.description}
                      </Typography>
                      <Button
                        fullWidth
                        variant="contained"
                        endIcon={<ArrowForwardIcon />}
                        sx={{
                          bgcolor: tool.color,
                          '&:hover': { bgcolor: tool.color, opacity: 0.9 },
                        }}
                      >
                        Thử ngay
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Box
              sx={{
                bgcolor: 'primary.light',
                color: 'white',
                p: 4,
                borderRadius: 4,
                textAlign: 'center',
              }}
            >
              <PsychologyIcon sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                Công nghệ AI tiên tiến
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Các công cụ AI của chúng tôi sử dụng mô hình học máy được đào tạo trên hàng nghìn
                hình ảnh để đưa ra kết quả chính xác và hữu ích.
              </Typography>
            </Box>
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  );
};

export default AiHub;

