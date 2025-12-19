import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Rating,
  Button,
  useTheme
} from '@mui/material';
import { formatCurrencyVnd, getFinalPrice } from '../../utils/productPrice';

export default function ProductCard({ product, loading = false }) {
  const navigate = useNavigate();
  const theme = useTheme();

  if (loading) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ height: 180, bgcolor: 'grey.200' }} />
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ height: 24, bgcolor: 'grey.200', borderRadius: 1, mb: 1 }} />
          <Box sx={{ height: 20, bgcolor: 'grey.200', borderRadius: 1, width: '60%' }} />
        </Box>
      </Card>
    );
  }

  const finalPrice = getFinalPrice(product);
  const hasDiscount = product?.discountPercent && Number(product.discountPercent) > 0;
  

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card
        onClick={() => navigate(`/product/${product.id}`)}
        sx={{
          height: '100%',
          borderRadius: 3,
          overflow: 'hidden',
          '&:hover': {
            boxShadow: theme.shadows[10],
            transform: 'translateY(-6px)'
          },
          transition: 'all .3s ease',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            image={product.imageUrl || 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&h=500&fit=crop'}
            alt={product.name}
            sx={{ height: 180, objectFit: 'cover' }}
          />
          {hasDiscount && (
            <Chip
              label={`-${Number(product.discountPercent).toFixed(0)}%`}
              color="error"
              size="small"
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                fontWeight: 'bold',
                fontSize: '0.75rem'
              }}
            />
          )}
        </Box>
        <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              mb: 1,
              lineHeight: 1.3,
              minHeight: 40,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {product.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Rating
              value={Number(product.ratingAvg) || 0}
              precision={0.1}
              readOnly
              size="small"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({Number(product.ratingAvg) || 0})
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              {formatCurrencyVnd(finalPrice)}
            </Typography>
            {hasDiscount && product.originPrice && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: 'line-through' }}
              >
                {formatCurrencyVnd(product.originPrice)}
              </Typography>
            )}
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
    </motion.div>
  );
}

