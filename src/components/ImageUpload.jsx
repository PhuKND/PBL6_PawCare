import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  CloudUpload as UploadIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { predictInsectType } from '../api/ai';

const ImageUpload = ({ open, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const fileInputRef = React.useRef(null);
  const navigate = useNavigate();

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh hợp lệ');
      return;
    }

    setSelectedFile(file);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    resetFileInput();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh hợp lệ');
      return;
    }

    setSelectedFile(file);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const processImage = async () => {
    const file = selectedFile;
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await predictInsectType({ file });
      if (!data.label) {
        throw new Error('Dữ liệu trả về không hợp lệ');
      }
      setResult(data);
      if (data.label) {
        navigate(`/search?keyword=${encodeURIComponent(data.label)}`);
      }
    } catch (err) {
      setError('Lỗi khi xử lý ảnh: ' + (err.message || 'Không xác định'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    resetFileInput();
    onClose && onClose();
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Tải ảnh để nhận diện</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {result && !error && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body1" component="div">
              <strong>Côn trùng được nhận diện:</strong> {result.label}
            </Typography>
            {typeof result.confidence === 'number' && (
              <Typography variant="body2" color="text.secondary">
                Độ tin cậy: <strong>{result.confidence.toFixed(1)}%</strong>
              </Typography>
            )}
          </Alert>
        )}

        <Box sx={{ textAlign: 'center' }}>
          {!preview ? (
            <Paper
              variant="outlined"
              sx={{
                p: 4,
                border: '2px dashed #ccc',
                borderRadius: 2,
                cursor: 'pointer',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'action.hover',
                },
              }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={handleUploadClick}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <UploadIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                <Typography variant="h6" color="text.secondary">
                  Kéo thả ảnh vào đây hoặc click để chọn
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hỗ trợ: JPG, PNG, GIF
                </Typography>
                <Button variant="outlined" startIcon={<ImageIcon />} onClick={handleUploadClick}>
                  Chọn ảnh
                </Button>
              </Box>
            </Paper>
          ) : (
            <Box>
              <img
                src={preview}
                alt="Selected"
                style={{
                  width: '100%',
                  maxWidth: '640px',
                  height: 'auto',
                  borderRadius: '8px',
                  border: '2px solid #e0e0e0',
                }}
              />
            </Box>
          )}
        </Box>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          style={{ display: 'none' }}
        />
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} color="secondary">
          Hủy
        </Button>

        {preview && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              onClick={() => {
                setSelectedFile(null);
                setPreview(null);
                setError(null);
                setResult(null);
                resetFileInput();
              }}
              color="secondary"
              disabled={isLoading}
            >
              Chọn lại
            </Button>
            <Button
              onClick={processImage}
              variant="contained"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? 'Đang xử lý...' : 'Xử lý ảnh'}
            </Button>
          </Box>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ImageUpload;

