import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  Paper,
  Alert,
} from '@mui/material';
import { Pets as PetsIcon } from '@mui/icons-material';
import AiImageInput from '../components/ai/AiImageInput';
import AiResultPanel from '../components/ai/AiResultPanel';
import { predictPetType } from '../api/ai';

const AiPetIdentify = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleImageSelected = (file) => {
    setSelectedFile(file);
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Vui lòng chọn ảnh trước khi phân tích');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await predictPetType({ file: selectedFile });
      setResult(response);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi phân tích ảnh');
      console.error('Pet identify error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    if (selectedFile) {
      handleAnalyze();
    }
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
                bgcolor: 'secondary.main',
                color: 'white',
                mb: 2,
              }}
            >
              <PetsIcon sx={{ fontSize: 48 }} />
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
              Nhận diện loài thú cưng
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Xác định giống chó/mèo từ ảnh
            </Typography>
          </Box>

          <Paper sx={{ p: 4, borderRadius: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Tải ảnh hoặc chụp ảnh
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Chụp hoặc tải ảnh thú cưng để AI nhận diện giống loài. Đảm bảo ảnh rõ nét và thú cưng
              chiếm phần lớn khung hình.
            </Typography>

            <AiImageInput
              onImageSelected={handleImageSelected}
              onError={setError}
              disabled={loading}
            />

            {selectedFile && !loading && !result && (
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Box
                    component="button"
                    onClick={handleAnalyze}
                    sx={{
                      bgcolor: 'secondary.main',
                      color: 'white',
                      border: 'none',
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'secondary.dark' },
                    }}
                  >
                    Phân tích ảnh
                  </Box>
                </motion.div>
              </Box>
            )}
          </Paper>

          {(result || loading || error) && (
            <AiResultPanel
              result={result}
              loading={loading}
              error={error}
              onRetry={handleRetry}
              searchKeyword={result?.label}
            />
          )}

          {!selectedFile && !loading && !result && (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="body2">
                <strong>Hướng dẫn:</strong> Tải ảnh hoặc chụp ảnh thú cưng của bạn. AI sẽ phân tích
                và xác định giống loài, cung cấp thông tin về đặc điểm và tính cách.
              </Typography>
            </Alert>
          )}
        </motion.div>
      </Container>
    </Box>
  );
};

export default AiPetIdentify;

