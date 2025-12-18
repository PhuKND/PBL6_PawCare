import React, { useMemo, useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Rating,
  Button,
  Breadcrumbs,
  Link,
  Skeleton,
  useTheme,
  useMediaQuery
} from '@mui/material';

import http from '../api/http';


const readableTitle = (slug) =>
  decodeURIComponent(slug || '')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ');

export default function CategoryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const title = useMemo(() => readableTitle(slug), [slug]);
  const categoryId = searchParams.get('categoryId');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const getDemoProducts = (name) => {
    const base = [
      {
        id: 101,
        name: `${name} – Thuốc` ,
        price: 80000,
        originalPrice: '100.000',
        discount: 20,
        imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&h=500&fit=crop',
          rating: 5.0,
        reviews: 200
      },
      {
        id: 102,
        name: `${name} – Thuốc`,
        price: 80000,
        originalPrice: '100.000',
        discount: 20,
        imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&h=500&fit=crop',
        rating: 5.0,
        reviews: 200
      },
      {
        id:103,
        name: `${name} – Thuốc`,
        price: 80000,
        originalPrice: '100.000',
        discount: 20,
        imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&h=500&fit=crop',
        rating: 5.0,
        reviews: 200
      },
      {
        id: 104,
        name: `${name} – Thuốc`,
        price: 80000,
              originalPrice: '100.000',
          discount: 20,
        imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&h=500&fit=crop',
        rating: 5.0,
        reviews: 200
      },
      {
        id: 105,
        name: `${name} – Thuốc`,
        price: 80000,
        originalPrice: '100.000',
        discount: 20,
        imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&h=500&fit=crop',
        rating: 5.0,
        reviews: 200
      },
      {
        id: 106,
        name: `${name} – Thuốc`,
        price: 80000,
        originalPrice: '100.000',
        discount: 20,
          imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&h=500&fit=crop',
        rating: 5.0,
        reviews: 200
      },
      {
        id: 107,
        name: `${name} – Thuốc`,
        price: 80000,
        originalPrice: '100.000',
        discount: 20,
        imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&h=500&fit=crop',
        rating: 5.0,
          reviews: 200
      },
      {
        id: 108,
          name: `${name} – Thuốc`,
        price: 80000,
        originalPrice: '100.000',
        discount: 20,
        imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&h=500&fit=crop',
        rating: 5.0,
        reviews: 200
      }
    ];
    return base;
  };
  useEffect(() => {
    if (!categoryId) {
      setProducts(getDemoProducts(title));
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await http.get(
          `http://127.0.0.1:8080/api/v1/products/filter?categoryId=${encodeURIComponent(categoryId)}`
        );
        const apiData = res?.data?.data || [];

        const normalized = Array.isArray(apiData)
          ? apiData.map((p) => ({
              ...p,
              price: p.discountPrice ?? p.originPrice,
              originalPrice:
                typeof p.originPrice === 'number'
                  ? p.originPrice.toLocaleString('vi-VN')
                  : p.originPrice,
              discount: p.discountPercent,
              rating: p.ratingAvg,
              reviews: p.reviewCount || 0,
            }))
          : [];

        setProducts(normalized);
      } catch (error) {
        console.error('Failed to load products by category:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, title]);

  return (
    <Box sx={{ py: 6, bgcolor: 'grey.50', minHeight: '60vh' }}>
      <Container maxWidth="lg">
        <Breadcrumbs sx={{ mb: 3 }} aria-label="breadcrumb">
          <Link underline="hover" color="inherit" onClick={() => navigate('/') } sx={{ cursor: 'pointer' }}>
            Trang chủ
          </Link>
          <Typography color="text.primary">{title}</Typography>
        </Breadcrumbs>

        <Box sx={{ mb: 3 }}>
          <Typography variant={isMobile ? 'h4' : 'h3'} sx={{ fontWeight: 'bold' }}>
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Danh sách sản phẩm liên quan đến "{title}".
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {(loading ? Array.from({ length: 8 }) : products).map((product, index) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={3}
                  key={!loading && product ? product.id || product.productId || index : index}
                >
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <Card
                      sx={{
                        height: '100%',
                        borderRadius: 3,
                        overflow: 'hidden',
                        '&:hover': { boxShadow: theme.shadows[10], transform: 'translateY(-6px)' },
                        transition: 'all .3s ease',
                        cursor: loading ? 'default' : 'pointer',
                      }}
                      onClick={() => {
                        if (loading || !product) return;
                        const id = product.id || product.productId;
                        if (id) {
                          navigate(`/product/${id}`);
                        }
                      }}
                    >
                      <Box sx={{ position: 'relative' }}>
                        {loading ? (
                          <Skeleton variant="rectangular" height={180} />
                        ) : (
                          <>
                            <CardMedia
                              component="img"
                              image={
                                product.imageUrl ||
                                product.image ||
                                'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&h=500&fit=crop'
                              }
                              alt={product.name}
                              sx={{ height: 180, objectFit: 'cover' }}
                            />
                            {product.discount && (
                              <Chip
                                label={`-${product.discount}%`}
                                color="error"
                                size="small"
                                sx={{ position: 'absolute', top: 12, left: 12, fontWeight: 'bold' }}
                              />
                            )}
                          </>
                        )}
                      </Box>
                      <CardContent sx={{ p: 2.5 }}>
                        {loading ? (
                          <>
                            <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
                            <Skeleton variant="text" height={20} width="60%" sx={{ mb: 1 }} />
                            <Skeleton variant="rectangular" height={36} />
                          </>
                        ) : (
                          <>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, lineHeight: 1.3 }}>
                              {product.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Rating value={Number(product.rating) || 4.5} precision={0.1} readOnly size="small" />
                              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                ({product.reviews || product.reviewCount || 0})
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                {product.price?.toLocaleString?.('vi-VN') || product.price || 'Liên hệ'}
                              </Typography>
                              {product.originalPrice && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ textDecoration: 'line-through' }}
                                >
                                  {product.originalPrice}
                                </Typography>
                              )}
                            </Box>
                            <Button fullWidth variant="contained">Chọn mua</Button>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
        </Grid>
      </Container>
    </Box>
  );
}


