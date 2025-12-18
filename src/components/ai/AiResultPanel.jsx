import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Alert,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  ShoppingCart as ShoppingCartIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AiResultPanel = ({ 
  result, 
  loading = false, 
  error = null,
  onRetry,
  searchKeyword = null,
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom>
          Đang xử lý...
        </Typography>
        <LinearProgress sx={{ mt: 2 }} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Vui lòng đợi trong giây lát
        </Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ borderRadius: 3 }}
        action={
          onRetry && (
            <Button color="inherit" size="small" onClick={onRetry}>
              Thử lại
            </Button>
          )
        }
      >
        <Typography variant="body1" fontWeight="bold">
          Lỗi xử lý
        </Typography>
        <Typography variant="body2">{error}</Typography>
      </Alert>
    );
  }

  if (!result) {
    return null;
  }

  const { label, confidence, extra } = result;
  const keyword = searchKeyword || label;

  return (
    <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <CheckCircleIcon color="success" sx={{ fontSize: 32 }} />
        <Typography variant="h5" fontWeight="bold">
          Kết quả phân tích
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Dự đoán:
        </Typography>
        <Typography variant="h6" color="primary.main" fontWeight="bold">
          {label}
        </Typography>
      </Box>

      {confidence !== null && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Độ tin cậy:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinearProgress
              variant="determinate"
              value={confidence}
              sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
            />
            <Typography variant="body2" fontWeight="bold" color="primary.main">
              {confidence.toFixed(1)}%
            </Typography>
          </Box>
        </Box>
      )}

      {extra && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Thông tin thêm:
          </Typography>
          <Typography variant="body2">{extra}</Typography>
        </Box>
      )}

      <Alert 
        severity="info" 
        icon={<InfoIcon />}
        sx={{ mb: 2, borderRadius: 2 }}
      >
        <Typography variant="body2">
          <strong>Lưu ý:</strong> Kết quả chỉ mang tính tham khảo, không thay thế chẩn đoán bác sĩ thú y.
        </Typography>
      </Alert>

      {keyword && (
        <Button
          fullWidth
          variant="contained"
          size="large"
          startIcon={<ShoppingCartIcon />}
          onClick={() => navigate(`/search?keyword=${encodeURIComponent(keyword)}`)}
          sx={{ mt: 2 }}
        >
          Xem sản phẩm liên quan
        </Button>
      )}
    </Paper>
  );
};

export default AiResultPanel;

