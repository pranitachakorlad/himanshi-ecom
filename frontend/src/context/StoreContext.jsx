import { createContext, useContext, useMemo, useState } from "react";
import { products } from "../data/products";

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (message) => {
    setToast(message);
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => setToast(""), 2400);
  };

  const addToCart = (product, quantity = 1) => {
    setCart((items) => {
      const existing = items.find((item) => item.id === product.id);
      if (existing) {
        return items.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...items, { ...product, quantity }];
    });
    showToast(`${product.name} added to cart`);
  };

  const updateQuantity = (id, quantity) => {
    setCart((items) =>
      items.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item))
    );
  };

  const removeFromCart = (id) => {
    setCart((items) => items.filter((item) => item.id !== id));
    showToast("Item removed from cart");
  };

  const toggleWishlist = (product) => {
    setWishlist((items) => {
      const saved = items.some((item) => item.id === product.id);
      showToast(saved ? "Removed from wishlist" : "Saved to wishlist");
      return saved ? items.filter((item) => item.id !== product.id) : [...items, product];
    });
  };

  const buyNow = (product, quantity = 1) => {
    setCheckoutItems([{ ...product, quantity }]);
  };

  const startCheckoutFromCart = () => {
    setCheckoutItems(cart);
  };

  const clearOrder = () => {
    setCart([]);
    setCheckoutItems([]);
  };

  const wishlistIds = useMemo(() => new Set(wishlist.map((item) => item.id)), [wishlist]);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlist.length;
  const allProducts = products;

  const value = {
    allProducts,
    cart,
    wishlist,
    wishlistIds,
    cartCount,
    wishlistCount,
    checkoutItems,
    search,
    toast,
    setSearch,
    addToCart,
    updateQuantity,
    removeFromCart,
    toggleWishlist,
    buyNow,
    startCheckoutFromCart,
    clearOrder,
    setCheckoutItems,
    showToast,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used inside StoreProvider");
  }
  return context;
}
