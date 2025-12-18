import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Breadcrumbs,
  Link,
  useTheme,
  useMediaQuery,
  Pagination,
  Alert
} from '@mui/material';
import ProductFilters from '../components/products/ProductFilters';
import ProductCard from '../components/products/ProductCard';
import { fetchProductsFiltered } from '../api/http';

const PAGE_SIZE = 20;

export default function ProductsOverview() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Get filters from URL params
  const getFiltersFromParams = useCallback(() => {
    return {
      categoryId: searchParams.get('categoryId') || '',
      manufacturerId: searchParams.get('manufacturerId') || '',
      origin: searchParams.get('origin') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || ''
    };
  }, [searchParams]);

  const [filters, setFilters] = useState(getFiltersFromParams);
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get('page') || '0', 10)
  );

  // Update filters when URL params change
  useEffect(() => {
    const newFilters = getFiltersFromParams();
    setFilters(newFilters);
    setCurrentPage(parseInt(searchParams.get('page') || '0', 10));
  }, [searchParams, getFiltersFromParams]);

  // Load products when filters or page change
  useEffect(() => {
    let mounted = true;
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetchProductsFiltered({
          page: currentPage,
          size: PAGE_SIZE,
          categoryId: filters.categoryId && String(filters.categoryId).trim() !== '' ? filters.categoryId : undefined,
          manufacturerId: filters.manufacturerId && String(filters.manufacturerId).trim() !== '' ? filters.manufacturerId : undefined,
          origin: filters.origin && String(filters.origin).trim() !== '' ? filters.origin : undefined,
          minPrice: filters.minPrice && String(filters.minPrice).trim() !== '' ? filters.minPrice : undefined,
          maxPrice: filters.maxPrice && String(filters.maxPrice).trim() !== '' ? filters.maxPrice : undefined
        });

        if (mounted) {
          let productList = [];
          // Handle response structure: { code, message, data: [...], timestamp }
          if (Array.isArray(response?.data)) {
            productList = response.data;
          } else if (Array.isArray(response)) {
            productList = response;
          } else if (Array.isArray(response?.content)) {
            productList = response.content;
          }

          setProducts(productList);

          // Calculate pagination
          // If no pagination info in response, calculate from data length
          const total = response?.totalElements || response?.total || productList.length;
          const pages = response?.totalPages || Math.ceil(total / PAGE_SIZE) || 1;
          setTotalElements(total);
          setTotalPages(pages);
        }
      } catch (e) {
        console.error('Error loading products:', e);
        if (mounted) {
          setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
          setProducts([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProducts();
    return () => { mounted = false; };
  }, [currentPage, filters]);

  // Update URL when filters change
  const updateURL = useCallback((newFilters, newPage = 0) => {
    const params = new URLSearchParams();
    
    if (newPage >= 0) params.set('page', newPage.toString());
    if (newFilters.categoryId && String(newFilters.categoryId).trim() !== '') {
      params.set('categoryId', newFilters.categoryId);
    }
    if (newFilters.manufacturerId && String(newFilters.manufacturerId).trim() !== '') {
      params.set('manufacturerId', newFilters.manufacturerId);
    }
    if (newFilters.origin && String(newFilters.origin).trim() !== '') {
      params.set('origin', newFilters.origin);
    }
    if (newFilters.minPrice && String(newFilters.minPrice).trim() !== '') {
      params.set('minPrice', newFilters.minPrice);
    }
    if (newFilters.maxPrice && String(newFilters.maxPrice).trim() !== '') {
      params.set('maxPrice', newFilters.maxPrice);
    }

    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handleApplyFilters = useCallback(() => {
    setCurrentPage(0);
    updateURL(filters, 0);
  }, [filters, updateURL]);

  const handlePageChange = useCallback((event, value) => {
    const newPage = value - 1; // Pagination is 1-based, but API is 0-based
    setCurrentPage(newPage);
    updateURL(filters, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filters, updateURL]);

  return (
    <Box sx={{ py: 6, bgcolor: 'grey.50', minHeight: '60vh' }}>
      <Container maxWidth="lg">
        <Breadcrumbs sx={{ mb: 3 }} aria-label="breadcrumb">
          <Link
            underline="hover"
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ cursor: 'pointer' }}
          >
            Trang chủ
          </Link>
          <Typography color="text.primary">Tổng quan sản phẩm</Typography>
        </Breadcrumbs>

        <Box sx={{ mb: 3 }}>
          <Typography variant={isMobile ? 'h4' : 'h3'} sx={{ fontWeight: 'bold' }}>
            Tổng quan sản phẩm
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Tìm kiếm và lọc sản phẩm theo nhu cầu của bạn
          </Typography>
        </Box>

        <ProductFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onApply={handleApplyFilters}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!loading && products.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              Không tìm thấy sản phẩm nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Thử thay đổi bộ lọc để tìm thêm sản phẩm
            </Typography>
          </Box>
        )}

        <Grid container spacing={3}>
          {loading
            ? Array.from({ length: 8 }).map((_, index) => (
                <Grid item xs={12} sm={6} md={3} key={`skeleton-${index}`}>
                  <ProductCard loading />
                </Grid>
              ))
            : products.map((product) => (
                <Grid item xs={12} sm={6} md={3} key={product.id}>
                  <ProductCard product={product} />
                </Grid>
              ))}
        </Grid>

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={currentPage + 1}
              onChange={handlePageChange}
              color="primary"
              size={isMobile ? 'small' : 'medium'}
              showFirstButton
              showLastButton
            />
          </Box>
        )}

        {!loading && products.length > 0 && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Hiển thị {products.length} / {totalElements} sản phẩm
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}
