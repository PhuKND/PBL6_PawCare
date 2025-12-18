import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

import {
  Box,
  Container,
  Grid,
  Typography,
  Breadcrumbs,
  Link as MUILink,
  Chip,
  Rating,
  Button,
  Paper,
  Divider,
  ImageList,
  ImageListItem,
  TextField,
  useTheme,
  useMediaQuery,
  Alert,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Avatar,
  IconButton,
  Card,
  CardContent,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import {
  ThumbUp as ThumbUpIcon,
  Person as PersonIcon,
  QuestionAnswer as QuestionAnswerIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';

import { getProductDetail } from '../api/http';
import http from '../api/http';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [questionAuthDialogOpen, setQuestionAuthDialogOpen] = useState(false);
  const [answerText, setAnswerText] = useState({});
  const [submittingAnswer, setSubmittingAnswer] = useState({});

  const sectionList = useMemo(
    () => [
      { key: 'desc', label: 'Mô tả sản phẩm' },
      { key: 'ingredients', label: 'Thành phần' },
      { key: 'benefit', label: 'Công dụng' },
      { key: 'usage', label: 'Cách dùng' },
      { key: 'sideEffect', label: 'Tác dụng phụ' },
      { key: 'note', label: 'Lưu ý' },
      { key: 'preserve', label: 'Bảo quản' },
      { key: 'questions', label: 'Câu hỏi' },
    ],
    []
  );

  const [activeSection, setActiveSection] = useState('desc');
  const sectionsRef = useRef({});

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        if (!id) throw new Error('missing id');
        setLoading(true);
        setError('');

        let data = null;

        try {
          const response = await getProductDetail(id);
          data = response?.data || response || null;
        } catch (primaryErr) {
          try {
            const res = await fetch(`http://127.0.0.1:8080/api/v1/products/detail/${id}`);
            const json = await res.json();
            data = json?.data || null;
          } catch (fallbackErr) {
            if (mounted) {
              setError(
                primaryErr?.response?.data?.message ||
                  primaryErr?.message ||
                  'Không thể tải thông tin sản phẩm'
              );
            }
          }
        }

        if (mounted) setProduct(data);
      } catch (outerErr) {
        if (mounted) {
          setError(
            outerErr?.response?.data?.message ||
              outerErr?.message ||
              'Không thể tải thông tin sản phẩm'
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  const images = useMemo(() => {
    if (!product) {
      return [
        'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1200&h=900&fit=crop',
      ];
    }
    const list = [];
    if (product.imageUrl) list.push(product.imageUrl);
    if (Array.isArray(product.images)) list.push(...product.images.filter(Boolean));
    return list.length
      ? list
      : ['https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1200&h=900&fit=crop'];
  }, [product]);

  const formatCurrency = useCallback(
    (price) =>
      new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: product?.currency || 'VND',
      }).format(Number(price || 0)),
    [product?.currency]
  );

  const formatDateTime = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString('vi-VN');
  };

  const inStock = (product?.quantity ?? 0) > 0;
  const rx = product?.precription ?? product?.prescription ?? null;

  const handleScrollTo = (key) => {
    const el = sectionsRef.current[key];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const requireAuth = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setAuthDialogOpen(true);
      return false;
    }
    return true;
  };

  const handleAddToCart = async () => {
    if (!product || !id || !inStock) return;
    if (!requireAuth()) return;

    try {
      setAddingToCart(true);
      const response = await http.post('/carts/items', { productId: id, quantity: qty });
      const data = response?.data?.data || response?.data || response;
      if (data) {
        setSnackbar({ open: true, message: 'Đã thêm sản phẩm vào giỏ hàng!', severity: 'success' });
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product || !id || !inStock) return;
    if (!requireAuth()) return;

    try {
      setAddingToCart(true);
      const response = await http.post('/carts/items', { productId: id, quantity: qty });
      const data = response?.data?.data || response?.data || response;
      if (data) navigate('/cart');
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Không thể thực hiện mua ngay. Vui lòng thử lại.';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleCloseSnackbar = (_event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar((s) => ({ ...s, open: false }));
  };

  const handleSubmitQuestion = async () => {
    if (!questionText.trim()) {
      setSnackbar({ open: true, message: 'Vui lòng nhập câu hỏi', severity: 'warning' });
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setQuestionAuthDialogOpen(true);
      return;
    }

    try {
      setSubmittingQuestion(true);
      const response = await http.post(`/products/${id}/questions`, {
        question: questionText.trim(),
      });

      const data = response?.data?.data || response?.data || response;
      if (data) {
        const newQuestion = {
          questionId: data.questionId || Date.now().toString(),
          question: questionText.trim(),
          createdDate: data.createdDate || new Date().toISOString(),
          likesCount: data.likesCount || 0,
          userName: data.userName || null,
          avatarUrl: data.avatarUrl || null,
          answers: data.answers || [],
        };

        setProduct((prev) => ({
          ...prev,
          questions: Array.isArray(prev?.questions) ? [newQuestion, ...prev.questions] : [newQuestion],
        }));

        setQuestionText('');
        setSnackbar({ open: true, message: 'Đã đặt câu hỏi thành công!', severity: 'success' });
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Không thể đặt câu hỏi. Vui lòng thử lại.';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleSubmitAnswer = async (questionId) => {
    const text = (answerText[questionId] || '').trim();
    if (!text) {
      setSnackbar({ open: true, message: 'Vui lòng nhập câu trả lời', severity: 'warning' });
      return;
    }
    if (!requireAuth()) return;
    try {
      setSubmittingAnswer((prev) => ({ ...prev, [questionId]: true }));
      const response = await http.post(`/products/${id}/questions/${questionId}/answers`, {
        answer: text,
      });
      const data = response?.data?.data || response?.data || response;
      if (data) {
        const newAnswer = {
          answerId: data.answerId || data.id || Date.now().toString(),
          answer: data.answer || text,
          content: data.answer || text,
          createdDate: data.createdDate || new Date().toISOString(),
          likesCount: data.likesCount || 0,
          userName: data.userName || null,
          avatarUrl: data.avatarUrl || null,
        };

        setProduct((prev) => {
          const updatedQuestions = (prev?.questions || []).map((q) => {
            if ((q.questionId || q.id) === questionId) {
              const answers = Array.isArray(q.answers) ? q.answers : [];
              return { ...q, answers: [newAnswer, ...answers] };
            }
            return q;
          });
          return { ...prev, questions: updatedQuestions };
        });
        setAnswerText((prev) => ({ ...prev, [questionId]: '' }));
        setSnackbar({ open: true, message: 'Đã gửi câu trả lời', severity: 'success' });
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Không thể gửi câu trả lời. Vui lòng thử lại.';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setSubmittingAnswer((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  useEffect(() => {
    if (!product) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { root: null, rootMargin: '-40% 0px -40% 0px', threshold: 0 }
    );

    sectionList.forEach((s) => {
      const el = sectionsRef.current[s.key];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [product]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 4, bgcolor: 'grey.50', minHeight: '60vh' }}>
        <Container maxWidth="lg">
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button variant="contained" onClick={() => navigate('/')}>
            Về trang chủ
          </Button>
        </Container>
      </Box>
    );
  }

  if (!product) {
    return (
      <Box sx={{ py: 4, bgcolor: 'grey.50', minHeight: '60vh' }}>
        <Container maxWidth="lg">
          <Alert severity="warning">Không tìm thấy sản phẩm</Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', py: 4, minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Breadcrumbs sx={{ mb: 2 }} aria-label="breadcrumb">
          <MUILink underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
            Trang chủ
          </MUILink>
          <MUILink
            underline="hover"
            color="inherit"
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate('/category/' + (product?.category || ''))}
          >
            {product?.category || 'Danh mục'}
          </MUILink>
          <Typography color="text.primary">{product?.name || 'Chi tiết sản phẩm'}</Typography>
        </Breadcrumbs>

        <Paper
          elevation={1}
          sx={{
            borderRadius: 3,
            p: { xs: 2, md: 3 },
            mb: 4,
            bgcolor: 'background.paper',
          }}
        >
          <Grid container spacing={4}>
            <Grid item xs={12} md={5}>
              <Box>
                <Box
                  sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                    mb: 2,
                    bgcolor: 'grey.100',
                  }}
                >
                  <motion.img
                    key={images[activeImg]}
                    src={images[activeImg]}
                    alt={product?.name}
                    style={{ width: '100%', height: 440, objectFit: 'cover', display: 'block' }}
                    initial={{ opacity: 0.6, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35 }}
                  />
                </Box>

                {images.length > 1 && (
                  <ImageList cols={4} gap={10} sx={{ m: 0 }}>
                    {images.slice(0, 8).map((src, i) => (
                      <ImageListItem
                        key={i}
                        onClick={() => setActiveImg(i)}
                        sx={{
                          cursor: 'pointer',
                          '& img': {
                            height: 84,
                            width: '100%',
                            objectFit: 'cover',
                            borderRadius: 1.25,
                            outline: i === activeImg ? '2px solid' : '1px solid',
                            outlineColor: i === activeImg ? 'primary.main' : 'divider',
                            filter: i === activeImg ? 'none' : 'saturate(0.9)',
                          },
                        }}
                      >
                        <img src={src} alt={`thumb-${i}`} loading="lazy" />
                      </ImageListItem>
                    ))}
                  </ImageList>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={7}>
              <Stack direction="row" flexWrap="wrap" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                {product?.manufacturer && (
                  <Chip size="small" color="primary" variant="outlined" label={product.manufacturer} sx={{ fontWeight: 500 }} />
                )}
                <Chip size="small" color="success" variant="outlined" label="Chính hãng" sx={{ fontWeight: 500 }} />
              </Stack>

              <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 800, lineHeight: 1.25, mb: 1 }}>
                {product?.name}
              </Typography>

              <Stack direction="row" alignItems="center" flexWrap="wrap" spacing={1.5} sx={{ mb: 2 }}>
                <Rating value={Number(product?.ratingAvg) || 0} readOnly precision={0.1} size="small" />
                <Typography variant="body2" color="text.secondary">
                  {product?.ratingAvg ? `${product.ratingAvg} sao trên 5` : 'Chưa có đánh giá'}
                </Typography>
                {rx !== null && (
                  <Chip
                    size="small"
                    label={rx ? 'Thuốc kê đơn (Rx)' : 'Không kê đơn (OTC)'}
                    color={rx ? 'warning' : 'success'}
                    sx={{ fontWeight: 500 }}
                  />
                )}
                <Chip size="small" label={inStock ? 'Còn hàng' : 'Hết hàng'} color={inStock ? 'success' : 'default'} sx={{ fontWeight: 500 }} />
                {product?.soldQuantity > 0 && <Chip size="small" variant="outlined" label={`Đã bán ${product.soldQuantity}`} />}
              </Stack>

              <Stack direction="row" alignItems="flex-end" flexWrap="wrap" spacing={1.5} sx={{ mb: 2 }}>
                <Typography variant={isMobile ? 'h4' : 'h3'} sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1.2 }}>
                  {product?.discountPrice ? formatCurrency(product.discountPrice) : formatCurrency(product?.originPrice)}
                </Typography>
                {product?.discountPercen ? (
                  <Chip
                    label={`-${product.discountPercen}%`}
                    color="error"
                    size="small"
                    sx={{ fontWeight: 700, fontSize: 14 }}
                  />
                ) : null}
                {product?.originPrice && product?.discountPrice ? (
                  <Typography variant="body1" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                    {formatCurrency(product.originPrice)}
                  </Typography>
                ) : null}
              </Stack>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                {product?.description ? product.description : 'Sản phẩm chăm sóc sức khỏe chất lượng cao từ MedStore.'}
              </Typography>

              <Grid container spacing={2} alignItems="center" sx={{ mb: 3, flexWrap: 'wrap' }}>
                <Grid item>
                  <TextField
                    type="number"
                    size="small"
                    label="Số lượng"
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, Number(e.target.value || 1)))}
                    inputProps={{ min: 1, style: { width: 100 } }}
                  />
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    size="large"
                    disabled={!inStock || addingToCart}
                    onClick={handleAddToCart}
                    startIcon={addingToCart ? <CircularProgress size={20} color="inherit" /> : <ShoppingCartIcon />}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 700,
                      px: 3,
                    }}
                  >
                    {addingToCart ? 'Đang thêm...' : 'Thêm vào giỏ'}
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    size="large"
                    disabled={!inStock || addingToCart}
                    onClick={handleBuyNow}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 3 }}
                  >
                    Mua ngay
                  </Button>
                </Grid>
              </Grid>

              <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                  Thông tin sản phẩm
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Tên sản phẩm
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      {product?.name || '—'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Danh mục
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      {product?.category || 'Khác'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Thương hiệu / Nhà sản xuất
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      {product?.manufacturer || 'Đang cập nhật'}
                    </Typography>
                    {product?.manufactureId && (
                      <Typography variant="caption" color="text.secondary">
                        ID: {product.manufactureId}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Ngày sản phẩm
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      {product?.productDate || '—'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Kê đơn
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      {rx === null ? '—' : rx ? 'Thuốc kê đơn (Rx)' : 'Không kê đơn (OTC)'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Tồn kho
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      {product?.quantity ?? '—'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Đã bán
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      {product?.soldQuantity ?? 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Tiền tệ
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      {product?.currency || 'VND'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={4}>
          {/* Sidebar mục lục */}
          <Grid item xs={12} md={3} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Paper variant="outlined" sx={{ borderRadius: 2, position: 'sticky', top: 80, p: 0, overflow: 'hidden' }}>
              <List disablePadding>
                {sectionList.map((sec) => (
                  <ListItemButton
                    key={sec.key}
                    onClick={() => handleScrollTo(sec.key)}
                    selected={activeSection === sec.key}
                    sx={{
                      alignItems: 'flex-start',
                      py: 1.5,
                      px: 2,
                      borderLeft: '4px solid',
                      borderColor: activeSection === sec.key ? 'primary.main' : 'transparent',
                      '&.Mui-selected': { bgcolor: 'action.hover' },
                      '&:not(:last-of-type)': { borderBottom: '1px solid', borderBottomColor: 'divider' },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" sx={{ fontWeight: activeSection === sec.key ? 800 : 500, lineHeight: 1.4 }}>
                          {sec.label}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Nội dung các section */}
          <Grid item xs={12} md={9}>
            <SectionCard title="Mô tả sản phẩm" refEl={(el) => (sectionsRef.current['desc'] = el)} sectionId="desc">
              <Typography variant="body1" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                {product?.description || 'Đang cập nhật nội dung mô tả sản phẩm.'}
              </Typography>
            </SectionCard>

            <SectionCard title="Thành phần" refEl={(el) => (sectionsRef.current['ingredients'] = el)} sectionId="ingredients">
              {Array.isArray(product?.ingredients) && product.ingredients.length > 0 ? (
                <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', mb: 2 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: 'grey.100', '& th': { fontWeight: 700, whiteSpace: 'nowrap' } }}>
                      <TableRow>
                        <TableCell>Thông tin thành phần</TableCell>
                        <TableCell>Hàm lượng</TableCell>
                        <TableCell>Đơn vị</TableCell>
                        <TableCell>Mô tả</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {product.ingredients.map((ing, idx) => (
                        <TableRow key={idx}>
                          <TableCell sx={{ fontWeight: 700 }}>{ing?.name || '—'}</TableCell>
                          <TableCell>{ing?.amount ?? '—'}</TableCell>
                          <TableCell>{ing?.unit || '—'}</TableCell>
                          <TableCell sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{ing?.description || '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              ) : (
                <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                  Đang cập nhật thành phần.
                </Typography>
              )}
            </SectionCard>

            <SectionCard title="Công dụng" refEl={(el) => (sectionsRef.current['benefit'] = el)} sectionId="benefit">
              <Typography variant="body1" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                {product?.benefit || 'Đang cập nhật công dụng sản phẩm.'}
              </Typography>
            </SectionCard>

            <SectionCard title="Cách dùng" refEl={(el) => (sectionsRef.current['usage'] = el)} sectionId="usage">
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Cách dùng
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap', mb: 2 }}>
                {product?.usage || 'Đang cập nhật hướng dẫn sử dụng.'}
              </Typography>
            </SectionCard>

            <SectionCard title="Tác dụng phụ" refEl={(el) => (sectionsRef.current['sideEffect'] = el)} sectionId="sideEffect">
              <Typography variant="body1" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                {product?.sideEffect || 'Chưa có thông tin về tác dụng phụ của sản phẩm.'}
              </Typography>
            </SectionCard>

            <SectionCard refEl={(el) => (sectionsRef.current['note'] = el)} sectionId="note">
              <Paper
                variant="outlined"
                sx={{ borderRadius: 2, bgcolor: 'warning.50', borderColor: 'warning.light', p: 2, mb: 2 }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'warning.dark', mb: 1 }}>
                  Lưu ý
                </Typography>
                {product?.note && (
                  <Typography variant="body1" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap', mb: 2 }}>
                    {product.note}
                  </Typography>
                )}
              </Paper>
            </SectionCard>

            <SectionCard title="Bảo quản" refEl={(el) => (sectionsRef.current['preserve'] = el)} sectionId="preserve" noDividerAtEnd>
              <Typography variant="body1" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                {product?.preserve || 'Bảo quản nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp từ mặt trời.'}
              </Typography>
            </SectionCard>

            <SectionCard title="Câu hỏi thường gặp của sản phẩm" refEl={(el) => (sectionsRef.current['frequentlies'] = el)} sectionId="frequentlies">
              {Array.isArray(product?.frequentlies) && product.frequentlies.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {product.frequentlies.map((fq) => (
                    <Paper
                      key={fq.id}
                      variant="outlined"
                      sx={{ borderRadius: 2, p: 2, bgcolor: 'grey.50', borderColor: 'primary.light' }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: 'primary.main' }}>
                        Q: {fq.question}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        A: {fq.answer}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {fq.createdDate || '—'}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                  Chưa có hỏi đáp nhanh cho sản phẩm này.
                </Typography>
              )}
            </SectionCard>

            <SectionCard title="Câu hỏi thường gặp" refEl={(el) => (sectionsRef.current['questions'] = el)} sectionId="questions" noDividerAtEnd>
              {/* Form đặt câu hỏi */}
              <Paper
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  p: 3,
                  mb: 3,
                  bgcolor: 'background.paper',
                  border: '2px solid',
                  borderColor: 'primary.light',
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
                  Đặt câu hỏi về sản phẩm
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Nhập câu hỏi của bạn về sản phẩm này..."
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                    },
                  }}
                  disabled={submittingQuestion}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setQuestionText('')}
                    disabled={submittingQuestion || !questionText.trim()}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 3 }}
                  >
                    Hủy
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSubmitQuestion}
                    disabled={submittingQuestion || !questionText.trim()}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 700,
                      px: 4,
                    }}
                  >
                    {submittingQuestion ? (
                      <>
                        <CircularProgress size={16} sx={{ mr: 1 }} color="inherit" />
                        Đang gửi...
                      </>
                    ) : (
                      'Đặt câu hỏi'
                    )}
                  </Button>
                </Box>
              </Paper>

              {/* Danh sách câu hỏi */}
              {Array.isArray(product?.questions) && product.questions.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {product.questions.map((q, i) => {
                    const questionText = typeof q === 'string' ? q : q?.question || '';
                    const questionId = q?.questionId || i;
                    const createdDate = q?.createdDate || '';
                    const likesCount = q?.likesCount || 0;
                    const userName = q?.userName || 'Người dùng';
                    const avatarUrl = q?.avatarUrl || null;
                    const answers = Array.isArray(q?.answers) ? q.answers : [];

                    return (
                      <Card
                        key={questionId}
                        variant="outlined"
                        sx={{ borderRadius: 2, overflow: 'hidden', '&:hover': { boxShadow: 2, transition: 'all 0.2s ease-in-out' } }}
                      >
                        <CardContent sx={{ p: 2.5 }}>
                          <Box sx={{ display: 'flex', gap: 2, mb: 1.5 }}>
                            <Avatar src={avatarUrl} sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                              {!avatarUrl && <PersonIcon />}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                  {userName}
                                </Typography>
                                {createdDate && (
                                  <Typography variant="caption" color="text.secondary">
                                    •{' '}
                                    {new Date(createdDate).toLocaleDateString('vi-VN', {
                                      year: 'numeric',
                                      month: '2-digit',
                                      day: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </Typography>
                                )}
                              </Box>
                              <Typography variant="body1" sx={{ lineHeight: 1.7, color: 'text.primary', mb: 1.5 }}>
                                {questionText}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <IconButton size="small" sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                                  <ThumbUpIcon fontSize="small" />
                                  <Typography variant="caption" sx={{ ml: 0.5 }}>
                                    {likesCount > 0 ? likesCount : ''}
                                  </Typography>
                                </IconButton>
                                {answers.length > 0 && (
                                  <Chip
                                    icon={<QuestionAnswerIcon />}
                                    label={`${answers.length} trả lời`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ height: 24 }}
                                  />
                                )}
                              </Box>
                            </Box>
                          </Box>

                          {answers.length > 0 && (
                            <Box sx={{ ml: 6, mt: 2, pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
                              {answers.map((answer, ansIdx) => (
                                <Box key={ansIdx} sx={{ mb: 2 }}>
                                  <Box sx={{ display: 'flex', gap: 1.5, mb: 0.5 }}>
                                    <Avatar
                                      src={answer.avatarUrl || null}
                                      sx={{ width: 32, height: 32, bgcolor: 'success.main' }}
                                    >
                                      {!answer?.avatarUrl && <PersonIcon fontSize="small" />}
                                    </Avatar>
                                    <Box>
                                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                        {answer.userName || 'Người dùng khác'}
                                      </Typography>
                                      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                                        {typeof answer === 'string' ? answer : answer.content || answer.answer || ''}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Box>
                              ))}
                            </Box>
                          )}
                          <Box sx={{ ml: 6, mt: 2 }}>
                            <TextField
                              fullWidth
                              multiline
                              minRows={2}
                              placeholder="Nhập câu trả lời của bạn..."
                              value={answerText[questionId] || ''}
                              onChange={(e) =>
                                setAnswerText((prev) => ({ ...prev, [questionId]: e.target.value }))
                              }
                              size="small"
                              sx={{
                                mb: 1,
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  bgcolor: 'background.paper',
                                },
                              }}
                              disabled={Boolean(submittingAnswer[questionId])}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleSubmitAnswer(questionId)}
                                disabled={Boolean(submittingAnswer[questionId])}
                                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                              >
                                {submittingAnswer[questionId] ? 'Đang gửi...' : 'Gửi trả lời'}
                              </Button>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              ) : (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2, bgcolor: 'grey.50' }}>
                  <QuestionAnswerIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Chưa có câu hỏi nào. Hãy là người đầu tiên đặt câu hỏi về sản phẩm này!
                  </Typography>
                </Paper>
              )}
            </SectionCard>

            <SectionCard title="Đánh giá" refEl={(el) => (sectionsRef.current['reviews'] = el)} sectionId="reviews" noDividerAtEnd>
              {Array.isArray(product?.reviews) && product.reviews.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {product.reviews.map((rv, idx) => (
                    <Paper
                      key={idx}
                      variant="outlined"
                      sx={{ borderRadius: 2, p: 2, display: 'flex', gap: 2, alignItems: 'flex-start', bgcolor: 'grey.50' }}
                    >
                      <Avatar
                        variant="rounded"
                        src={rv.imageUrl}
                        alt="review"
                        sx={{ width: 72, height: 72, borderRadius: 1, flexShrink: 0 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Avatar src={rv.avatarUrl} sx={{ width: 32, height: 32 }}>
                            {!rv.avatarUrl && <PersonIcon fontSize="small" />}
                          </Avatar>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {rv.username || 'Người dùng'}
                          </Typography>
                          <Chip label={`${rv.rating} ★`} size="small" color="warning" />
                        </Box>
                        <Typography variant="body2" sx={{ lineHeight: 1.6 }}>{rv.comment}</Typography>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                  Chưa có đánh giá cho sản phẩm này.
                </Typography>
              )}
            </SectionCard>
          </Grid>
        </Grid>
      </Container>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{ '& .MuiSnackbarContent-root': { borderRadius: 2 } }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: '100%',
            borderRadius: 2,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Auth dialog: mua/giỏ hàng */}
      <Dialog open={authDialogOpen} onClose={() => setAuthDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Yêu cầu đăng nhập</DialogTitle>
        <DialogContent dividers>
          <Typography>Vui lòng đăng nhập trước khi mua hoặc thêm sản phẩm vào giỏ hàng.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAuthDialogOpen(false)}>Để sau</Button>
          <Button
            variant="contained"
            onClick={() => {
              setAuthDialogOpen(false);
              const redirect = encodeURIComponent(location.pathname + location.search);
              navigate(`/login?redirect=${redirect}`);
            }}
          >
            Đăng nhập
          </Button>
        </DialogActions>
      </Dialog>

      {/* Auth dialog: hỏi đáp */}
      <Dialog open={questionAuthDialogOpen} onClose={() => setQuestionAuthDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: 'primary.main' }}>Yêu cầu đăng nhập</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1">Vui lòng đăng nhập trước khi đặt câu hỏi về sản phẩm.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuestionAuthDialogOpen(false)} sx={{ textTransform: 'none' }}>
            Để sau
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setQuestionAuthDialogOpen(false);
              const redirect = encodeURIComponent(location.pathname + location.search);
              navigate(`/login?redirect=${redirect}`);
            }}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Đăng nhập
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function SectionCard({ title, children, refEl, sectionId, noDividerAtEnd }) {
  return (
    <Paper
      variant="outlined"
      ref={refEl}
      id={sectionId}
      sx={{
        borderRadius: 2,
        p: { xs: 2, md: 3 },
        mb: 3,
        scrollMarginTop: '80px',
      }}
    >
      {title && (
        <>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.3, mb: 2 }}>
            {title}
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </>
      )}
      {children}
      {!noDividerAtEnd && <Divider sx={{ mt: 3, opacity: 0.4 }} />}
    </Paper>
  );
}
