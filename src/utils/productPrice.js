/**
 * Format currency to Vietnamese Dong (VND)
 */
export function formatCurrencyVnd(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value || 0));
}

/**
 * Calculate discounted price from origin price and discount percentage
 */
export function getDiscountedPrice(originPrice, discountPercent) {
  if (discountPercent === null || discountPercent === undefined || Number(discountPercent) === 0) {
    return Number(originPrice || 0);
  }
  return Number(originPrice || 0) * (1 - Number(discountPercent) / 100);
}

/**
 * Get final price (use discountPrice if available, otherwise calculate from discountPercent)
 */
export function getFinalPrice(product) {
  if (product?.discountPrice !== null && product?.discountPrice !== undefined) {
    return Number(product.discountPrice);
  }
  return getDiscountedPrice(product?.originPrice, product?.discountPercent);
}

