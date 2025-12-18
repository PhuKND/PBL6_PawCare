import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  Avatar,
  Grid,
  Paper,
  Chip,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Tooltip,
  Alert,
  Fab,
} from '@mui/material';
import {
  HelpOutline as HelpOutlineIcon,
  MenuBook as MenuBookIcon,
  Security as SecurityIcon,
  Checklist as ChecklistIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  Business as BusinessIcon,
  SupportAgent as SupportAgentIcon,
  BugReport as BugReportIcon,
  ExpandMore as ExpandMoreIcon,
  ArrowUpward as ArrowUpwardIcon,
} from '@mui/icons-material';

const sections = [
  { id: 'overview', label: 'Tổng quan quyền Admin' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'users', label: 'Quản lý Người dùng' },
  { id: 'orders', label: 'Quản lý Đơn hàng' },
  { id: 'products', label: 'Quản lý Sản phẩm' },
  { id: 'categories', label: 'Quản lý Danh mục' },
  { id: 'manufacturers', label: 'Nhà sản xuất' },
  { id: 'support', label: 'Hỗ trợ khách hàng' },
  { id: 'troubleshooting', label: 'Xử lý lỗi thường gặp' },
];

export default function AdminHDSD() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  const handleScrollTo = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 56,
                height: 56,
              }}
            >
              <MenuBookIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
                Hướng dẫn sử dụng quyền quản trị Admin
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Tài liệu này giúp bạn thao tác an toàn và hiệu quả với bảng điều khiển quản trị PawCare.
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2.5, borderRadius: 3 }} elevation={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1 }}>
                  <SecurityIcon color="primary" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Tôn trọng workflow
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Luôn chuyển trạng thái đơn theo đúng luồng PENDING → CONFIRMED → SHIPPING → COMPLETED
                  hoặc CANCELLED. Không bỏ qua bước để tránh sai lệch báo cáo.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2.5, borderRadius: 3 }} elevation={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1 }}>
                  <ChecklistIcon color="primary" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Kiểm tra trước khi xóa
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Đọc kỹ thông tin sản phẩm/danh mục/nhà sản xuất trước khi xóa hoặc khôi phục.
                  Hạn chế thao tác hàng loạt, ưu tiên xóa từng bản ghi có chủ đích.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2.5, borderRadius: 3 }} elevation={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1 }}>
                  <InventoryIcon color="primary" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Tạo sản phẩm chuẩn
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Luôn điền tối thiểu Tên sản phẩm và Giá, kiểm tra ngày sản xuất/hạn dùng,
                  số lượng tồn, nhà sản xuất và danh mục trước khi lưu.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2.5, borderRadius: 3 }} elevation={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1 }}>
                  <DashboardIcon color="primary" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Làm mới dữ liệu
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Khi nghi ngờ dữ liệu cũ hoặc sau khi cập nhật nhiều, hãy dùng nút <strong>Làm mới</strong>
                  ở từng module để tải lại từ server thay vì F5 toàn trang.
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Alert
            severity="info"
            sx={{ mb: 4, borderRadius: 2 }}
            icon={<HelpOutlineIcon />}
          >
            <Typography variant="body2">
              Tất cả trang quản trị đều được bảo vệ bởi{' '}
              <strong>ProtectedRoute</strong>. Chỉ người dùng có quyền <strong>ADMIN</strong> và đã đăng nhập
              mới truy cập được khu vực này.
            </Typography>
          </Alert>

          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2.5, borderRadius: 3, position: { md: 'sticky' }, top: 96 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <MenuBookIcon color="primary" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Mục lục
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  Chọn mục bên dưới để chuyển nhanh đến phần hướng dẫn tương ứng.
                </Typography>
                <Divider sx={{ mb: 1.5 }} />
                <List dense>
                  {sections.map((sec) => (
                    <ListItemButton
                      key={sec.id}
                      onClick={() => handleScrollTo(sec.id)}
                      sx={{
                        borderRadius: 1.5,
                        mb: 0.5,
                        '&:hover': { bgcolor: 'grey.100' },
                      }}
                    >
                      <ListItemText
                        primary={sec.label}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Paper>
            </Grid>

            <Grid item xs={12} md={9}>
              <Paper
                id="overview"
                sx={{ p: 3, borderRadius: 3, mb: 3 }}
                elevation={0}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <SecurityIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    A. Tổng quan quyền Admin
                  </Typography>
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Điều kiện truy cập
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  - Người dùng phải đăng nhập thành công và có role <strong>ADMIN</strong>.{' '}
                  Các route dưới <code>/admin</code> đều được bọc bởi <strong>ProtectedRoute</strong>, nếu
                  không đủ quyền hệ thống sẽ tự điều hướng về trang đăng nhập.
                </Typography>

                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Nguyên tắc thao tác an toàn
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  - Luôn đọc kỹ thông tin trước khi <strong>Cập nhật</strong> hoặc <strong>Xóa</strong>. <br />
                  - Hạn chế thao tác hàng loạt; ưu tiên xử lý từng bản ghi để dễ kiểm soát. <br />
                  - Với đơn hàng, bắt buộc tuân theo workflow trạng thái được mô tả trong phần Đơn hàng. <br />
                  - Sau mỗi thao tác, chờ đến khi hiển thị thông báo (Snackbar / Alert) rồi mới thao tác tiếp. <br />
                  - Nếu giao diện có nút <strong>Làm mới</strong>, hãy sử dụng để đồng bộ lại dữ liệu sau
                  khi cập nhật.
                </Typography>
              </Paper>

              <Accordion defaultExpanded id="dashboard" sx={{ borderRadius: 3, mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <DashboardIcon color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      1. Dashboard (Bảng điều khiển)
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Mục tiêu
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Nắm nhanh tình hình hoạt động của hệ thống: doanh thu, số đơn hàng, người dùng và sản
                    phẩm, đồng thời theo dõi đơn gần đây và sản phẩm bán chạy.
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Tác vụ thường gặp
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    1. Quan sát các thẻ thống kê:
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 2, mb: 1 }}>
                    - <strong>Tổng doanh thu</strong>: tổng tiền từ các đơn hàng thành công. <br />
                    - <strong>Tổng đơn hàng</strong>: số lượng đơn đã tạo. <br />
                    - <strong>Tổng người dùng</strong>: số tài khoản đã đăng ký. <br />
                    - <strong>Tổng sản phẩm</strong>: số sản phẩm hiện có trong hệ thống.
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    2. Sử dụng nút <strong>Làm mới</strong> (icon Refresh) ở góc trên để tải lại toàn bộ dữ
                    liệu thống kê.
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    3. Xem khu <strong>Đơn hàng gần đây</strong>: danh sách 10 đơn mới nhất, hiển thị mã
                    đơn, số điện thoại, tổng tiền và trạng thái.
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    4. Xem khu <strong>Sản phẩm bán chạy</strong>: liệt kê các sản phẩm có số lượng bán cao
                    nhất, kèm số lượng đã bán, đánh giá trung bình và giá hiện tại.
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Lưu ý / Quy tắc
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    - Số liệu thống kê thường được tổng hợp theo thời gian thực hoặc theo năm/tháng; nếu
                    nghi ngờ sai lệch hãy dùng nút làm mới. <br />
                    - Biểu đồ doanh thu theo tháng cho phép chọn năm, cần chọn đúng năm cần theo dõi. <br />
                    - Biểu đồ phân bố danh mục chỉ mang tính tham khảo tỷ lệ, không thay thế báo cáo chi
                    tiết.
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Mẹo xử lý lỗi
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    - Nếu số liệu không thay đổi sau khi cập nhật ở module khác, hãy bấm nút <strong>Làm mới</strong>{' '}
                    trên Dashboard. <br />
                    - Nếu biểu đồ trống, kiểm tra lại dữ liệu nguồn (đơn hàng / danh mục / sản phẩm) hoặc
                    khoảng thời gian lựa chọn.
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion id="users" sx={{ borderRadius: 3, mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <PeopleIcon color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      2. Quản lý Người dùng
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Mục tiêu
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Tìm kiếm, xem chi tiết và điều chỉnh trạng thái hoạt động của tài khoản người dùng.
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Tác vụ thường gặp
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    1. <strong>Tìm kiếm người dùng</strong>:
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 2, mb: 1 }}>
                    - Nhập <strong>username, email, họ tên, số điện thoại hoặc địa chỉ</strong> vào ô tìm
                    kiếm. <br />
                    - Hệ thống sẽ lọc danh sách theo từ khóa.
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    2. <strong>Xem chi tiết người dùng</strong>:
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 2, mb: 1 }}>
                    - Mở rộng dòng (expand nếu có UI hỗ trợ) để xem thông tin chi tiết: vai trò, địa chỉ,
                    lịch sử đơn, v.v.
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    3. <strong>Đổi trạng thái hoạt động</strong>:
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 2, mb: 2 }}>
                    - Sử dụng nút/chuyển đổi trạng thái để đặt <strong>Hoạt động</strong> hoặc{' '}
                    <strong>Không hoạt động</strong> (isActive true/false). <br />
                    - Nếu trường trạng thái là <strong>null</strong>, hệ thống có thể hiển thị là “Chưa xác
                    định” – nên cập nhật rõ ràng để tránh nhầm lẫn.
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Lưu ý / Quy tắc
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    - Mỗi lần thay đổi trạng thái, hệ thống sẽ gọi API cập nhật; <strong>không</strong> bấm
                    liên tục nhiều lần. <br />
                    - Chỉ tắt hoạt động với tài khoản vi phạm hoặc yêu cầu khóa từ người dùng. <br />
                    - Luôn đợi đến khi xuất hiện Snackbar/thông báo để xác nhận thao tác thành công hoặc thất
                    bại.
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Mẹo xử lý lỗi
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    - Nếu đổi trạng thái không thành công, kiểm tra lại quyền ADMIN và kết nối mạng. <br />
                    - Nếu danh sách trống, thử xóa từ khóa tìm kiếm hoặc bấm nút làm mới (nếu có).
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion id="orders" sx={{ borderRadius: 3, mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <ShoppingCartIcon color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      3. Quản lý Đơn hàng
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Mục tiêu
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Theo dõi, tìm kiếm và cập nhật trạng thái xử lý đơn hàng của khách.
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Tác vụ thường gặp
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    1. <strong>Tìm kiếm đơn hàng</strong>:
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 2, mb: 1 }}>
                    - Nhập <strong>mã đơn, số điện thoại, địa chỉ hoặc trạng thái</strong> vào ô tìm kiếm.{' '}
                    <br />
                    - Kết hợp bộ lọc trạng thái (nếu có) để thu hẹp kết quả.
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    2. <strong>Xem chi tiết đơn</strong>:
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 2, mb: 1 }}>
                    - Mở rộng dòng (expand) để xem danh sách sản phẩm trong đơn, phí, ghi chú, trạng thái
                    thanh toán, địa chỉ giao hàng.
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Workflow trạng thái hợp lệ
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    - <strong>PENDING</strong> → <strong>CONFIRMED</strong> hoặc <strong>CANCELLED</strong>{' '}
                    (xác nhận hoặc hủy). <br />
                    - <strong>CONFIRMED</strong> → <strong>SHIPPING</strong> hoặc{' '}
                    <strong>CANCELLED</strong> (bắt đầu giao hoặc hủy). <br />
                    - <strong>SHIPPING</strong> → <strong>COMPLETED</strong> hoặc{' '}
                    <strong>CANCELLED</strong> (giao xong hoặc hủy khi đang giao). <br />
                    - <strong>COMPLETED</strong> / <strong>CANCELLED</strong>: <strong>không</strong> được
                    chuyển tiếp nữa. <br />
                    - Nếu thao tác sai luồng, hệ thống sẽ hiển thị cảnh báo hoặc từ chối cập nhật.
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Trạng thái thanh toán
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    - <strong>SUCCESS</strong> / <strong>PENDING</strong> / <strong>FAILED</strong> chỉ mang
                    tính theo dõi kết quả thanh toán (VNPAY/COD). <br />
                    - Admin <strong>không</strong> được sửa trạng thái thanh toán thủ công trừ khi có luồng
                    hỗ trợ riêng.
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Sắp xếp & lọc
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    - Có thể sắp xếp đơn theo <strong>ngày tạo, tổng tiền, trạng thái</strong> bằng cách
                    click vào tiêu đề cột (nếu UI hỗ trợ sort). <br />
                    - Kết hợp sort + tìm kiếm để kiểm soát đơn hàng theo từng giai đoạn.
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Mẹo xử lý lỗi
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    - Nếu không chuyển được trạng thái, kiểm tra xem có đang cố nhảy sai luồng (ví dụ PENDING
                    → SHIPPING). <br />
                    - Nếu tổng tiền hiển thị bất thường, mở chi tiết đơn kiểm tra lại từng dòng sản phẩm.{' '}
                    <br />
                    - Khi gặp lỗi mạng, tránh bấm lại nhiều lần nút cập nhật để không tạo nhiều request.
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion id="products" sx={{ borderRadius: 3, mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <InventoryIcon color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      4. Quản lý Sản phẩm
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Mục tiêu
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Tạo mới, chỉnh sửa, xóa/khôi phục và cấu hình chi tiết cho sản phẩm (giá, tồn kho,
                    thành phần, FAQ, khuyến mãi).
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Tác vụ thường gặp
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    1. <strong>Tìm kiếm & phân trang</strong>:
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 2, mb: 1 }}>
                    - Nhập tên hoặc mô tả sản phẩm để lọc danh sách. <br />
                    - Sử dụng điều khiển phân trang (nếu có) để di chuyển giữa các trang; bấm nút{' '}
                    <strong>Làm mới</strong> để tải lại dữ liệu mới nhất.
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    2. <strong>Thêm / Chỉnh sửa sản phẩm</strong>:
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 2, mb: 2 }}>
                    - Mở dialog/form sản phẩm. <br />
                    - <strong>Trường bắt buộc</strong>: Tên sản phẩm, Giá bán (originPrice hoặc discountPrice
                    tùy thiết kế). <br />
                    - Các trường phổ biến khác: mô tả, số lượng (quantity), ngày sản xuất / hạn dùng, nhà
                    sản xuất, danh mục, usage, benefit, sideEffect, note, preserve, đơn vị tính, vị trí hiển
                    thị (position), isActive, prescription/precription (thuốc kê đơn). <br />
                    - Upload ảnh: chọn một hoặc nhiều ảnh (tùy UI), ảnh sẽ được đính kèm trong FormData.
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    3. <strong>Thành phần (ingredients)</strong>:
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 2, mb: 2 }}>
                    - Thêm/xóa dòng thành phần trực tiếp trong form. <br />
                    - Hệ thống gom dữ liệu thành phần thành một mảng và gửi lên backend dưới dạng{' '}
                    <strong>JSON string</strong> trong FormData. <br />
                    - Chỉ gửi trường ingredients nếu có ít nhất một thành phần hợp lệ (đã nhập tên/hàm
                    lượng).
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Lưu ý về ngày tháng
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    - Input trên form thường là kiểu <strong>date</strong> dạng <code>YYYY-MM-DD</code>. <br />
                    - Khi gửi lên API, có thể cần chuyển sang <strong>DD/MM/YYYY</strong> hoặc{' '}
                    <strong>YYYY/MM/DD</strong> tùy endpoint; cần kiểm tra kỹ logic chuyển đổi đang dùng trước
                    khi chỉnh sửa. <br />
                    - Luôn xác nhận lại trên giao diện chi tiết sản phẩm sau khi lưu.
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Giảm giá (Discount)
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    - Mở dialog tạo khuyến mãi cho sản phẩm. <br />
                    - Nhập phần trăm giảm giá: <strong>0 &le; percent &le; 100</strong>. <br />
                    - Chọn thời gian bắt đầu và kết thúc bằng input <strong>datetime-local</strong>; khi gửi
                    API cần chuyển thành chuỗi <strong>YYYY/MM/DD HH:mm:ss</strong>. <br />
                    - Thường đặt <code>endDate</code> đến <strong>23:59:59</strong> của ngày kết thúc để
                    khuyến mãi kéo dài hết ngày. <br />
                    - Form nên hiển thị rõ thông báo lỗi khi percent ngoài khoảng hoặc khi startDate &gt;
                    endDate.
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    FAQ (Câu hỏi thường gặp)
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    - Sử dụng form tạo Q/A cho sản phẩm, gửi dữ liệu đến endpoint FAQ tương ứng. <br />
                    - Bắt buộc điền đầy đủ cả <strong>question</strong> và <strong>answer</strong>; tránh
                    để trống một trong hai.
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Xóa & Khôi phục sản phẩm
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    - Sản phẩm có thể được <strong>xóa mềm (soft delete)</strong>, chuyển sang danh sách “Đã
                    xóa”. <br />
                    - Từ danh sách này, admin có thể <strong>khôi phục</strong> sản phẩm hoặc xóa vĩnh viễn
                    (tùy tính năng hiện có). <br />
                    - Trước khi xóa hoặc khôi phục, cần xác nhận kỹ bằng hộp thoại confirm để tránh thao tác
                    nhầm.
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Mẹo xử lý lỗi
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    - Nếu lưu sản phẩm báo lỗi về ngày, kiểm tra lại format gửi lên backend. <br />
                    - Nếu ảnh không hiển thị sau khi upload, thử giảm dung lượng hoặc chọn lại file hợp lệ
                    (JPG, PNG, WEBP). <br />
                    - Khi chỉnh sửa sản phẩm đã có khuyến mãi, cần kiểm tra lại giá hiển thị trong trang chi
                    tiết.
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion id="categories" sx={{ borderRadius: 3, mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CategoryIcon color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      5. Quản lý Danh mục
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Mục tiêu
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Tổ chức sản phẩm theo các nhóm danh mục rõ ràng, dễ tìm kiếm.
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Tác vụ thường gặp
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    1. <strong>Tìm kiếm danh mục</strong>:
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 2, mb: 1 }}>
                    - Nhập tên hoặc mô tả danh mục để lọc danh sách.
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    2. <strong>Thêm danh mục</strong>:
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 2, mb: 2 }}>
                    - Bấm nút <strong>Thêm danh mục</strong> để mở <strong>AddCategoryModal</strong>. <br />
                    - Điền <strong>name</strong>, mô tả (description) và chọn ảnh đại diện (optional). <br />
                    - Lưu thành công, danh mục mới sẽ xuất hiện ở đầu danh sách.
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    3. <strong>Chỉnh sửa danh mục</strong>:
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 2, mb: 2 }}>
                    - Chọn hành động <strong>Chỉnh sửa</strong> trong menu của từng dòng. <br />
                    - Cập nhật name, description, position. <br />
                    - Sử dụng hai công tắc <strong>active</strong> và <strong>deleted</strong> để điều chỉnh
                    trạng thái hiển thị / ẩn / đã xóa. <br />
                    - Có thể upload ảnh thumbnail mới; nếu không chọn ảnh, ảnh cũ sẽ được giữ nguyên.
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Phân trang & làm mới
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    - Dùng thanh <strong>Pagination</strong> ở cuối bảng để chuyển trang. <br />
                    - Bấm nút <strong>Làm mới</strong> để đồng bộ dữ liệu sau khi thêm/sửa.
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Mẹo xử lý lỗi
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    - Nếu cập nhật không thành công, kiểm tra lại đã nhập tên danh mục chưa. <br />
                    - Khi không thấy danh mục mới trong danh sách sản phẩm, hãy đảm bảo sản phẩm đã gán vào
                    đúng categoryId.
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion id="manufacturers" sx={{ borderRadius: 3, mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <BusinessIcon color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      6. Nhà sản xuất (Manufacturers)
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Mục tiêu
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Quản lý danh sách nhà sản xuất thuốc/sản phẩm để gán cho sản phẩm và phục vụ thống kê.
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Tác vụ thường gặp
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    1. <strong>Tạo / Sửa nhà sản xuất</strong>:
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 2, mb: 2 }}>
                    - Mở dialog thêm hoặc chỉnh sửa. <br />
                    - <strong>name</strong> là bắt buộc; các trường khác (description, country, city, address,
                    phone, email, foundingDate, position, thumbnailUrl) nên được điền đầy đủ để thuận tiện tra
                    cứu. <br />
                    - Có thể upload ảnh logo nhà sản xuất; ảnh sẽ gửi dưới dạng <strong>image</strong> trong
                    FormData.
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Lưu ý về ngày thành lập (foundingDate)
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    - Input trên giao diện thường là <strong>YYYY-MM-DD</strong>. <br />
                    - Khi gửi lên backend, hệ thống đang chuyển thành <strong>YYYY/MM/DD</strong> (giống như
                    ví dụ từ Postman). <br />
                    - Admin cần nhập ngày hợp lệ, tránh giá trị không tồn tại (31/02, 00/00/0000...).
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Ảnh bắt buộc khi cập nhật
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    - Một số backend yêu cầu luôn có trường <strong>image</strong> trong FormData khi cập nhật
                    (PUT). <br />
                    - Nếu admin <strong>không thay đổi ảnh</strong>, hệ thống sẽ cố gắng tải lại ảnh hiện có
                    để gửi kèm. <br />
                    - Nếu ảnh gốc không tải được (CORS, lỗi mạng), hãy chọn thủ công một ảnh mới để tránh lỗi
                    “thiếu image”.
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Mẹo xử lý lỗi
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    - Khi gặp thông báo không thể lưu nhà sản xuất, đọc kỹ message trả về để biết trường nào
                    sai. <br />
                    - Nếu lỗi liên quan đến ảnh, thử chọn lại file nhỏ hơn hoặc định dạng phổ biến (JPG, PNG).
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion id="support" sx={{ borderRadius: 3, mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <SupportAgentIcon color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      7. Hỗ trợ khách hàng (AdminSupport)
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Mục tiêu
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Trả lời thắc mắc của người dùng thông qua giao diện trò chuyện tích hợp.
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Tác vụ thường gặp
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    1. <strong>Chọn cuộc trò chuyện</strong>:
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 2, mb: 1 }}>
                    - Bảng bên trái hiển thị danh sách cuộc trò chuyện theo user. <br />
                    - Chọn một user để mở <strong>ChatWindow</strong> tương ứng ở bên phải.
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    2. <strong>Trao đổi với khách</strong>:
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 2, mb: 2 }}>
                    - Nhập nội dung cần hỗ trợ và gửi. <br />
                    - Có thể sử dụng các câu trả lời nhanh như “Xin chào, PawCare xin hỗ trợ anh/chị”, “Vui
                    lòng cung cấp thêm thông tin bệnh, độ tuổi thú cưng…”.
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Lưu ý
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    - Trạng thái kết nối (connected/disconnected) cần được theo dõi ở phần header của
                    ChatWindow; nếu mất kết nối hãy thử tải lại trang. <br />
                    - <strong>adminUsername</strong> thường được lấy từ thông tin user trong{' '}
                    <code>localStorage</code>; đảm bảo admin đăng nhập hợp lệ trước khi chat.
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Mẹo xử lý lỗi
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    - Nếu không gửi được tin nhắn, kiểm tra kết nối internet và trạng thái server chat. <br />
                    - Nếu danh sách user trống, thử bấm làm mới hoặc kiểm tra lại quyền truy cập.
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion id="troubleshooting" sx={{ borderRadius: 3, mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <BugReportIcon color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      8. Xử lý lỗi thường gặp (Troubleshooting)
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Không tải được dữ liệu
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    - Kiểm tra lại kết nối mạng (WiFi/4G). <br />
                    - Đảm bảo <strong>accessToken</strong> còn hạn; nếu không, đăng xuất và đăng nhập lại.{' '}
                    <br />
                    - Kiểm tra biến môi trường <code>VITE_API_BASE_URL</code> và cấu hình trong{' '}
                    <code>src/api/http.js</code> có trỏ đúng API server.
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Upload ảnh lỗi
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    - Đảm bảo file là định dạng được hỗ trợ (JPG, PNG, WEBP…) và dung lượng không quá lớn.{' '}
                    <br />
                    - Nếu sử dụng FormData, chắc chắn rằng trường <strong>image</strong> đã được append trước
                    khi gửi. <br />
                    - Thử chọn lại ảnh khác hoặc giảm kích thước ảnh.
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Sai format ngày
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    - Đảm bảo input date/datetime-local nhập đúng dạng <strong>YYYY-MM-DD</strong> hoặc{' '}
                    <strong>YYYY-MM-DDTHH:mm</strong>. <br />
                    - Khi backend yêu cầu <strong>YYYY/MM/DD</strong> hoặc{' '}
                    <strong>YYYY/MM/DD HH:mm:ss</strong>, cần có bước chuyển đổi rõ ràng trong code. <br />
                    - So sánh với ví dụ từ Postman nếu có để kiểm tra.
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Không thấy mục admin
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    - Kiểm tra thông tin user trong <code>localStorage</code> có role <strong>ADMIN</strong>{' '}
                    hay không. <br />
                    - Nếu đăng nhập bằng tài khoản thường (USER), sẽ không nhìn thấy menu /admin và sẽ bị chặn
                    bởi <strong>ProtectedRoute</strong>. <br />
                    - Khi phân quyền mới, cần đăng xuất và đăng nhập lại để quyền được cập nhật.
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Box sx={{ textAlign: 'right', mt: 3 }}>
                <Tooltip title="Quay lại đầu trang">
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ArrowUpwardIcon />}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  >
                    Quay lại đầu trang
                  </Button>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </motion.div>

        {showBackToTop && (
          <Tooltip title="Quay lại đầu trang">
            <Fab
              color="primary"
              size="small"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              sx={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                boxShadow: 4,
              }}
            >
              <ArrowUpwardIcon />
            </Fab>
          </Tooltip>
        )}
      </Container>
    </Box>
  );
}


