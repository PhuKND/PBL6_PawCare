import React from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  Grid,
  IconButton,
  useTheme,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  // Facebook as FacebookIcon,
  // YouTube as YouTubeIcon,
  // Instagram as InstagramIcon,
  
  KeyboardArrowUp as ArrowUpIcon
} from '@mui/icons-material';
import { Pets as PetsIcon } from '@mui/icons-material';

const Footer = () => {
  const theme = useTheme();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerLinks = {
    'Về chúng tôi': [
      'Giới thiệu',
      'Hệ thống cửa hàng',
      'Giấy phép kinh doanh',
      'Quy chế hoạt động',
      'Chính sách đặt cọc',
      'Chính sách nội dung'
    ],
    'Danh mục': [
      'Thức ăn cho chó/mèo',
      'Vitamin & Dinh dưỡng',
      'Vệ sinh & Grooming',
      'Chăm sóc da liễu',
      'Phụ kiện thú cưng',
      'Sản phẩm chống ve/rận'
    ],
    'Tìm hiểu thêm': [
      'Góc sức khỏe thú cưng',
      'AI Hub - Công cụ thông minh',
      'Chẩn đoán da liễu',
      'Nhận diện giống loài',
      'Bệnh thường gặp',
      'Đội ngũ bác sĩ thú y'
    ],
    'Hỗ trợ': [
      'Hướng dẫn mua hàng',
      'Chính sách đổi trả',
      'Chính sách giao hàng',
      'Chính sách bảo mật',
      'Chính sách thanh toán',
      'Kiểm tra hóa đơn'
    ]
  };

  // const socialLinks = [
  //   { icon: <FacebookIcon />, href: '#', label: 'Facebook' },
  //   { icon: <YouTubeIcon />, href: '#', label: 'YouTube' },
  //   { icon: <InstagramIcon />, href: '#', label: 'Instagram' },
  // ];

  return (
    <Box component="footer" sx={{ bgcolor: 'grey.900', color: 'white' }}>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} lg={5}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <PetsIcon sx={{ fontSize: 40, color: 'primary.light' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.light' }}>
                    PawCare
                  </Typography>
                  <Typography variant="body2" color="grey.400">
                    Chăm sóc thú cưng thông minh
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="body1" sx={{ mb: 3, color: 'grey.300', lineHeight: 1.7 }}>
                PawCare - Cửa hàng thú cưng trực tuyến hàng đầu Việt Nam, 
                cung cấp các sản phẩm chăm sóc sức khỏe thú cưng chất lượng cao với 
                dịch vụ tư vấn bác sĩ thú y 24/7 và công nghệ AI tiên tiến.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'grey.300' }}>
                  <PhoneIcon sx={{ color: 'primary.light' }} />

                  <Typography variant="body2">Tư vấn: 0123456789</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'grey.300' }}>
                  <EmailIcon sx={{ color: 'primary.light' }} />
                  <Typography variant="body2">khanhphuminh@gmail.com</Typography>
                </Box>
                {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'grey.300' }}>
                  <EmailIcon sx={{ color: 'primary.light' }} />
                </Box> */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'grey.300' }}>
                  <LocationIcon sx={{ color: 'primary.light' }} />
                  <Typography variant="body2">Bách Khoa, Đà Nẵng</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'grey.300' }}>
                  <TimeIcon sx={{ color: 'primary.light' }} />
                  <Typography variant="body2">Giờ làm việc: 8:00 - 22:00</Typography>
                </Box>
              </Box>
            </motion.div>
          </Grid>

          {Object.entries(footerLinks).map(([category, links], index) => (
            <Grid item xs={12} sm={6} lg={1.75} key={category}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Typography variant="h6" sx={{ fontWeight: 'semibold', mb: 2, color: 'primary.light' }}>
                  {category}
                </Typography>
                <List dense sx={{ p: 0 }}>
                  {links.map((link, linkIndex) => (
                    <ListItem key={linkIndex} sx={{ p: 0, minHeight: 'auto' }}>
                      <ListItemText
                        primary={link}
                        sx={{
                          '& .MuiListItemText-primary': {
                            color: 'grey.300',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            '&:hover': {
                              color: 'primary.light'
                            }
                          }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Divider sx={{ borderColor: 'grey.800' }} />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Typography variant="body2" color="grey.400" sx={{ mb: 1 }}>
                Công Ty Chăm Sóc Thú Cưng PawCare
              </Typography>
              <Typography variant="body2" color="grey.400">
                Được cấp phép bởi Bộ Nông Nghiệp & Phát Triển Nông Thôn
              </Typography>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: { xs: 'center', md: 'flex-end' } }}>
                {/* <Typography variant="body2" color="grey.400">
                  Kết nối với chúng tôi:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {socialLinks.map((social, index) => (
                    <motion.div key={index} whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}>
                      <IconButton
                        href={social.href}
                        aria-label={social.label}
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: 'grey.800',
                          color: 'grey.300',
                          '&:hover': {
                            bgcolor: 'primary.main',
                            color: 'white'
                          }
                        }}
                      >
                        {social.icon}
                      </IconButton>
                    </motion.div>
                  ))}
                </Box> */}
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{
          position: 'fixed',
          bottom: theme.spacing(4),
          right: theme.spacing(4),
          zIndex: 1000
        }}
      >
        <IconButton
          onClick={scrollToTop}
          aria-label="Scroll to top"
          sx={{
            width: 48,
            height: 48,
            bgcolor: 'primary.main',
            color: 'white',
            boxShadow: theme.shadows[4],
            '&:hover': { bgcolor: 'primary.dark' }
          }}
        >
          <ArrowUpIcon />
        </IconButton>
      </motion.div>
    </Box>
  );
};

export default Footer;
