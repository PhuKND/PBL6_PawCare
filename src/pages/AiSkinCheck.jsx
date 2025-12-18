import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { Healing as HealingIcon } from '@mui/icons-material';
import AiImageInput from '../components/ai/AiImageInput';
import AiResultPanel from '../components/ai/AiResultPanel';
import { predictSkinDisease } from '../api/ai';

const AiSkinCheck = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [petType, setPetType] = useState('dog');
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
      const response = await predictSkinDisease({ file: selectedFile, petType });
      setResult(response);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi phân tích ảnh');
      console.error('Skin check error:', err);
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
                bgcolor: 'primary.light',
                color: 'white',
                mb: 2,
              }}
            >
              <HealingIcon sx={{ fontSize: 48 }} />
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
              Chẩn đoán vấn đề da
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Phát hiện các vấn đề về da ở chó và mèo từ ảnh
            </Typography>
          </Box>

          <Paper sx={{ p: 4, borderRadius: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Chọn loại thú cưng
            </Typography>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Loại thú cưng</InputLabel>
              <Select
                value={petType}
                label="Loại thú cưng"
                onChange={(e) => {
                  setPetType(e.target.value);
                  setResult(null);
                  setError(null);
                }}
              >
                <MenuItem value="dog">Chó</MenuItem>
                <MenuItem value="cat">Mèo</MenuItem>
              </Select>
            </FormControl>

            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Tải ảnh hoặc chụp ảnh
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Vui lòng chụp ảnh rõ nét vùng da bị ảnh hưởng của thú cưng. Đảm bảo ánh sáng đủ và
              ảnh không bị mờ.
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
                      bgcolor: 'primary.main',
                      color: 'white',
                      border: 'none',
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'primary.dark' },
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
                <strong>Hướng dẫn:</strong> Chọn loại thú cưng, sau đó tải ảnh hoặc chụp ảnh vùng
                da cần kiểm tra. AI sẽ phân tích và đưa ra dự đoán về vấn đề da liễu.
              </Typography>
            </Alert>
          )}
        </motion.div>
      </Container>
    </Box>
  );
};

export default AiSkinCheck;

