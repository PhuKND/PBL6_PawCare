import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Skeleton,
  Stack,
  Collapse,
  Rating
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Inventory as InventoryIcon,
  LocalOffer as LocalOfferIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  Edit as EditIcon,
  AttachMoney as AttachMoneyIcon,
  Inventory2 as Inventory2Icon,
  ShoppingCart as ShoppingCartIcon,
  Star as StarIcon,
  CalendarToday as CalendarTodayIcon,
  Event as EventIcon,
  Delete as DeleteIcon,
  DeleteOutline as DeleteOutlineIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Sort as SortIcon,
  Restore as RestoreIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Visibility as VisibilityIcon,
  QuestionAnswer as QuestionAnswerIcon,
  HelpOutline as HelpOutlineIcon
} from '@mui/icons-material';
import http, { fetchProducts, fetchDeletedProducts, getProductDetail, createProductFAQ } from '../../api/http';

function formatCurrencyVnd(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value || 0));
}

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(20);
  const [addOpen, setAddOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState([]);
  const [ingredients, setIngredients] = useState([
    { name: '', amount: '', unit: '', description: '' }
  ]);
  const [manufacturers, setManufacturers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingManufacturers, setLoadingManufacturers] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
  const [discountProductId, setDiscountProductId] = useState(null);
  const [submittingDiscount, setSubmittingDiscount] = useState(false);
  const [discountForm, setDiscountForm] = useState({
    percent: '',
    message: '',
    startDate: '',
    endDate: ''
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deletedProductsDialogOpen, setDeletedProductsDialogOpen] = useState(false);
  const [deletedProducts, setDeletedProducts] = useState([]);
  const [loadingDeletedProducts, setLoadingDeletedProducts] = useState(false);
  const [deletedProductsPage, setDeletedProductsPage] = useState(0);
  const [deletedProductsSort, setDeletedProductsSort] = useState('createdAt,desc');
  const [deletedProductsHasNext, setDeletedProductsHasNext] = useState(false);
  const [restoringProduct, setRestoringProduct] = useState({});
  const [expandedRows, setExpandedRows] = useState({});
  const [productDetails, setProductDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState({});
  const [faqDialogOpen, setFaqDialogOpen] = useState(false);
  const [faqProductId, setFaqProductId] = useState(null);
  const [submittingFAQ, setSubmittingFAQ] = useState(false);
  const [faqForm, setFaqForm] = useState({
    question: '',
    answer: ''
  });
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'VND',
    quantity: '',
    productDate: '',
    expirationDate: '',
    manufacturerId: '',
    categoryId: '',
    usage: '',
    benefit: '',
    sideEffect: '',
    note: '',
    preserve: '',
    precription: 'false',
    unit: '',
    position: '',
    isActive: true
  });

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetchProducts(currentPage, pageSize);

      let list = [];
      let total = 0;
      
      if (response.code === 200) {
        list = response.data || [];
        total = response.totalElements || response.total || 0;
      } else if (Array.isArray(response.data)) {
        list = response.data;
        total = response.totalElements || response.total || list.length;
      } else if (Array.isArray(response)) {
        list = response;
        total = list.length;
      } else {
        setError(response.message || 'Không thể tải danh sách sản phẩm');
        return;
      }
      
      setProducts(Array.isArray(list) ? list : []);
      setTotalElements(total);

      if (total > 0) {
        const totalPages = Math.max(1, Math.ceil(Number(total) / pageSize));
        setHasNext(currentPage < totalPages - 1);
      } else {
        setHasNext(list.length === pageSize);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi tải dữ liệu');
      console.error('Error loading products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearch = useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);


  const handleRefresh = useCallback(() => {
    loadProducts();
  }, [loadProducts]);

  const normalizeList = useCallback((payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.content)) return payload.content;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  }, []);

  const loadManufacturers = useCallback(async () => {
    try {
      setLoadingManufacturers(true);
      const res = await http.get('http://127.0.0.1:8080/api/v1/manufacturers');
      const raw = res?.data?.data ?? res?.data ?? [];
      const list = normalizeList(raw)
        .map((m) => ({
          id: m?.id || m?.uuid || m?.manufacturerId || m?.code || '',
          name: m?.name || m?.manufacturerName || m?.title || 'Không tên'
        }))
        .filter((m) => m.id);
      setManufacturers(list);
    } catch (err) {
      console.error('Error loading manufacturers:', err);
      setManufacturers([]);
    } finally {
      setLoadingManufacturers(false);
    }
  }, [normalizeList]);

  const loadCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      const res = await http.get('http://127.0.0.1:8080/api/v1/categories?page=0&size=50');
      const raw = res?.data?.data ?? res?.data ?? [];
      const list = normalizeList(raw)
        .map((c) => ({
          id: c?.id || c?.uuid || c?.categoryId || c?.code || '',
          name: c?.name || c?.categoryName || c?.title || 'Không tên'
        }))
        .filter((c) => c.id);
      setCategories(list);
    } catch (err) {
      console.error('Error loading categories:', err);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }, [normalizeList]);

  useEffect(() => {
    if (addOpen) {
      loadManufacturers();
      loadCategories();
    }
  }, [addOpen, loadManufacturers, loadCategories]);

  const handleOpenAdd = useCallback(() => setAddOpen(true), []);
  const resetForm = useCallback(() => {
    setImages([]);
    setIngredients([{ name: '', amount: '', unit: '', description: '' }]);
    setForm({
      name: '',
      description: '',
      price: '',
      currency: 'VND',
      quantity: '',
      productDate: '',
      expirationDate: '',
      manufacturerId: '',
      categoryId: '',
      usage: '',
      benefit: '',
      sideEffect: '',
      note: '',
      preserve: '',
      precription: 'false',
      unit: '',
      position: '',
      isActive: true
    });
    setIsEdit(false);
    setEditingId(null);
  }, []);

  const handleCloseAdd = useCallback(() => { 
    if (!submitting) {
      setAddOpen(false);
      resetForm();
    }
  }, [resetForm, submitting]);
  
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);
  
  const handleImagesChange = useCallback((e) => {
    setImages(Array.from(e.target.files || []));
  }, []);
  const handleAddIngredient = useCallback(() => {
    setIngredients(prev => [...prev, { name: '', amount: '', unit: '', description: '' }]);
  }, []);

  const handleRemoveIngredient = useCallback((index) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleIngredientChange = useCallback((index, field, value) => {
    setIngredients(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  }, []);

  const parseDateInput = (value) => {
    if (!value) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }
    if (value.includes('/')) {
      const parts = value.split('/');
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        return `${year}-${month}-${day}`;
      }
    }
    try {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    } catch (e) {
    }
    return value;
  };

  const handleEditProduct = useCallback(async (productId) => {
    try {
      setSubmitting(true);
      setIsEdit(true);
      setEditingId(productId);
      setImages([]);
      setIngredients([{ name: '', amount: '', unit: '', description: '' }]);

      let manufacturersList = [];
      let categoriesList = [];
      
      try {
        const [manRes, catRes] = await Promise.all([
          http.get('/manufacturers'),
          http.get('/categories?page=0&size=50')
        ]);
        
        const manRaw = manRes?.data?.data ?? manRes?.data ?? [];
        manufacturersList = normalizeList(manRaw)
          .map((m) => ({
            id: m?.id || m?.uuid || m?.manufacturerId || m?.code || '',
            name: m?.name || m?.manufacturerName || m?.title || 'Không tên'
          }))
          .filter((m) => m.id);
        
        const catRaw = catRes?.data?.data ?? catRes?.data ?? [];
        categoriesList = normalizeList(catRaw)
          .map((c) => ({
            id: c?.id || c?.uuid || c?.categoryId || c?.code || '',
            name: c?.name || c?.categoryName || c?.title || 'Không tên'
          }))
          .filter((c) => c.id);
        
        setManufacturers(manufacturersList);
        setCategories(categoriesList);
      } catch (err) {
        console.warn('Error loading manufacturers/categories:', err);
      }

      const res = await http.get(`/products/detail/${productId}`);
      const data = res?.data?.data || res?.data || {};

      const ing = Array.isArray(data.ingredients) && data.ingredients.length > 0
        ? data.ingredients.map((ing) => ({
            name: ing.name || '',
            amount: String(ing.amount || ''),
            unit: ing.unit || '',
            description: ing.description || ''
          }))
        : [{ name: '', amount: '', unit: '', description: '' }];

      setIngredients(ing);

      let categoryIdValue = data.categoryId || '';
      if (!categoryIdValue && data.category && categoriesList.length > 0) {
        const foundCategory = categoriesList.find(c => 
          c.name === data.category || 
          c.name?.toLowerCase() === data.category?.toLowerCase()
        );
        if (foundCategory) {
          categoryIdValue = foundCategory.id;
        }
      }

      setForm({
        name: data.name || '',
        description: data.description || '',
        price: String(data.originPrice || data.price || ''),
        currency: data.currency || 'VND',
        quantity: String(data.quantity || ''),
        productDate: parseDateInput(data.productDate || ''),
        expirationDate: parseDateInput(data.expirationDate || ''),
        manufacturerId: data.manufactureId || data.manufacturerId || '',
        categoryId: categoryIdValue,
        usage: data.usage || '',
        benefit: data.benefit || '',
        sideEffect: data.sideEffect || '',
        note: data.note || '',
        preserve: data.preserve || '',
        precription: String(data.precription ?? data.prescription ?? 'false'),
        unit: data.unit || '',
        position: String(data.position ?? ''),
        isActive: data.isActive ?? true
      });

      setAddOpen(true);
    } catch (err) {
      console.error('Error loading product detail:', err);
      alert(err?.response?.data?.message || 'Không thể tải thông tin sản phẩm để chỉnh sửa');
      setIsEdit(false);
      setEditingId(null);
    } finally {
      setSubmitting(false);
    }
  }, [normalizeList]);

  const formatDateForAPI = (dateString) => {
    if (!dateString) return '';
    if (dateString.includes('/')) {
      return dateString;
    }
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const month = parts[1];
      const day = parts[2];
      return `${day}/${month}/${year}`;
    }
    return dateString;
  };

  const formatDateTimeForDiscount = (dateTimeString, defaultTime = '00:00:00') => {
    if (!dateTimeString) return '';
    
    if (dateTimeString.includes('T')) {
      const [datePart, timePart] = dateTimeString.split('T');
      const [year, month, day] = datePart.split('-');
      const time = timePart ? `${timePart}:00` : defaultTime;
      return `${year}/${month}/${day} ${time}`;
    } else if (dateTimeString.includes('-')) {
      const [year, month, day] = dateTimeString.split('-');
      return `${year}/${month}/${day} ${defaultTime}`;
    }
    
    if (dateTimeString.includes('/') && dateTimeString.includes(':')) {
      const datePart = dateTimeString.split(' ')[0];
      const parts = datePart.split('/');
      if (parts.length === 3 && parts[0].length === 4) {
        return dateTimeString;
      } else if (parts.length === 3 && parts[2].length === 4) {
        const [day, month, year] = parts;
        const timePart = dateTimeString.split(' ')[1] || defaultTime;
        return `${year}/${month}/${day} ${timePart}`;
      }
    }
    
    return dateTimeString;
  };

  const handleDiscountChange = useCallback((e) => {
    const { name, value } = e.target;
    setDiscountForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmitDiscount = useCallback(async () => {
    if (!discountProductId) return;
    
    if (!discountForm.percent || !discountForm.message || !discountForm.startDate || !discountForm.endDate) {
      alert('Vui lòng điền đầy đủ thông tin giảm giá');
      return;
    }

    const percentValue = Number(discountForm.percent);
    if (isNaN(percentValue) || percentValue < 0 || percentValue > 100) {
      alert('Phần trăm giảm giá phải là số từ 0 đến 100');
      return;
    }

    const startDateObj = new Date(discountForm.startDate);
    const endDateObj = new Date(discountForm.endDate);
    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      alert('Ngày tháng không hợp lệ');
      return;
    }
    if (endDateObj <= startDateObj) {
      alert('Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }

    try {
      setSubmittingDiscount(true);
      
      const startDateFormatted = formatDateTimeForDiscount(discountForm.startDate, '00:00:00');
      const endDateFormatted = formatDateTimeForDiscount(discountForm.endDate, '23:59:59');
      
      const payload = {
        percent: percentValue,
        message: discountForm.message.trim(),
        startDate: startDateFormatted,
        endDate: endDateFormatted
      };

      console.log('Discount payload:', payload);

      const res = await http.post(`/products/${discountProductId}/discounts`, payload);
      
      if (res?.data?.code === 201 || res?.data?.data) {
        alert('Tạo mã giảm giá thành công!');
        setDiscountDialogOpen(false);
        setDiscountForm({
          percent: '',
          message: '',
          startDate: '',
          endDate: ''
        });
        setDiscountProductId(null);
        await loadProducts();
      }
    } catch (err) {
      console.error('Error creating discount:', err);
      console.error('Error response:', err?.response?.data);
      
      let errorMessage = 'Không thể tạo mã giảm giá';
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      const errorDetails = err?.response?.data?.errors;
      if (errorDetails && Array.isArray(errorDetails)) {
        errorMessage += '\n\nChi tiết:\n' + errorDetails.map(e => `- ${e.field || e.defaultMessage || e}`).join('\n');
      }
      
      alert(errorMessage);
    } finally {
      setSubmittingDiscount(false);
    }
  }, [discountProductId, discountForm, loadProducts]);

  const handleDeleteProduct = useCallback(async () => {
    if (!productToDelete) return;

    const productId = productToDelete.id || productToDelete.productId;
    if (!productId) {
      alert('Không tìm thấy ID sản phẩm');
      return;
    }

    try {
      setDeleting(true);
      await http.delete(`/products/${productId}`);
      
      alert('Xóa sản phẩm thành công!');
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      await loadProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      const errorMessage = err?.response?.data?.message || err?.response?.data?.error || 'Không thể xóa sản phẩm';
      alert(errorMessage);
    } finally {
      setDeleting(false);
    }
  }, [productToDelete, loadProducts]);

  const handleFAQChange = useCallback((e) => {
    const { name, value } = e.target;
    setFaqForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const loadProductDetail = useCallback(async (productId) => {
    if (!productId) {
      return;
    }

    let alreadyLoaded = false;
    let alreadyLoading = false;

    setProductDetails(prev => {
      if (prev[productId]) {
        alreadyLoaded = true;
        return prev;
      }
      return prev;
    });

    setLoadingDetails(prev => {
      if (prev[productId]) {
        alreadyLoading = true;
        return prev;
      }
      return prev;
    });

    if (alreadyLoaded || alreadyLoading) {
      return;
    }

    try {
      setLoadingDetails(prev => ({ ...prev, [productId]: true }));
      const response = await getProductDetail(productId);
      
      const detail = response?.data || response;
      if (detail) {
        setProductDetails(prev => {
          if (prev[productId]) {
            return prev;
          }
          return { ...prev, [productId]: detail };
        });
      }
    } catch (err) {
      console.error('Error loading product detail:', err);
      setProductDetails(prev => ({ ...prev, [productId]: null }));
    } finally {
      setLoadingDetails(prev => ({ ...prev, [productId]: false }));
    }
  }, []);

  const handleSubmitFAQ = useCallback(async () => {
    if (!faqProductId) return;
    
    if (!faqForm.question || !faqForm.answer) {
      alert('Vui lòng điền đầy đủ câu hỏi và câu trả lời');
      return;
    }

    try {
      setSubmittingFAQ(true);
      const response = await createProductFAQ(faqProductId, {
        question: faqForm.question.trim(),
        answer: faqForm.answer.trim()
      });
      
      if (response?.code === 201 || response?.data) {
        alert('Tạo câu hỏi thường gặp thành công!');
        setFaqDialogOpen(false);
        setFaqForm({
          question: '',
          answer: ''
        });
        const currentProductId = faqProductId;
        setFaqProductId(null);
        if (currentProductId) {
          await loadProductDetail(currentProductId);
        }
      }
    } catch (err) {
      console.error('Error creating FAQ:', err);
      const errorMessage = err?.response?.data?.message || err?.response?.data?.error || 'Không thể tạo câu hỏi thường gặp';
      alert(errorMessage);
    } finally {
      setSubmittingFAQ(false);
    }
  }, [faqProductId, faqForm, loadProductDetail]);

  const loadDeletedProducts = useCallback(async () => {
    try {
      setLoadingDeletedProducts(true);
      const response = await fetchDeletedProducts({
        page: deletedProductsPage,
        size: 10,
        sort: deletedProductsSort
      });

      let productList = [];
      if (Array.isArray(response)) {
        productList = response;
      } else if (Array.isArray(response?.data)) {
        productList = response.data;
      } else if (Array.isArray(response?.content)) {
        productList = response.content;
      }

      setDeletedProducts(productList);

      const total = response?.totalElements || response?.total || productList.length;
      const totalPages = response?.totalPages || Math.ceil(total / 10) || 1;
      setDeletedProductsHasNext(deletedProductsPage < totalPages - 1);
    } catch (err) {
      console.error('Error loading deleted products:', err);
      setDeletedProducts([]);
      alert(err?.response?.data?.message || 'Không thể tải danh sách sản phẩm đã xóa');
    } finally {
      setLoadingDeletedProducts(false);
    }
  }, [deletedProductsPage, deletedProductsSort]);

  const handleOpenDeletedProducts = useCallback(() => {
    setDeletedProductsDialogOpen(true);
    setDeletedProductsPage(0);
    setDeletedProductsSort('createdAt,desc');
  }, []);

  const handleCloseDeletedProducts = useCallback(() => {
    setDeletedProductsDialogOpen(false);
    setDeletedProducts([]);
    setDeletedProductsPage(0);
  }, []);

  useEffect(() => {
    if (deletedProductsDialogOpen) {
      loadDeletedProducts();
    }
  }, [deletedProductsDialogOpen, deletedProductsPage, deletedProductsSort, loadDeletedProducts]);

  const handleToggleDeletedProductsSort = useCallback(() => {
    setDeletedProductsSort(prev => prev === 'createdAt,desc' ? 'createdAt,asc' : 'createdAt,desc');
    setDeletedProductsPage(0);
  }, []);

  const handleRestoreProduct = useCallback(async (productId) => {
    if (!productId) {
      alert('Không tìm thấy ID sản phẩm');
      return;
    }

    if (!window.confirm('Bạn có chắc chắn muốn khôi phục sản phẩm này?')) {
      return;
    }

    try {
      setRestoringProduct(prev => ({ ...prev, [productId]: true }));
      const response = await http.put(`/products/restore/${productId}`);
      
      if (response?.data?.code === 200 || response?.data?.data) {
        alert(response?.data?.message || 'Khôi phục sản phẩm thành công!');
        setDeletedProducts(prev => prev.filter(p => p.id !== productId));
        await loadProducts();
      }
    } catch (err) {
      console.error('Error restoring product:', err);
      const errorMessage = err?.response?.data?.message || err?.response?.data?.error || 'Không thể khôi phục sản phẩm';
      alert(errorMessage);
    } finally {
      setRestoringProduct(prev => ({ ...prev, [productId]: false }));
    }
  }, [loadProducts]);

  const toggleRowExpand = useCallback((productId) => {
    setExpandedRows((prev) => {
      const newExpanded = { ...prev };
      const isCurrentlyExpanded = !!newExpanded[productId];
      
      if (!isCurrentlyExpanded) {
        newExpanded[productId] = true;
        Promise.resolve().then(() => loadProductDetail(productId));
      } else {
        newExpanded[productId] = false;
      }
      
      return newExpanded;
    });
  }, [loadProductDetail]);

  const handleSubmitAdd = useCallback(async () => {
    try {
      setSubmitting(true);

      if (!form.name || !form.price) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc (Tên sản phẩm và Giá)');
        setSubmitting(false);
        return;
      }

      const filteredIngredients = ingredients
        .filter(ing => ing.name && ing.name.trim() !== '') 
        .map(ing => ({
          name: ing.name.trim(),
          amount: Number(ing.amount) || 0,
          unit: (ing.unit || '').trim(),
          description: (ing.description || '').trim()
        }));

      const ingredientsJson = JSON.stringify(filteredIngredients);

      const fd = new FormData();
      fd.append('name', (form.name || '').trim());
      fd.append('description', (form.description || '').trim());
      fd.append('price', String(form.price || '0'));
      fd.append('currency', (form.currency || 'VND').trim());
      fd.append('quantity', String(form.quantity || '0'));

      const productDateFormatted = formatDateForAPI(form.productDate);
      if (productDateFormatted) {
        fd.append('productDate', productDateFormatted);
      }
      
      const expirationDateFormatted = formatDateForAPI(form.expirationDate);
      if (expirationDateFormatted) {
        fd.append('expirationDate', expirationDateFormatted);
      }
      
      if (form.manufacturerId) {
        fd.append('manufacturerId', String(form.manufacturerId).trim());
      }
      if (form.categoryId) {
        fd.append('categoryId', String(form.categoryId).trim());
      }
      
      fd.append('usage', (form.usage || '').trim());
      fd.append('benefit', (form.benefit || '').trim());
      fd.append('sideEffect', (form.sideEffect || '').trim());
      fd.append('note', (form.note || '').trim());
      fd.append('preserve', (form.preserve || '').trim());
      
      if (filteredIngredients.length > 0) {
      fd.append('ingredients', ingredientsJson); 
      }
      
      fd.append('precription', String(form.precription || 'false'));
      
      if (form.unit) {
        fd.append('unit', String(form.unit).trim());
      }
      if (form.position !== undefined && form.position !== null && form.position !== '') {
        fd.append('position', String(form.position));
      }
      fd.append('isActive', form.isActive ? '1' : '0');

      if (images.length > 0) {
      images.forEach((f) => fd.append('images', f));
      }

      let res;
      if (isEdit && editingId) {
        res = await http.put(`/products/${editingId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        res = await http.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      
      const created = res?.data?.data;
      if (created) {
        await loadProducts();
      }
      handleCloseAdd();
    } catch (e) {
      console.error('Create product error:', e);
      const errorMessage = e?.response?.data?.message || e?.response?.data?.error || 'Không thể tạo sản phẩm';
      const errorDetails = e?.response?.data?.errors;
      if (errorDetails && Array.isArray(errorDetails)) {
        alert(`${errorMessage}\n\nChi tiết:\n${errorDetails.map(err => `- ${err.field || err.defaultMessage || err}`).join('\n')}`);
      } else {
        alert(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  }, [form, images, ingredients, isEdit, editingId, loadProducts, handleCloseAdd]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    const q = searchTerm.toLowerCase();
    return products.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  }, [products, searchTerm]);

  if (loading && products.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Skeleton variant="rectangular" width="100%" height={120} sx={{ borderRadius: 3 }} />
          <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 3 }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
              <InventoryIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                Quản lý Sản phẩm
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Xem và quản lý danh sách sản phẩm trong hệ thống
              </Typography>
            </Box>
          </Box>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                color: 'white', 
                borderRadius: 3,
                boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)',
                height: '100%'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {loading ? <Skeleton width={60} /> : totalElements || products.length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.95rem' }}>Tổng sản phẩm</Typography>
                    </Box>
                    <InventoryIcon sx={{ fontSize: 48, opacity: 0.9 }} />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
                color: 'white', 
                borderRadius: 3,
                boxShadow: '0 8px 16px rgba(79, 172, 254, 0.3)',
                height: '100%'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {loading ? <Skeleton width={60} /> : products.filter(p => Number(p.discount || 0) > 0).length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.95rem' }}>Đang giảm giá</Typography>
                    </Box>
                    <LocalOfferIcon sx={{ fontSize: 48, opacity: 0.9 }} />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', 
                color: 'white', 
                borderRadius: 3,
                boxShadow: '0 8px 16px rgba(67, 233, 123, 0.3)',
                height: '100%'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {loading ? <Skeleton width={60} /> : products.reduce((s, p) => s + Number(p.soldQuantity || 0), 0).toLocaleString('vi-VN')}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.95rem' }}>Tổng đã bán</Typography>
                    </Box>
                    <TrendingUpIcon sx={{ fontSize: 48, opacity: 0.9 }} />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        <Paper 
          elevation={3} 
          sx={{ 
            borderRadius: 3, 
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}
        >
          <Box sx={{ 
            p: 3, 
            borderBottom: '1px solid', 
            borderColor: 'divider', 
            background: 'linear-gradient(90deg, #f8f9fa 0%, #ffffff 100%)'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', flex: 1 }}>
                <TextField
                  placeholder="Tìm kiếm sản phẩm theo tên hoặc mô tả..."
                  value={searchTerm}
                  onChange={handleSearch}
                  size="medium"
                  sx={{ 
                    minWidth: 320,
                    flex: 1,
                    maxWidth: 500,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'white',
                      '&:hover': {
                        backgroundColor: 'grey.50'
                      }
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                {searchTerm && (
                  <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                    Tìm thấy {filteredProducts.length} sản phẩm
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Tooltip title="Xem sản phẩm đã xóa">
                  <IconButton 
                    onClick={handleOpenDeletedProducts} 
                    color="error"
                    sx={{ 
                      bgcolor: 'error.light',
                      '&:hover': { bgcolor: 'error.main', color: 'white' }
                    }}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Làm mới dữ liệu">
                  <IconButton 
                    onClick={handleRefresh} 
                    color="primary"
                    sx={{ 
                      bgcolor: 'primary.light',
                      '&:hover': { bgcolor: 'primary.main', color: 'white' }
                    }}
                    disabled={loading}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenAdd}
                  sx={{
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    borderRadius: 2,
                    px: 3,
                    py: 1.2,
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                    '&:hover': {
                      boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Thêm sản phẩm
                </Button>
              </Box>
            </Box>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                m: 3,
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  fontSize: 28
                }
              }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          {loading && products.length === 0 ? (
            <Box sx={{ p: 3 }}>
              <Stack spacing={2}>
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
                ))}
              </Stack>
            </Box>
          ) : filteredProducts.length === 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Hình ảnh</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Tên sản phẩm</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Mô tả</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Giá gốc</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Giảm giá</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Tồn kho</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Đã bán</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Đánh giá</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>NSX</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>HSD</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2, textAlign: 'center' }}>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
                      <InventoryIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                        {searchTerm ? 'Không tìm thấy sản phẩm nào' : 'Chưa có sản phẩm nào'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Danh sách sản phẩm trống'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Hình ảnh</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Tên sản phẩm</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Mô tả</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Giá gốc</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Giảm giá</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Tồn kho</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Đã bán</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Đánh giá</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>NSX</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>HSD</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2, textAlign: 'center' }}>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProducts.map((product, index) => {
                    const productId = product.id || product.productId;
                    const detail = productDetails[productId];
                    const isLoadingDetail = loadingDetails[productId];
                    const isExpanded = expandedRows[productId];
                    
                    return (
                      <React.Fragment key={product.id || `${product.name}-${index}`}>
                    <TableRow
                      onClick={() => toggleRowExpand(productId)}
                      sx={{
                        '&:hover': {
                          bgcolor: 'grey.50',
                          transition: 'all 0.2s ease-in-out',
                          cursor: 'pointer'
                        },
                        transition: 'all 0.2s ease-in-out',
                        cursor: 'pointer'
                      }}
                    >
                      <TableCell>
                        <Avatar 
                          src={product.imageUrl} 
                          variant="rounded" 
                          sx={{ 
                            width: 60, 
                            height: 60, 
                            borderRadius: 2
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {product.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            maxWidth: 300,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }} 
                          color="text.secondary"
                        >
                          {product.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AttachMoneyIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatCurrencyVnd(product.originPrice)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {product.discount && Number(product.discount) > 0 ? (
                          <Chip 
                            label={`-${product.discount}%`} 
                            color="error" 
                            size="small" 
                            sx={{ fontWeight: 600 }} 
                          />
                        ) : (
                          <Chip 
                            label="0%" 
                            size="small" 
                            variant="outlined" 
                            sx={{ fontWeight: 600 }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Inventory2Icon sx={{ fontSize: 18, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {product.quantity?.toLocaleString('vi-VN') || 0}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <ShoppingCartIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {product.soldQuantity?.toLocaleString('vi-VN') || 0}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <StarIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {Number(product.ratingAvg || 0).toFixed(1)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {product.productDate || '-'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <EventIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {product.expirationDate || '-'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title={isExpanded ? 'Thu gọn' : 'Xem chi tiết'}>
                          <IconButton
                          size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRowExpand(productId);
                            }}
                            sx={{ 
                              bgcolor: isExpanded ? 'primary.light' : 'grey.200',
                              '&:hover': { bgcolor: 'primary.main', color: 'white' }
                            }}
                          >
                            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={11} sx={{ py: 0, border: 0 }}>
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Box sx={{ p: 3, bgcolor: 'grey.50' }}>
                            {isLoadingDetail ? (
                              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                                <CircularProgress />
                                <Typography variant="body2" sx={{ ml: 2 }}>Đang tải chi tiết sản phẩm...</Typography>
                              </Box>
                            ) : detail ? (
                              <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                  <Card sx={{ mb: 2 }}>
                                    <CardContent>
                                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                                        Thông tin cơ bản
                                      </Typography>
                                      <Stack spacing={1.5}>
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">ID sản phẩm</Typography>
                                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                            {detail.id}
                                          </Typography>
                                        </Box>
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">Tên sản phẩm</Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {detail.name || 'Chưa có'}
                                          </Typography>
                                        </Box>
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">Mô tả</Typography>
                                          <Typography variant="body2">
                                            {detail.description || 'Chưa có'}
                                          </Typography>
                                        </Box>
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">Danh mục</Typography>
                                          <Typography variant="body2">
                                            {detail.category || 'Chưa có'}
                                          </Typography>
                                        </Box>
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">Nhà sản xuất</Typography>
                                          <Typography variant="body2">
                                            {detail.manufacturer || 'Chưa có'}
                                          </Typography>
                                        </Box>
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">Manufacture ID</Typography>
                                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                            {detail.manufactureId || 'Chưa có'}
                                          </Typography>
                                        </Box>
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">Cần kê đơn</Typography>
                                          <Chip
                                            label={detail.precription ? 'Có' : 'Không'}
                                            color={detail.precription ? 'warning' : 'success'}
                                            size="small"
                                            sx={{ fontWeight: 600 }}
                                          />
                                        </Box>
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">Tiền tệ</Typography>
                                          <Typography variant="body2">
                                            {detail.currency || 'VND'}
                                          </Typography>
                                        </Box>
                                      </Stack>
                                    </CardContent>
                                  </Card>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Card sx={{ mb: 2 }}>
                                    <CardContent>
                                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                                        Giá và đánh giá
                                      </Typography>
                                      <Stack spacing={1.5}>
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">Giá gốc</Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                            {formatCurrencyVnd(detail.originPrice)}
                                          </Typography>
                                        </Box>
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">Giá giảm</Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                                            {formatCurrencyVnd(detail.discountPrice || detail.originPrice)}
                                          </Typography>
                                        </Box>
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">Phần trăm giảm giá</Typography>
                                          <Typography variant="body2">
                                            {detail.discountPercen || detail.discountPercent || 0}%
                                          </Typography>
                                        </Box>
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">Đánh giá trung bình</Typography>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Rating value={Number(detail.ratingAvg) || 0} precision={0.1} readOnly size="small" />
                                            <Typography variant="body2">
                                              {Number(detail.ratingAvg || 0).toFixed(1)}
                                            </Typography>
                                          </Box>
                                        </Box>
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">Số lượng tồn kho</Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {detail.quantity?.toLocaleString('vi-VN') || 0}
                                          </Typography>
                                        </Box>
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">Đã bán</Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {detail.soldQuantity?.toLocaleString('vi-VN') || 0}
                                          </Typography>
                                        </Box>
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">Ngày sản xuất</Typography>
                                          <Typography variant="body2">
                                            {detail.productDate || 'Chưa có'}
                                          </Typography>
                                        </Box>
                                      </Stack>
                                    </CardContent>
                                  </Card>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Card sx={{ mb: 2 }}>
                                    <CardContent>
                                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                                        Thông tin sử dụng
                                      </Typography>
                                      <Stack spacing={1.5}>
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">Cách dùng</Typography>
                                          <Typography variant="body2">
                                            {detail.usage || 'Chưa có'}
                                          </Typography>
                                        </Box>
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">Công dụng</Typography>
                                          <Typography variant="body2">
                                            {detail.benefit || 'Chưa có'}
                                          </Typography>
                                        </Box>
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">Tác dụng phụ</Typography>
                                          <Typography variant="body2">
                                            {detail.sideEffect || 'Chưa có'}
                                          </Typography>
                                        </Box>
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">Ghi chú</Typography>
                                          <Typography variant="body2">
                                            {detail.note || 'Chưa có'}
                                          </Typography>
                                        </Box>
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">Bảo quản</Typography>
                                          <Typography variant="body2">
                                            {detail.preserve || 'Chưa có'}
                                          </Typography>
                                        </Box>
                                      </Stack>
                                    </CardContent>
                                  </Card>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Card sx={{ mb: 2 }}>
                                    <CardContent>
                                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                                        Thành phần & Hình ảnh
                                      </Typography>
                                      <Stack spacing={1.5}>
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">Thành phần</Typography>
                                          {detail.ingredients && Array.isArray(detail.ingredients) && detail.ingredients.length > 0 ? (
                                            <Box sx={{ mt: 1 }}>
                                              {detail.ingredients.map((ing, idx) => (
                                                <Chip
                                                  key={idx}
                                                  label={`${ing.name}${ing.amount ? ` - ${ing.amount} ${ing.unit || ''}` : ''}`}
                                                  size="small"
                                                  sx={{ mr: 0.5, mb: 0.5 }}
                                                />
                                              ))}
                                            </Box>
                                          ) : (
                                            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>Chưa có</Typography>
                                          )}
                                        </Box>
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">Hình ảnh ({detail.images?.length || 0})</Typography>
                                          {detail.images && Array.isArray(detail.images) && detail.images.length > 0 ? (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                              {detail.images.map((img, idx) => (
                                                <Avatar
                                                  key={idx}
                                                  src={img}
                                                  variant="rounded"
                                                  sx={{
                                                    width: 80,
                                                    height: 80,
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                      transform: 'scale(1.1)',
                                                      transition: 'transform 0.2s'
                                                    }
                                                  }}
                                                  onClick={() => window.open(img, '_blank')}
                                                />
                                              ))}
                                            </Box>
                                          ) : (
                                            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>Chưa có hình ảnh</Typography>
                                          )}
                                        </Box>
                                      </Stack>
                                    </CardContent>
                                  </Card>
                                </Grid>
                                <Grid item xs={12}>
                                  <Card sx={{ mb: 2 }}>
                                    <CardContent>
                                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                                        Thao tác
                                      </Typography>
                                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                        <Button
                          variant="outlined"
                          startIcon={<EditIcon />}
                                          onClick={() => handleEditProduct(productId)}
                                          sx={{ 
                                            textTransform: 'none', 
                                            fontWeight: 700,
                                            minWidth: 150
                                          }}
                        >
                          Chỉnh sửa
                        </Button>
                                        <Button
                                          variant="contained"
                                          color="secondary"
                                          startIcon={<LocalOfferIcon />}
                                          onClick={() => {
                                            setDiscountProductId(productId);
                                            setDiscountForm({
                                              percent: '',
                                              message: '',
                                              startDate: '',
                                              endDate: ''
                                            });
                                            setDiscountDialogOpen(true);
                                          }}
                                          sx={{ 
                                            textTransform: 'none', 
                                            fontWeight: 700,
                                            minWidth: 150,
                                            background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
                                            '&:hover': {
                                              background: 'linear-gradient(45deg, #FF5252 30%, #FF7043 90%)',
                                            }
                                          }}
                                        >
                                          Tạo Discount
                                        </Button>
                                        <Button
                                          variant="outlined"
                                          color="error"
                                          startIcon={<DeleteIcon />}
                                          onClick={() => {
                                            setProductToDelete(product);
                                            setDeleteDialogOpen(true);
                                          }}
                                          sx={{ 
                                            textTransform: 'none', 
                                            fontWeight: 700,
                                            minWidth: 150,
                                            borderColor: 'error.main',
                                            color: 'error.main',
                                            '&:hover': {
                                              borderColor: 'error.dark',
                                              bgcolor: 'error.light',
                                              color: 'error.dark'
                                            }
                                          }}
                                        >
                                          Xóa
                                        </Button>
                                        <Button
                                          variant="contained"
                                          color="info"
                                          startIcon={<QuestionAnswerIcon />}
                                          onClick={() => {
                                            setFaqProductId(productId);
                                            setFaqForm({
                                              question: '',
                                              answer: ''
                                            });
                                            setFaqDialogOpen(true);
                                          }}
                                          sx={{ 
                                            textTransform: 'none', 
                                            fontWeight: 700,
                                            minWidth: 150,
                                            background: 'linear-gradient(45deg, #42a5f5 30%, #1e88e5 90%)',
                                            '&:hover': {
                                              background: 'linear-gradient(45deg, #1e88e5 30%, #1565c0 90%)',
                                            }
                                          }}
                                        >
                                          Tạo FAQ
                                        </Button>
                                      </Box>
                                    </CardContent>
                                  </Card>
                                </Grid>
                                {detail.frequentlies && Array.isArray(detail.frequentlies) && detail.frequentlies.length > 0 && (
                                  <Grid item xs={12}>
                                    <Card sx={{ mb: 2 }}>
                                      <CardContent>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                                          Câu hỏi thường gặp ({detail.frequentlies.length})
                                        </Typography>
                                        <Stack spacing={2}>
                                          {detail.frequentlies.map((faq, index) => (
                                            <Box
                                              key={faq.id || index}
                                              sx={{
                                                p: 2,
                                                bgcolor: 'grey.50',
                                                borderRadius: 2,
                                                border: '1px solid',
                                                borderColor: 'divider'
                                              }}
                                            >
                                              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
                                                Q: {faq.question}
                                              </Typography>
                                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                A: {faq.answer}
                                              </Typography>
                                              {faq.createdDate && (
                                                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
                                                  Ngày tạo: {faq.createdDate}
                                                </Typography>
                                              )}
                                            </Box>
                                          ))}
                                        </Stack>
                                      </CardContent>
                                    </Card>
                                  </Grid>
                                )}
                              </Grid>
                            ) : (
                              <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Không thể tải chi tiết sản phẩm
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                    </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}


          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: 2, 
            p: 3,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'grey.50'
          }}>
            <Button 
              variant="outlined" 
              disabled={currentPage === 0 || loading} 
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            >
              Trang trước
            </Button>
            <Typography variant="body2">Trang {currentPage + 1}</Typography>
            <Button 
              variant="outlined" 
              disabled={!hasNext || loading} 
              onClick={() => setCurrentPage(p => p + 1)}
            >
              Trang sau
            </Button>
          </Box>
        </Paper>
        <Dialog 
          open={addOpen} 
          onClose={handleCloseAdd} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>
            {isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </DialogTitle>
          <DialogContent dividers sx={{ maxHeight: '70vh', overflow: 'auto' }}>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
                  Thông tin cơ bản
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Tên sản phẩm *" 
                  name="name" 
                  value={form.name} 
                  onChange={handleChange} 
                  fullWidth 
                  required 
                  size="small"
                  placeholder="Nhập tên sản phẩm"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Giá *" 
                  name="price" 
                  type="number" 
                  value={form.price} 
                  onChange={handleChange} 
                  fullWidth 
                  required 
                  size="small"
                  placeholder="Nhập giá sản phẩm"
                  InputProps={{
                    endAdornment: <Typography variant="caption" sx={{ mr: 1 }}>{form.currency}</Typography>
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  label="Mô tả" 
                  name="description" 
                  value={form.description} 
                  onChange={handleChange} 
                  fullWidth 
                  multiline 
                  rows={2} 
                  size="small"
                  placeholder="Nhập mô tả sản phẩm"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField 
                  select 
                  label="Tiền tệ" 
                  name="currency" 
                  value={form.currency} 
                  onChange={handleChange} 
                  fullWidth 
                  size="small"
                >
                  <MenuItem value="VND">VND</MenuItem>
                  <MenuItem value="USD">USD</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField 
                  label="Số lượng" 
                  name="quantity" 
                  type="number" 
                  value={form.quantity} 
                  onChange={handleChange} 
                  fullWidth 
                  size="small"
                  placeholder="Nhập số lượng"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField 
                  select 
                  label="Precription" 
                  name="precription" 
                  value={form.precription} 
                  onChange={handleChange} 
                  fullWidth 
                  size="small"
                >
                  <MenuItem value="true">Có</MenuItem>
                  <MenuItem value="false">Không</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sx={{ mt: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
                  Ngày tháng
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Ngày sản xuất" 
                  name="productDate" 
                  type="date"
                  value={form.productDate} 
                  onChange={handleChange} 
                  fullWidth 
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Hạn sử dụng" 
                  name="expirationDate" 
                  type="date"
                  value={form.expirationDate} 
                  onChange={handleChange} 
                  fullWidth 
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sx={{ mt: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
                  Liên kết danh mục & nhà sản xuất
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  select
                  name="manufacturerId"
                  value={form.manufacturerId}
                  onChange={handleChange}
                  fullWidth 
                  size="small"
                  placeholder="Chọn nhà sản xuất"
                  helperText={loadingManufacturers ? 'Đang tải danh sách...' : ''}
                  SelectProps={{ displayEmpty: true }}
                >
                  <MenuItem value="">
                    <em>Chọn nhà sản xuất</em>
                  </MenuItem>
                  {manufacturers.map((m) => (
                    <MenuItem key={m.id} value={m.id}>
                      {m.name}
                    </MenuItem>
                  ))}
                  {!loadingManufacturers && manufacturers.length === 0 && (
                    <MenuItem disabled>
                      Không có dữ liệu
                    </MenuItem>
                  )}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  fullWidth 
                  size="small"
                  placeholder="Chọn danh mục"
                  helperText={loadingCategories ? 'Đang tải danh sách...' : ''}
                  SelectProps={{ displayEmpty: true }}
                >
                  <MenuItem value="">
                    <em>Chọn danh mục</em>
                  </MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                  {!loadingCategories && categories.length === 0 && (
                    <MenuItem disabled>
                      Không có dữ liệu
                    </MenuItem>
                  )}
                </TextField>
              </Grid>

              <Grid item xs={12} sx={{ mt: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
                  Thông tin chi tiết
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  label="Cách dùng (usage)" 
                  name="usage" 
                  value={form.usage} 
                  onChange={handleChange} 
                  fullWidth 
                  multiline
                  rows={2}
                  size="small"
                  placeholder="Hướng dẫn cách sử dụng sản phẩm"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  label="Công dụng (benefit)" 
                  name="benefit" 
                  value={form.benefit} 
                  onChange={handleChange} 
                  fullWidth 
                  multiline
                  rows={2}
                  size="small"
                  placeholder="Mô tả công dụng của sản phẩm"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  label="Tác dụng phụ (sideEffect)" 
                  name="sideEffect" 
                  value={form.sideEffect} 
                  onChange={handleChange} 
                  fullWidth 
                  multiline
                  rows={2}
                  size="small"
                  placeholder="Mô tả tác dụng phụ (nếu có)"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  label="Ghi chú (note)" 
                  name="note" 
                  value={form.note} 
                  onChange={handleChange} 
                  fullWidth 
                  multiline
                  rows={2}
                  size="small"
                  placeholder="Ghi chú thêm về sản phẩm"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  label="Bảo quản (preserve)" 
                  name="preserve" 
                  value={form.preserve} 
                  onChange={handleChange} 
                  fullWidth 
                  multiline
                  rows={2}
                  size="small"
                  placeholder="Hướng dẫn bảo quản sản phẩm"
                />
              </Grid>

              <Grid item xs={12} sx={{ mt: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
                  Thông tin bổ sung
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField 
                  label="Đơn vị (unit)" 
                  name="unit" 
                  value={form.unit} 
                  onChange={handleChange} 
                  fullWidth 
                  size="small"
                  placeholder="VD: Chai, Hộp, Viên..."
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField 
                  label="Vị trí (position)" 
                  name="position" 
                  type="number"
                  value={form.position} 
                  onChange={handleChange} 
                  fullWidth 
                  size="small"
                  placeholder="VD: 0, 1, 2..."
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField 
                  select 
                  label="Trạng thái (isActive)" 
                  name="isActive" 
                  value={form.isActive ? '1' : '0'}
                  onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.value === '1' }))}
                  fullWidth 
                  size="small"
                >
                  <MenuItem value="1">Hoạt động</MenuItem>
                  <MenuItem value="0">Không hoạt động</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sx={{ mt: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Thành phần (Ingredients)
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleAddIngredient}
                    sx={{ minWidth: 'auto' }}
                  >
                    Thêm thành phần
                  </Button>
                </Box>
                <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2, bgcolor: 'grey.50' }}>
                  {ingredients.map((ingredient, index) => (
                    <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'white', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                          Thành phần {index + 1}
                        </Typography>
                        {ingredients.length > 1 && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveIngredient(index)}
                            sx={{ minWidth: 'auto', width: 32, height: 32 }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                      <Grid container spacing={1.5}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Tên thành phần"
                            value={ingredient.name}
                            onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                            fullWidth
                            size="small"
                            placeholder="Ví dụ: Paracetamol"
                          />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <TextField
                            label="Số lượng"
                            type="number"
                            value={ingredient.amount}
                            onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                            fullWidth
                            size="small"
                            placeholder="500"
                          />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <TextField
                            label="Đơn vị"
                            value={ingredient.unit}
                            onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                            fullWidth
                            size="small"
                            placeholder="mg, ml, g..."
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            label="Mô tả"
                            value={ingredient.description}
                            onChange={(e) => handleIngredientChange(index, 'description', e.target.value)}
                            fullWidth
                            multiline
                            rows={1}
                            size="small"
                            placeholder="Mô tả về thành phần này"
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                  {ingredients.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      Chưa có thành phần nào. Nhấn "Thêm thành phần" để thêm.
                    </Typography>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} sx={{ mt: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
                  Hình ảnh
                </Typography>
                <Button variant="outlined" component="label" size="small" startIcon={<AddIcon />}>
                  Chọn ảnh (nhiều ảnh)
                  <input type="file" hidden multiple accept="image/*" onChange={handleImagesChange} />
                </Button>
                <Typography variant="caption" sx={{ ml: 2, color: images.length ? 'success.main' : 'text.secondary' }}>
                  {images.length ? `${images.length} file đã chọn` : 'Chưa chọn ảnh'}
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={handleCloseAdd} 
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button 
              onClick={handleSubmitAdd} 
              variant="contained" 
              disabled={submitting}
            >
              {submitting ? <CircularProgress size={20} color="inherit" /> : isEdit ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={discountDialogOpen}
          onClose={() => !submittingDiscount && setDiscountDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 700, pb: 1, background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalOfferIcon />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Tạo mã giảm giá cho sản phẩm
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent dividers sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Phần trăm giảm giá (%) *"
                  name="percent"
                  type="number"
                  value={discountForm.percent}
                  onChange={handleDiscountChange}
                  fullWidth
                  required
                  size="small"
                  inputProps={{ min: 0, max: 100, step: 0.1 }}
                  placeholder="VD: 12.5"
                  helperText="Nhập phần trăm giảm giá (0-100)"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Thông điệp giảm giá *"
                  name="message"
                  value={discountForm.message}
                  onChange={handleDiscountChange}
                  fullWidth
                  required
                  size="small"
                  placeholder="VD: Giảm giá mùa thu"
                  helperText="Nhập thông điệp hiển thị cho khách hàng"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Ngày bắt đầu *"
                  name="startDate"
                  type="datetime-local"
                  value={discountForm.startDate}
                  onChange={handleDiscountChange}
                  fullWidth
                  required
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  helperText="Chọn ngày và giờ bắt đầu"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Ngày kết thúc *"
                  name="endDate"
                  type="datetime-local"
                  value={discountForm.endDate}
                  onChange={handleDiscountChange}
                  fullWidth
                  required
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  helperText="Chọn ngày và giờ kết thúc"
                />
              </Grid>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mt: 1 }}>
                  <Typography variant="caption">
                    <strong>Lưu ý:</strong> Mã giảm giá sẽ tự động áp dụng cho sản phẩm trong khoảng thời gian đã chọn.
                    Ngày bắt đầu sẽ được set vào 00:00:00 và ngày kết thúc sẽ được set vào 23:59:59.
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setDiscountDialogOpen(false)}
              disabled={submittingDiscount}
              sx={{ fontWeight: 600 }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmitDiscount}
              variant="contained"
              disabled={submittingDiscount}
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #FF5252 30%, #FF7043 90%)',
                }
              }}
            >
              {submittingDiscount ? (
                <>
                  <CircularProgress size={16} sx={{ mr: 1 }} color="inherit" />
                  Đang tạo...
                </>
              ) : (
                'Tạo Discount'
              )}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={deleteDialogOpen}
          onClose={() => !deleting && setDeleteDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 700, pb: 1, color: 'error.main' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DeleteIcon />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Xác nhận xóa sản phẩm
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent dividers sx={{ mt: 2 }}>
            {productToDelete && (
              <Box>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                    Bạn có chắc chắn muốn xóa sản phẩm này?
                  </Typography>
                  <Typography variant="body2">
                    Hành động này không thể hoàn tác. Sản phẩm sẽ bị xóa vĩnh viễn khỏi hệ thống.
                  </Typography>
                </Alert>
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
                    Thông tin sản phẩm sẽ bị xóa:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {productToDelete.name}
                  </Typography>
                  {productToDelete.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {productToDelete.description}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    <Chip 
                      label={`ID: ${productToDelete.id || productToDelete.productId}`} 
                      size="small" 
                      variant="outlined" 
                    />
                    {productToDelete.originPrice && (
                      <Chip 
                        label={`Giá: ${formatCurrencyVnd(productToDelete.originPrice)}`} 
                        size="small" 
                        variant="outlined" 
                      />
                    )}
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
              sx={{ fontWeight: 600 }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleDeleteProduct}
              variant="contained"
              color="error"
              disabled={deleting}
              startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
              sx={{
                fontWeight: 700,
                '&:hover': {
                  bgcolor: 'error.dark'
                }
              }}
            >
              {deleting ? 'Đang xóa...' : 'Xóa sản phẩm'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={deletedProductsDialogOpen}
          onClose={handleCloseDeletedProducts}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              maxHeight: '90vh'
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 700, pb: 1, background: 'linear-gradient(45deg, #f44336 30%, #e91e63 90%)', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DeleteOutlineIcon />
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Sản phẩm đã xóa
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title={deletedProductsSort === 'createdAt,desc' ? 'Sắp xếp tăng dần' : 'Sắp xếp giảm dần'}>
                  <IconButton
                    onClick={handleToggleDeletedProductsSort}
                    sx={{ color: 'white' }}
                    size="small"
                  >
                    {deletedProductsSort === 'createdAt,desc' ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Làm mới">
                  <IconButton
                    onClick={loadDeletedProducts}
                    sx={{ color: 'white' }}
                    size="small"
                    disabled={loadingDeletedProducts}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent dividers sx={{ mt: 2, p: 0 }}>
            {loadingDeletedProducts ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : deletedProducts.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <DeleteOutlineIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  Chưa có sản phẩm đã xóa
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Danh sách sản phẩm đã xóa trống
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Hình ảnh</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Tên sản phẩm</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Mô tả</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Giá gốc</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Giảm giá</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Tồn kho</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Đã bán</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Đánh giá</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 2 }}>NSX</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 2 }}>HSD</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 2, textAlign: 'center' }}>Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {deletedProducts.map((product, index) => (
                      <TableRow
                        key={product.id || index}
                        sx={{
                          '&:hover': {
                            bgcolor: 'grey.50',
                            transition: 'all 0.2s ease-in-out'
                          },
                          transition: 'all 0.2s ease-in-out',
                          opacity: 0.8
                        }}
                      >
                        <TableCell>
                          <Avatar 
                            src={product.imageUrl} 
                            variant="rounded" 
                            sx={{ 
                              width: 60, 
                              height: 60, 
                              borderRadius: 2
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {product.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              maxWidth: 300,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }} 
                            color="text.secondary"
                          >
                            {product.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AttachMoneyIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {formatCurrencyVnd(product.originPrice)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {product.discountPercent && Number(product.discountPercent) > 0 ? (
                            <Box>
                              <Chip 
                                label={`-${Number(product.discountPercent).toFixed(1)}%`} 
                                color="error" 
                                size="small" 
                                sx={{ fontWeight: 600, mb: 0.5 }} 
                              />
                              <Typography variant="caption" color="success.main" sx={{ fontWeight: 600, display: 'block' }}>
                                {formatCurrencyVnd(product.discountPrice)}
                              </Typography>
                            </Box>
                          ) : (
                            <Chip 
                              label="0%" 
                              size="small" 
                              variant="outlined" 
                              sx={{ fontWeight: 600 }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Inventory2Icon sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {product.quantity?.toLocaleString('vi-VN') || 0}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <ShoppingCartIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {product.soldQuantity?.toLocaleString('vi-VN') || 0}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <StarIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {Number(product.ratingAvg || 0).toFixed(1)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {product.productDate || '-'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <EventIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {product.expirationDate || '-'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Khôi phục sản phẩm">
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              startIcon={restoringProduct[product.id] ? <CircularProgress size={16} color="inherit" /> : <RestoreIcon />}
                              onClick={() => handleRestoreProduct(product.id)}
                              disabled={restoringProduct[product.id]}
                              sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                minWidth: 120,
                                background: 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)',
                                '&:hover': {
                                  background: 'linear-gradient(45deg, #388e3c 30%, #4caf50 90%)',
                                },
                                '&:disabled': {
                                  background: 'grey.300'
                                }
                              }}
                            >
                              {restoringProduct[product.id] ? 'Đang khôi phục...' : 'Khôi phục'}
                            </Button>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <Typography variant="body2" color="text.secondary">
                {deletedProducts.length > 0 && `Hiển thị ${deletedProducts.length} sản phẩm`}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  disabled={deletedProductsPage === 0 || loadingDeletedProducts} 
                  onClick={() => setDeletedProductsPage(p => Math.max(0, p - 1))}
                  size="small"
                >
                  Trang trước
                </Button>
                <Typography variant="body2">Trang {deletedProductsPage + 1}</Typography>
                <Button 
                  variant="outlined" 
                  disabled={!deletedProductsHasNext || loadingDeletedProducts} 
                  onClick={() => setDeletedProductsPage(p => p + 1)}
                  size="small"
                >
                  Trang sau
                </Button>
              </Box>
            </Box>
          </DialogActions>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button
              onClick={handleCloseDeletedProducts}
              variant="contained"
              sx={{ fontWeight: 600 }}
            >
              Đóng
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={faqDialogOpen}
          onClose={() => !submittingFAQ && setFaqDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 700, pb: 1, background: 'linear-gradient(45deg, #42a5f5 30%, #1e88e5 90%)', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <QuestionAnswerIcon />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Tạo câu hỏi thường gặp
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent dividers sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Câu hỏi *"
                  name="question"
                  value={faqForm.question}
                  onChange={handleFAQChange}
                  fullWidth
                  required
                  multiline
                  rows={3}
                  size="medium"
                  placeholder="Nhập câu hỏi thường gặp..."
                  helperText="Nhập câu hỏi mà khách hàng thường hỏi về sản phẩm"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Câu trả lời *"
                  name="answer"
                  value={faqForm.answer}
                  onChange={handleFAQChange}
                  fullWidth
                  required
                  multiline
                  rows={4}
                  size="medium"
                  placeholder="Nhập câu trả lời cho câu hỏi..."
                  helperText="Nhập câu trả lời chi tiết cho câu hỏi"
                />
              </Grid>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mt: 1 }}>
                  <Typography variant="caption">
                    <strong>Lưu ý:</strong> Câu hỏi và câu trả lời sẽ được hiển thị công khai cho khách hàng xem. Vui lòng đảm bảo thông tin chính xác và hữu ích.
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setFaqDialogOpen(false)}
              disabled={submittingFAQ}
              sx={{ fontWeight: 600 }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmitFAQ}
              variant="contained"
              disabled={submittingFAQ}
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #42a5f5 30%, #1e88e5 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1e88e5 30%, #1565c0 90%)',
                }
              }}
            >
              {submittingFAQ ? (
                <>
                  <CircularProgress size={16} sx={{ mr: 1 }} color="inherit" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <QuestionAnswerIcon sx={{ mr: 1, fontSize: 18 }} />
                  Tạo FAQ
                </>
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  );
};

export default AdminProducts;


