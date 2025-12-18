import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CameraAlt as CameraIcon,
  Close as CloseIcon,
  Image as ImageIcon,
} from '@mui/icons-material';

const AiImageInput = ({ 
  onImageSelected, 
  onError,
  accept = 'image/*',
  maxSizeMB = 10,
  disabled = false,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const handleFileSelect = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onError?.('Vui lòng chọn file ảnh hợp lệ (JPG, PNG, GIF)');
      return;
    }

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      onError?.(`Kích thước ảnh không được vượt quá ${maxSizeMB}MB`);
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
    onImageSelected?.(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'environment',
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      onError?.('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;

    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(video, 0, 0, w, h);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          onError?.('Không thể chụp ảnh từ camera.');
          return;
        }
        const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
        handleFileSelect(file);
        setIsCameraOpen(false);
        stopCamera();
      },
      'image/jpeg',
      0.9
    );
  };

  const handleCameraOpen = () => {
    setIsCameraOpen(true);
    setTimeout(() => startCamera(), 100);
  };

  const handleCameraClose = () => {
    stopCamera();
    setIsCameraOpen(false);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreview(null);
    onImageSelected?.(null);
  };

  return (
    <>
      <Box>
        {!preview ? (
          <Paper
            variant="outlined"
            sx={{
              p: 4,
              border: '2px dashed',
              borderColor: 'grey.300',
              borderRadius: 3,
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.6 : 1,
              '&:hover': disabled ? {} : {
                borderColor: 'primary.main',
                bgcolor: 'action.hover',
              },
            }}
            onDrop={disabled ? undefined : handleDrop}
            onDragOver={disabled ? undefined : handleDragOver}
            onClick={disabled ? undefined : () => fileInputRef.current?.click()}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <UploadIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
              <Typography variant="h6" color="text.secondary">
                Kéo thả ảnh vào đây hoặc click để chọn
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hỗ trợ: JPG, PNG, GIF (tối đa {maxSizeMB}MB)
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<ImageIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  disabled={disabled}
                >
                  Chọn ảnh
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CameraIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCameraOpen();
                  }}
                  disabled={disabled}
                >
                  Chụp ảnh
                </Button>
              </Box>
            </Box>
          </Paper>
        ) : (
          <Box sx={{ position: 'relative' }}>
            <Box
              component="img"
              src={preview}
              alt="Preview"
              sx={{
                width: '100%',
                maxHeight: 400,
                objectFit: 'contain',
                borderRadius: 2,
                border: '2px solid',
                borderColor: 'grey.300',
              }}
            />
            <IconButton
              onClick={handleRemove}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'error.main',
                color: 'white',
                '&:hover': { bgcolor: 'error.dark' },
              }}
              aria-label="Xóa ảnh"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept={accept}
          style={{ display: 'none' }}
          disabled={disabled}
        />
      </Box>

      <Dialog open={isCameraOpen} onClose={handleCameraClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Chụp ảnh</Typography>
            <IconButton onClick={handleCameraClose} aria-label="Đóng">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center' }}>
            <Box
              component="video"
              ref={videoRef}
              autoPlay
              playsInline
              muted
              sx={{
                width: '100%',
                maxWidth: 640,
                height: 'auto',
                borderRadius: 2,
                border: '2px solid',
                borderColor: 'grey.300',
              }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCameraClose}>Hủy</Button>
          <Button
            onClick={capturePhoto}
            variant="contained"
            startIcon={<CameraIcon />}
            disabled={!stream}
          >
            Chụp ảnh
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AiImageInput;

