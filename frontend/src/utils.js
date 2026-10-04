export const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export const discountPercent = (product) =>
  Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

export const cartSummary = (items) => {
  const subtotal = items.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = subtotal - total;
  const delivery = total > 25000 || total === 0 ? 0 : 499;
  return { subtotal, total: total + delivery, discount, delivery };
};
