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

const API_BASE = 'http://127.0.0.1:5000';

const checkApiHealth = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/health`, {
      headers: { Accept: 'application/json' }
    });
    const data = await response.json();
    return data.status === 'healthy' && data.model_loaded;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};


const normalizeApiResult = (data) => {
  const vi = data?.prediction_vi;
  const en = data?.prediction_en || data?.prediction;

  const confNum = typeof data?.confidence === 'number'
    ? data.confidence
    : Number(data?.confidence);

  const classIndex = (data?.class_index ?? data?.classIndex);

  const normalized = {
    prediction_vi: vi ?? null,
    prediction_en: en ?? null,
    class_index: typeof classIndex === 'number' ? classIndex : null,
    prediction: vi || data?.prediction || en || null,
    confidence: Number.isFinite(confNum) ? confNum : null
  };

  return normalized;
};

const CameraModal = ({ open, onClose, onImageCaptured }) => {
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
      const isApiHealthy = await checkApiHealth();
      if (!isApiHealthy) {
        throw new Error('API server không sẵn sàng. Vui lòng kiểm tra kết nối.');
      }

      const formData = new FormData();
      formData.append('image', capturedImage);

      const response = await fetch(`${API_BASE}/api/classify-image`, {
        method: 'POST',
        body: formData
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('JSON parse error:', jsonError);
        throw new Error('API không trả JSON hợp lệ. Vui lòng kiểm tra kết nối server.');
      }

      if (!response.ok) {
        throw new Error(data?.error || `Lỗi server: ${response.status}`);
      }


      
      const normalized = normalizeApiResult(data);

      if (!normalized.prediction || normalized.confidence === null) {
        throw new Error('Dữ liệu trả về không hợp lệ');
      }

      setResult(normalized);
      onImageCaptured && onImageCaptured(normalized);
    } catch (err) {
      console.error('Process image error:', err);
      setError('Lỗi khi xử lý ảnh: ' + err.message);
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

        {result && !error && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body1" component="div">
              <strong>Thiết bị y tế được nhận diện:</strong> {result.prediction}
            </Typography>
            {result.prediction_en && (
              <Typography variant="body2" color="text.secondary">
                (Tiếng Anh: {result.prediction_en})
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">
              Độ tin cậy: <strong>{Number(result.confidence).toFixed(1)}%</strong>
            </Typography>
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
