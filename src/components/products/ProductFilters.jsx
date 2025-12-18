import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
  Stack,
  Grid,
  Divider
} from '@mui/material';
import {
  FilterList as FilterListIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import http from '../../api/http';

export default function ProductFilters({ filters, onFiltersChange, onApply }) {
  const [categories, setCategories] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingManufacturers, setLoadingManufacturers] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    loadCategories();
    loadManufacturers();
  }, []);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await http.get('/categories?page=0&size=100');
      let categoryList = [];
      
      if (Array.isArray(response.data)) {
        categoryList = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        categoryList = response.data.data;
      }
      
      setCategories(categoryList.filter(c => c.active !== false));
    } catch (err) {
      console.error('Error loading categories:', err);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadManufacturers = async () => {
    try {
      setLoadingManufacturers(true);
      const response = await http.get('/manufacturers');
      let manufacturerList = [];
      
      if (Array.isArray(response.data)) {
        manufacturerList = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        manufacturerList = response.data.data;
      }
      
      setManufacturers(manufacturerList);
    } catch (err) {
      console.error('Error loading manufacturers:', err);
      setManufacturers([]);
    } finally {
      setLoadingManufacturers(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value || '' };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilter = (key) => {
    const newFilters = { ...localFilters, [key]: '' };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearAll = () => {
    const clearedFilters = {
      categoryId: '',
      manufacturerId: '',
      origin: '',
      minPrice: '',
      maxPrice: ''
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const selectedCategory = categories.find(c => c.id === localFilters.categoryId);
  const selectedManufacturer = manufacturers.find(m => m.id === localFilters.manufacturerId);

  const activeFiltersCount = [
    localFilters.categoryId,
    localFilters.manufacturerId,
    localFilters.origin,
    localFilters.minPrice,
    localFilters.maxPrice
  ].filter(Boolean).length;

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <FilterListIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Bộ lọc sản phẩm
        </Typography>
        {activeFiltersCount > 0 && (
          <Chip
            label={activeFiltersCount}
            color="primary"
            size="small"
            sx={{ ml: 2 }}
          />
        )}
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Danh mục</InputLabel>
            <Select
              value={localFilters.categoryId || ''}
              label="Danh mục"
              onChange={(e) => handleFilterChange('categoryId', e.target.value)}
              disabled={loadingCategories}
            >
              <MenuItem value="">Tất cả</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Nhà sản xuất</InputLabel>
            <Select
              value={localFilters.manufacturerId || ''}
              label="Nhà sản xuất"
              onChange={(e) => handleFilterChange('manufacturerId', e.target.value)}
              disabled={loadingManufacturers}
            >
              <MenuItem value="">Tất cả</MenuItem>
              {manufacturers.map((manufacturer) => (
                <MenuItem key={manufacturer.id} value={manufacturer.id}>
                  {manufacturer.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            size="small"
            label="Xuất xứ"
            value={localFilters.origin || ''}
            onChange={(e) => handleFilterChange('origin', e.target.value)}
            placeholder="VD: Việt Nam"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            size="small"
            label="Giá tối thiểu"
            type="number"
            value={localFilters.minPrice || ''}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            placeholder="VD: 10000"
            InputProps={{
              inputProps: { min: 0 }
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            size="small"
            label="Giá tối đa"
            type="number"
            value={localFilters.maxPrice || ''}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            placeholder="VD: 200000"
            InputProps={{
              inputProps: { min: 0 }
            }}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <Button
          variant="contained"
          onClick={onApply}
          sx={{ minWidth: 120 }}
        >
          Áp dụng
        </Button>
        <Button
          variant="outlined"
          startIcon={<ClearIcon />}
          onClick={handleClearAll}
        >
          Xóa tất cả
        </Button>
      </Box>

      {activeFiltersCount > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Bộ lọc đang áp dụng:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {selectedCategory && (
                <Chip
                  label={`Danh mục: ${selectedCategory.name}`}
                  onDelete={() => handleClearFilter('categoryId')}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              )}
              {selectedManufacturer && (
                <Chip
                  label={`NSX: ${selectedManufacturer.name}`}
                  onDelete={() => handleClearFilter('manufacturerId')}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              )}
              {localFilters.origin && (
                <Chip
                  label={`Xuất xứ: ${localFilters.origin}`}
                  onDelete={() => handleClearFilter('origin')}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              )}
              {localFilters.minPrice && (
                <Chip
                  label={`Giá từ: ${Number(localFilters.minPrice).toLocaleString('vi-VN')}₫`}
                  onDelete={() => handleClearFilter('minPrice')}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              )}
              {localFilters.maxPrice && (
                <Chip
                  label={`Giá đến: ${Number(localFilters.maxPrice).toLocaleString('vi-VN')}₫`}
                  onDelete={() => handleClearFilter('maxPrice')}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              )}
            </Stack>
          </Box>
        </>
      )}
    </Paper>
  );
}

