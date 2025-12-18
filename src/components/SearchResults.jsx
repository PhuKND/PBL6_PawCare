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
  Divider
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { searchProducts } from '../api/http';

const SearchResults = ({ searchQuery, searchResults = [] }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(location.search || '');
  const keywordFromUrl = urlParams.get('keyword') || '';
  const pageFromUrl = Number(urlParams.get('page') || 0);
  const sizeFromUrl = Number(urlParams.get('size') || 10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(pageFromUrl);
  const [size] = useState(sizeFromUrl);
  const [remoteResults, setRemoteResults] = useState([]);
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

  const canSearch = useMemo(() => Boolean(searchQueryString), [searchQueryString]);

  useEffect(() => {
    if (!canSearch) {
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
  }, [canSearch, searchQueryString, page, size]);


  useEffect(() => {
    if (!searchQueryString) return;
    const params = new URLSearchParams(location.search || '');
    params.set('keyword', searchQueryString);
    params.set('page', String(page));
    params.set('size', String(size));
    const next = `${location.pathname}?${params.toString()}`;
    if (next !== `${location.pathname}${location.search}`) {
      navigate(next, { replace: true });
    }

  }, [page, size, searchQueryString]);
  
  if (!searchQueryString) {
    return null;
  }

  // const getMedicalEquipmentInfo = (equipmentName) => {
  //   const equipmentMap = {
  //     'blood pressure monitor': {
  //       name: 'Máy đo huyết áp',
  //       category: 'Thiết bị đo lường',
  //       description: 'Thiết bị đo huyết áp chính xác, dễ sử dụng'
  //     },
  //     'cotton balls': {
  //       name: 'Bông gòn y tế',
  //       category: 'Vật tư y tế',
  //       description: 'Bông gòn y tế chất lượng cao, vô trùng'
  //     },
  //     'infrared thermometer': {
  //       name: 'Nhiệt kế hồng ngoại',
  //       category: 'Thiết bị đo lường',
  //       description: 'Nhiệt kế hồng ngoại không tiếp xúc, an toàn'
  //     },
  //     'medical gloves': {
  //       name: 'Găng tay y tế',
  //       category: 'Vật tư y tế',
  //       description: 'Găng tay y tế cao su, đảm bảo vệ sinh'
  //     },
  //     'medical mask': {
  //       name: 'Khẩu trang y tế',
  //       category: 'Vật tư y tế',
  //       description: 'Khẩu trang y tế 3 lớp, bảo vệ hiệu quả'
  //     },
  //     'medical tape': {
  //       name: 'Băng dính y tế',
  //       category: 'Vật tư y tế',
  //       description: 'Băng dính y tế không gây kích ứng da'
  //     },
  //     'medical tweezers': {
  //       name: 'Kẹp y tế',
  //       category: 'Dụng cụ y tế',
  //       description: 'Kẹp y tế inox, bền bỉ và dễ vệ sinh'
  //     },
  //     'medicine cup': {
  //       name: 'Cốc uống thuốc',
  //       category: 'Dụng cụ y tế',
  //       description: 'Cốc uống thuốc có vạch chia, dễ đo liều'
  //     },
  //     'mercury thermometer': {
  //       name: 'Nhiệt kế thủy ngân',
  //       category: 'Thiết bị đo lường',
  //       description: 'Nhiệt kế thủy ngân truyền thống, chính xác'
  //     },
  //     'nebulizer mask': {
  //       name: 'Mặt nạ xông mũi',
  //       category: 'Thiết bị điều trị',
  //       description: 'Mặt nạ xông mũi cho máy xông khí dung'
  //     },
  //     'pulse oximeter': {
  //       name: 'Máy đo nồng độ oxy',
  //       category: 'Thiết bị đo lường',
  //       description: 'Máy đo nồng độ oxy trong máu, dễ sử dụng'
  //     },
  //     'reflex hammer': {
  //       name: 'Búa phản xạ',
  //       category: 'Dụng cụ y tế',
  //       description: 'Búa phản xạ thần kinh, chuyên nghiệp'
  //     },
  //     'stethoscope': {
  //       name: 'Ống nghe y tế',
  //       category: 'Dụng cụ y tế',
  //       description: 'Ống nghe y tế chất lượng cao, âm thanh rõ ràng'
  //     },
  //     'surgical scissors': {
  //       name: 'Kéo phẫu thuật',
  //       category: 'Dụng cụ y tế',
  //       description: 'Kéo phẫu thuật inox, sắc bén và chính xác'
  //     }
  //   };
    
  //   return equipmentMap[equipmentName] || {
  //     name: searchQuery,
  //     category: 'Thiết bị y tế',
  //     description: 'Thiết bị y tế chất lượng cao'
  //   };
  // };

  const getMockResults = () => {
    const equipmentInfo = getMedicalEquipmentInfo(searchQueryString);
    return [
      {
        id: 1,
        name: `${equipmentInfo.name} - Cao cấp`,
        price: '299,000 VNĐ',
        image: '/api/placeholder/300/200',
        category: equipmentInfo.category,
        description: equipmentInfo.description + ' - Phiên bản cao cấp',
        inStock: true
      },
      {
        id: 2,
        name: `${equipmentInfo.name} - Tiêu chuẩn`,
        price: '199,000 VNĐ',
        image: '/api/placeholder/300/200',
        category: equipmentInfo.category,
        description: equipmentInfo.description + ' - Phiên bản tiêu chuẩn',
        inStock: true
      },
      {
        id: 3,
        name: `${equipmentInfo.name} - Bộ combo`,
        price: '499,000 VNĐ',
        image: '/api/placeholder/300/200',
        category: equipmentInfo.category,
        description: equipmentInfo.description + ' - Bộ sản phẩm đầy đủ',
        inStock: false
      }
    ];
  };

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
          
          {/* <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              label={`AI đã nhận diện: ${getMedicalEquipmentInfo(searchQueryString).name}`} 
              color="primary" 
              variant="outlined"
            />
            <Chip 
              label={getMedicalEquipmentInfo(searchQueryString).category} 
              color="secondary" 
              variant="outlined"
            />
          </Box> */}
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
                  transition: 'transform 0.2s',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
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
                
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
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
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                      {typeof product.price === 'number' ? product.price.toLocaleString('vi-VN') + ' VNĐ' : product.price}
                    </Typography>
                    <Chip 
                      label={product.category} 
                      size="small" 
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {results.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Không tìm thấy sản phẩm nào
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Hãy thử tìm kiếm với từ khóa khác hoặc sử dụng AI Hub để chẩn đoán và tìm sản phẩm phù hợp
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default SearchResults;
