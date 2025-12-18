import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  Button,
  Link,
  Divider,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Visibility, VisibilityOff, Person, Lock } from '@mui/icons-material';
import { apiRegister } from '../api/auth';

export default function Register() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', repeat: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.repeat) {
      setError('Mật khẩu xác nhận không khớp. Vui lòng thử lại.');
      return;
    }

    if (form.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setLoading(true);
    try {
      await apiRegister({
        username: form.username,
        password: form.password,
        repeat: form.repeat
      });
      navigate('/login');
    } catch (err) {
      setError(err?.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      py: 6 
    }}>
      <Container maxWidth="sm">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
        >
          <Paper 
            elevation={8} 
            sx={{ 
              p: { xs: 4, md: 6 }, 
              borderRadius: 4
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography 
                variant={isMobile ? 'h4' : 'h3'} 
                sx={{ 
                  fontWeight: 'bold', 
                  mb: 2,
                  textAlign: 'center',
                  color: 'primary.main'
                }}
              >
                Tạo tài khoản mới
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ 
                  mb: 3, 
                  textAlign: 'center'
                }}
              >
                Tham gia MedStore để nhận nhiều ưu đãi hấp dẫn
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                fullWidth
                label="Tên đăng nhập"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="primary" />
                    </InputAdornment>
                  )
                }}
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="normal"
                fullWidth
                label="Mật khẩu"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={() => setShowPassword((s) => !s)} 
                        edge="end" 
                        aria-label="toggle password visibility"
                        color="primary"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{ mb: 2 }}
              />

              <TextField
                margin="normal"
                fullWidth
                label="Xác nhận mật khẩu"
                name="repeat"
                type={showRepeatPassword ? 'text' : 'password'}
                value={form.repeat}
                onChange={handleChange}
                required
                error={form.repeat !== '' && form.password !== form.repeat}
                helperText={form.repeat !== '' && form.password !== form.repeat ? 'Mật khẩu xác nhận không khớp' : ''}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={() => setShowRepeatPassword((s) => !s)} 
                        edge="end" 
                        aria-label="toggle repeat password visibility"
                        color="primary"
                      >
                        {showRepeatPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{ mb: 3 }}
              />

              <Button 
                type="submit" 
                fullWidth 
                variant="contained" 
                size="large" 
                disabled={loading || !form.username || !form.password || !form.repeat || form.password !== form.repeat}
                sx={{ 
                  mt: 2, 
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderRadius: 2
                }}
              >
                {loading ? 'Đang đăng ký...' : 'Đăng ký'}
              </Button>
            </Box>

            <Divider sx={{ my: 4 }} />

            <Typography variant="body1" sx={{ textAlign: 'center', fontSize: '1rem' }}>
              Đã có tài khoản?{' '}
              <Link 
                component={RouterLink} 
                to="/login"
                sx={{ 
                  fontWeight: 'bold',
                  textDecoration: 'none'
                }}
              >
                Đăng nhập ngay
              </Link>
            </Typography>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}


