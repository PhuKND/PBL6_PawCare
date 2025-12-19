import React, { useState, useRef, useEffect } from 'react';
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
  Alert
} from '@mui/material';
import { Close as CloseIcon, CameraAlt as CameraIcon } from '@mui/icons-material';

const CameraModal = ({ open, onClose, onCapture }) => {
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
      setCapturedImage(null);
      setResult(null);
      setError(null);
      setIsLoading(false);
    }
    return () => stopCamera();
  }, [open]);

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
        height: { ideal: 480 },
          facingMode: 'environment'
        },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.');
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
          setError('Không thể chụp ảnh từ camera.');
          return;
        }
        const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
        setCapturedImage(file);
        setResult(null);
      },
      'image/jpeg',
      0.9
    );
  };

  const processImage = async () => {
    if (!capturedImage) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      if (onCapture) {
        await onCapture(capturedImage);
        handleClose();
      }
    } catch (err) {
      setError('Lỗi khi xử lý ảnh: ' + (err.message || 'Không xác định'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setResult(null);
    setError(null);
    onClose && onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Chụp ảnh để nhận diện</Typography>
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


        <Box sx={{ textAlign: 'center' }}>
          {!capturedImage ? (
            <Box>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  maxWidth: 640,
                  height: 'auto',
                  borderRadius: 8,
                  border: '2px solid #e0e0e0'
                }}
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </Box>
          ) : (
            <Box>
              <img
                src={URL.createObjectURL(capturedImage)}
                alt="Captured"
                style={{
                  width: '100%',
                  maxWidth: 640,
                  height: 'auto',
                  borderRadius: 8,
                  border: '2px solid #e0e0e0'
                }}
              />
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} color="secondary">
          Hủy
        </Button>

        {!capturedImage ? (
          <Button
            onClick={capturePhoto}
            variant="contained"
            startIcon={<CameraIcon />}
            color="primary"
            disabled={!stream || !!error}
          >
            Chụp ảnh
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button onClick={() => setCapturedImage(null)} color="secondary" disabled={isLoading}>
              Chụp lại
            </Button>
            <Button
              onClick={processImage}
              variant="contained"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : <CameraIcon />}
            >
              {isLoading ? 'Đang xử lý...' : 'Xử lý ảnh'}
            </Button>
          </Box>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CameraModal;
