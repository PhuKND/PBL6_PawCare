import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Paper,
  Divider,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { searchProducts } from '../api/http';
import { insectLabelToVi, insectLabelToSearchKeyword } from '../utils/aiMapping';
import ProductCard from './products/ProductCard';

const SearchResults = ({ searchQuery, searchResults = [] }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(location.search || '');
  const keywordFromUrl = urlParams.get('keyword') || '';
  const pageFromUrl = Number(urlParams.get('page') || 0);
  const sizeFromUrl = Number(urlParams.get('size') || 10);
  
  const aiResult = location.state?.aiResult;
  const imagePreviewUrl = location.state?.imagePreviewUrl;
  const isAiMode = location.state?.isAiMode || false;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(pageFromUrl);
  const [size] = useState(sizeFromUrl);
  const [remoteResults, setRemoteResults] = useState([]);
  
  const [resnetProducts, setResnetProducts] = useState([]);
  const [effnetProducts, setEffnetProducts] = useState([]);
  const [resnetLoading, setResnetLoading] = useState(false);
  const [effnetLoading, setEffnetLoading] = useState(false);
  const [resnetError, setResnetError] = useState('');
  const [effnetError, setEffnetError] = useState('');

  const getSearchQueryString = (query) => {
    if (typeof query === 'string') {
      return query.trim();
    }
    if (query && typeof query === 'object' && query.prediction) {
      return String(query.prediction).trim();
    }
    return '';
  };

  const searchQueryString = getSearchQueryString(keywordFromUrl || searchQuery);
  const canSearch = useMemo(() => Boolean(searchQueryString) || isAiMode, [searchQueryString, isAiMode]);

  useEffect(() => {
    if (isAiMode && aiResult) {
      const resnetLabel = aiResult.resnet18?.label || '';
      const effnetLabel = aiResult.efficientnetb3?.label || '';
      const resnetKeyword = insectLabelToSearchKeyword(resnetLabel);
      const effnetKeyword = insectLabelToSearchKeyword(effnetLabel);

      setResnetLoading(true);
      setEffnetLoading(true);
      setResnetError('');
      setEffnetError('');

      const fetchProducts = async () => {
        if (resnetKeyword) {
          try {
            const { list: resnetList } = await searchProducts({ keyword: resnetKeyword, page: 0, size: 20 });
            setResnetProducts(resnetList || []);
          } catch (e) {
            setResnetError(e?.response?.data?.message || 'Không thể tải sản phẩm cho ResNet18');
          } finally {
            setResnetLoading(false);
          }
        } else {
          setResnetLoading(false);
        }

        if (effnetKeyword) {
          try {
            const { list: effnetList } = await searchProducts({ keyword: effnetKeyword, page: 0, size: 20 });
            setEffnetProducts(effnetList || []);
          } catch (e) {
            setEffnetError(e?.response?.data?.message || 'Không thể tải sản phẩm cho EfficientNetB3');
          } finally {
            setEffnetLoading(false);
          }
        } else {
          setEffnetLoading(false);
        }
      };

      fetchProducts();
      return;
    }

    if (!canSearch || isAiMode) {
      setRemoteResults([]);
      return;
    }

    let isActive = true;
    setLoading(true);
    setError('');
    (async () => {
      try {
        const { list } = await searchProducts({ keyword: searchQueryString, page, size });
        if (isActive) {
          setRemoteResults(list);
        }
      } catch (e) {
        if (isActive) {
          setError(e?.response?.data?.message || 'Không thể tải kết quả tìm kiếm');
          setRemoteResults([]);
        }
      } finally {
        if (isActive) setLoading(false);
      }
    })();
    return () => {
      isActive = false;
    };
  }, [canSearch, searchQueryString, page, size, isAiMode, aiResult]);

  useEffect(() => {
    if (!searchQueryString || isAiMode) return;
    const params = new URLSearchParams(location.search || '');
    params.set('keyword', searchQueryString);
    params.set('page', String(page));
    params.set('size', String(size));
    const next = `${location.pathname}?${params.toString()}`;
    if (next !== `${location.pathname}${location.search}`) {
      navigate(next, { replace: true });
    }
  }, [page, size, searchQueryString, isAiMode]);

  if (isAiMode && aiResult) {
    const resnetLabelVi = insectLabelToVi(aiResult.resnet18?.label);
    const effnetLabelVi = insectLabelToVi(aiResult.efficientnetb3?.label);
    const resnetConfidence = aiResult.resnet18?.confidence || 0;
    const effnetConfidence = aiResult.efficientnetb3?.confidence || 0;

    return (
      <Box sx={{ py: 4, bgcolor: 'grey.50', minHeight: '60vh' }}>
        <Container maxWidth="lg">
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <SearchIcon color="primary" />
              <Typography variant="h4" component="h1">
                Kết quả nhận diện côn trùng
              </Typography>
            </Box>
            {imagePreviewUrl && (
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <img
                  src={imagePreviewUrl}
                  alt="Ảnh đã tải lên"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '400px',
                    borderRadius: '8px',
                    border: '2px solid #e0e0e0'
                  }}
                />
              </Box>
            )}
            <Divider sx={{ my: 2 }} />
          </Paper>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  ResNet18
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" color="primary.main" gutterBottom>
                    {resnetLabelVi}
                  </Typography>
                  <Chip
                    label={`Độ tin cậy: ${resnetConfidence.toFixed(2)}%`}
                    color="primary"
                    variant="outlined"
                    sx={{ mt: 1 }}
                  />
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                  Sản phẩm đề xuất
                </Typography>
                {resnetLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : resnetError ? (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {resnetError}
                  </Alert>
                ) : resnetProducts.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    Không tìm thấy sản phẩm nào
                  </Typography>
                ) : (
                  <Grid container spacing={2}>
                    {resnetProducts.map((product) => (
                      <Grid item xs={12} sm={6} key={product.id}>
                        <ProductCard product={product} />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  EfficientNetB3
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" color="primary.main" gutterBottom>
                    {effnetLabelVi}
                  </Typography>
                  <Chip
                    label={`Độ tin cậy: ${effnetConfidence.toFixed(2)}%`}
                    color="secondary"
                    variant="outlined"
                    sx={{ mt: 1 }}
                  />
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                  Sản phẩm đề xuất
                </Typography>
                {effnetLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : effnetError ? (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {effnetError}
                  </Alert>
                ) : effnetProducts.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    Không tìm thấy sản phẩm nào
                  </Typography>
                ) : (
                  <Grid container spacing={2}>
                    {effnetProducts.map((product) => (
                      <Grid item xs={12} sm={6} key={product.id}>
                        <ProductCard product={product} />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  }

  if (!searchQueryString) {
    return null;
  }

  const results = remoteResults.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.originPrice,
    imageUrl: p.imageUrl,
    category: p.categoryName || '',
    inStock: (p.quantity ?? 0) > 0
  }));

  return (
    <Box sx={{ py: 4, bgcolor: 'grey.50', minHeight: '60vh' }}>
      <Container maxWidth="lg">
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <SearchIcon color="primary" />
            <Typography variant="h4" component="h1">
              Kết quả tìm kiếm cho "{searchQueryString}"
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            {loading ? 'Đang tìm kiếm...' : `Tìm thấy ${results.length} sản phẩm thú cưng phù hợp`}
          </Typography>
          <Divider sx={{ my: 2 }} />
          {error && (
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
        </Paper>

        <Grid container spacing={3}>
          {results.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card 
                onClick={() => navigate(`/product/${product.id}`)}
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  overflow: 'hidden',
                  transition: 'all .3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: 10
                  }
                }}
              >
                <Box
                  sx={{
                    height: 200,
                    bgcolor: 'grey.200',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Typography variant="h6" color="text.secondary">
                      Hình ảnh sản phẩm
                    </Typography>
                  )}
                  {!product.inStock && (
                    <Chip
                      label="Hết hàng"
                      color="error"
                      size="small"
                      sx={{ position: 'absolute', top: 8, right: 8 }}
                    />
                  )}
                </Box>
                
                <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {product.name}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ mb: 2, flexGrow: 1 }}
                  >
                    {product.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                      {typeof product.price === 'number' ? product.price.toLocaleString('vi-VN') + ' VNĐ' : product.price}
                    </Typography>
                    <Chip 
                      label={product.category} 
                      size="small" 
                      variant="outlined"
                    />
                  </Box>
                  
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/product/${product.id}`);
                    }}
                    sx={{ mt: 'auto' }}
                  >
                    Chọn mua
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {results.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Không tìm thấy sản phẩm nào
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Hãy thử tìm kiếm với từ khóa khác
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default SearchResults;
