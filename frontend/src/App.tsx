import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Heart,
  Search,
  ShoppingBag,
  User,
  Menu,
  Star,
  SlidersHorizontal,
  ChevronRight,
  Gem,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  X,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

gsap.registerPlugin(ScrollTrigger);

type Page = "home" | "listing" | "product" | "cart" | "wishlist" | "checkout";
type Category = "New Arrivals" | "Rings" | "Necklaces" | "Earrings" | "Bridal" | "Gift Boxes";
type Metal = "Champagne Gold" | "Platinum" | "Rose Gold" | "White Gold";
type Role = "user" | "sales" | "admin";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

interface Product {
  id: string | number;
  name: string;
  category: Category | string;
  metal: Metal;
  purity: string;
  diamond: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  createdAt: string;
  popularity: number;
  occasion: string;
  image: string;
  imageUrl?: string;
  sellerId?: string;
  palette: [string, string, string];
  description: string;
}

interface CartItem extends Product {
  quantity: number;
  selectedMetal?: Metal;
  selectedSize?: string;
}

interface Route {
  page: Page;
  productId?: string | number;
  category?: Category | "All";
}

interface StoreValue {
  session: Session | null;
  activeRole: Role;
  users: UserRecord[];
  orders: OrderRecord[];
  allProducts: Product[];
  cart: CartItem[];
  wishlist: Product[];
  wishlistIds: Set<string | number>;
  search: string;
  toast: string;
  cartCount: number;
  wishlistCount: number;
  checkoutItems: CartItem[];
  setSearch: (value: string) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setActiveRole: (role: Role) => void;
  createSalesPerson: (name: string, email: string, password: string) => Promise<void>;
  saveProduct: (payload: ProductPayload) => Promise<void>;
  deleteProduct: (id: string | number) => Promise<void>;
  uploadImage: (file: File) => Promise<string>;
  reloadDashboard: () => Promise<void>;
  addToCart: (product: Product, quantity?: number, options?: Partial<CartItem>) => void | Promise<void>;
  removeFromCart: (id: string | number) => void | Promise<void>;
  updateQuantity: (id: string | number, quantity: number) => void | Promise<void>;
  toggleWishlist: (product: Product) => void | Promise<void>;
  buyNow: (item: CartItem) => void;
  startCheckout: () => void;
  checkoutWithRazorpay: () => Promise<void>;
  clearOrder: () => void;
  showToast: (message: string) => void;
}

interface Session {
  token: string;
  user: UserRecord;
}

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
}

interface OrderRecord {
  id: string;
  totalAmount: number;
  paymentStatus: string;
  items: { name: string; quantity: number; unitPrice: number; sellerId?: string }[];
  createdAt?: string;
}

interface ProductPayload {
  name: string;
  category: string;
  price: number;
  imageUrl: string;
}

const categories: Category[] = ["New Arrivals", "Rings", "Necklaces", "Earrings", "Bridal", "Gift Boxes"];

const products: Product[] = [
  {
    id: 1,
    name: "Celeste Moonfire Ring",
    category: "Rings",
    metal: "Champagne Gold",
    purity: "18K",
    diamond: "0.74 ct lab-grown brilliant",
    price: 84500,
    originalPrice: 96000,
    rating: 4.9,
    reviews: 132,
    createdAt: "2026-07-04",
    popularity: 99,
    occasion: "Engagement",
    image: "/campaign/gift-girlfriend.png",
    palette: ["#f8d889", "#d9c6ff", "#fbfdff"],
    description: "A luminous solitaire ring with a slender cathedral setting, made to catch candlelight and morning sun with equal grace.",
  },
  {
    id: 2,
    name: "Nocturne Diamond Choker",
    category: "Necklaces",
    metal: "White Gold",
    purity: "18K",
    diamond: "2.10 ct round and marquise stones",
    price: 186000,
    originalPrice: 214000,
    rating: 5,
    reviews: 86,
    createdAt: "2026-06-18",
    popularity: 96,
    occasion: "Evening",
    image: "/campaign/gift-wife.png",
    palette: ["#f9f5df", "#b7bbff", "#ffffff"],
    description: "A close-set diamond choker with a midnight profile, balanced for velvet dresses, silk sarees, and black-tie entrances.",
  },
  {
    id: 3,
    name: "Aurora Drop Earrings",
    category: "Earrings",
    metal: "Rose Gold",
    purity: "18K",
    diamond: "0.96 ct pear-cut pair",
    price: 73500,
    originalPrice: 88000,
    rating: 4.8,
    reviews: 74,
    createdAt: "2026-07-11",
    popularity: 92,
    occasion: "Cocktail",
    image: "/campaign/gift-sister.png",
    palette: ["#e9acc1", "#f7d991", "#fff6fb"],
    description: "Soft rose-gold earrings with pear-cut fire, built to move lightly and sparkle without shouting.",
  },
  {
    id: 4,
    name: "Eclipse Tennis Bracelet",
    category: "New Arrivals",
    metal: "Platinum",
    purity: "950",
    diamond: "3.42 ct continuous diamond line",
    price: 248000,
    originalPrice: 276000,
    rating: 4.9,
    reviews: 104,
    createdAt: "2026-05-24",
    popularity: 94,
    occasion: "Heirloom",
    image: "/campaign/gift-mother.png",
    palette: ["#dfe8ff", "#f8d889", "#ffffff"],
    description: "A fluid platinum bracelet with a continuous diamond line and a low-profile clasp for quiet everyday luxury.",
  },
  {
    id: 5,
    name: "Seraphine Bridal Set",
    category: "Bridal",
    metal: "Champagne Gold",
    purity: "22K",
    diamond: "Kundan-polki inspired luminous setting",
    price: 316000,
    originalPrice: 352000,
    rating: 5,
    reviews: 61,
    createdAt: "2026-06-30",
    popularity: 98,
    occasion: "Wedding",
    image: "/campaign/gift-wife.png",
    palette: ["#ffd678", "#8d5cff", "#fff7df"],
    description: "A ceremonial set with layered sparkle and sculpted goldwork, designed for portraits that feel eternal.",
  },
  {
    id: 6,
    name: "Velvet Promise Band",
    category: "Gift Boxes",
    metal: "Platinum",
    purity: "950",
    diamond: "Black diamond channel detail",
    price: 58500,
    originalPrice: 69000,
    rating: 4.7,
    reviews: 47,
    createdAt: "2026-07-07",
    popularity: 84,
    occasion: "Anniversary",
    image: "/campaign/gift-husband.png",
    palette: ["#d8dded", "#f2ce7f", "#151824"],
    description: "A satin platinum band with a single dark diamond line: restrained, tactile, and quietly romantic.",
  },
  {
    id: 7,
    name: "Starlit Lariat Necklace",
    category: "Gift Boxes",
    metal: "Champagne Gold",
    purity: "18K",
    diamond: "0.38 ct scattered star stones",
    price: 64500,
    originalPrice: 76000,
    rating: 4.8,
    reviews: 93,
    createdAt: "2026-07-15",
    popularity: 90,
    occasion: "Gifting",
    image: "/campaign/gift-girlfriend.png",
    palette: ["#f7d78e", "#c8b6ff", "#fffdf8"],
    description: "A fine lariat that falls like a trace of light, with tiny diamonds placed where the chain meets the skin.",
  },
  {
    id: 8,
    name: "Solstice Huggie Hoops",
    category: "Earrings",
    metal: "Champagne Gold",
    purity: "18K",
    diamond: "0.52 ct pavé-set diamonds",
    price: 52500,
    originalPrice: 61000,
    rating: 4.7,
    reviews: 58,
    createdAt: "2026-06-02",
    popularity: 82,
    occasion: "Daily",
    image: "/campaign/gift-sister.png",
    palette: ["#ffd983", "#ffffff", "#cfd7ff"],
    description: "Compact huggie hoops with a molten-gold glow, made for daily wear with a dressed-up finish.",
  },
];

const StoreContext = createContext<StoreValue | null>(null);
const API_BASE = "https://himanshi-ecom.onrender.com";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isMongoId(id: string | number) {
  return typeof id === "string" && /^[a-f\d]{24}$/i.test(id);
}

function toJewelleryProduct(product: any): Product {
  return {
    id: product.id,
    name: product.name,
    category: product.category || "Rings",
    metal: "Champagne Gold",
    purity: "18K",
    diamond: "Cloudinary product image",
    price: Number(product.price || 1),
    originalPrice: Math.round(Number(product.price || 1) * 1.15),
    rating: 4.8,
    reviews: 12,
    createdAt: product.createdAt || new Date().toISOString(),
    popularity: 80,
    occasion: "Jewellery",
    image: product.imageUrl,
    imageUrl: product.imageUrl,
    sellerId: String(product.sellerId || ""),
    palette: ["#f8d889", "#d9c6ff", "#fbfdff"],
    description: "A seller-added jewellery piece uploaded through Cloudinary and saved in MongoDB.",
  };
}

function useStoredState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : fallback;
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useStoredState<CartItem[]>("lunara-cart", []);
  const [wishlist, setWishlist] = useStoredState<Product[]>("lunara-wishlist", []);
  const [checkoutItems, setCheckoutItems] = useStoredState<CartItem[]>("lunara-checkout", []);
  const [session, setSession] = useStoredState<Session | null>("lunara-session", null);
  const [activeRole, setActiveRole] = useState<Role>(session?.user.role || "user");
  const [backendProducts, setBackendProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const toastTimer = useRef<number | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2400);
  };

  const api = async (path: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = { "Content-Type": "application/json", ...(options.headers as Record<string, string> || {}) };
    if (session?.token) headers.Authorization = `Bearer ${session.token}`;
    const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || "Request failed");
    return data;
  };

  const applyCart = (data: any) => {
    const items = (data?.items || []).map((item: any) => ({
      ...toJewelleryProduct(item.product),
      quantity: item.quantity,
    }));
    setCart(items);
  };

  const applyWishlist = (data: any) => {
    setWishlist((data?.products || []).map(toJewelleryProduct));
  };

  const loadProducts = async () => {
    try {
      const data = await api("/products");
      setBackendProducts((data.products || []).map(toJewelleryProduct));
    } catch {
      setBackendProducts([]);
    }
  };

  const reloadDashboard = async () => {
    if (!session) return;
    try {
      const [orderData, cartData, wishlistData] = await Promise.all([
        api("/orders"),
        api("/cart"),
        api("/wishlist"),
      ]);
      setOrders(orderData.orders || []);
      applyCart(cartData.cart);
      applyWishlist(wishlistData.wishlist);
      if (session.user.role === "admin") {
        const userData = await api("/users");
        setUsers(userData.users || []);
      }
      await loadProducts();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not load dashboard");
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (session) {
      setActiveRole(session.user.role);
      reloadDashboard();
    }
  }, [session?.token]);

  const login = async (email: string, password: string) => {
    if (!emailPattern.test(email)) throw new Error("Enter a valid email like pranita12@gmail.com");
    const data = await api("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    setSession(data);
    setActiveRole(data.user.role);
    showToast(`Logged in as ${data.user.role}`);
  };

  const register = async (name: string, email: string, password: string) => {
    if (!emailPattern.test(email)) throw new Error("Enter a valid email like pranita12@gmail.com");
    const data = await api("/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) });
    setSession(data);
    setActiveRole("user");
    showToast("Account created");
  };

  const logout = () => {
    setSession(null);
    setActiveRole("user");
    setUsers([]);
    setOrders([]);
    setCart([]);
    setWishlist([]);
    setCheckoutItems([]);
    showToast("Logged out");
  };

  const addToCart = async (product: Product, quantity = 1, options: Partial<CartItem> = {}) => {
    if (session && isMongoId(product.id)) {
      const data = await api("/cart", { method: "POST", body: JSON.stringify({ productId: product.id, quantity }) });
      applyCart(data.cart);
      showToast("Added to bag");
      return;
    }
    setCart((items) => {
      const existing = items.find((item) => item.id === product.id && item.selectedMetal === options.selectedMetal && item.selectedSize === options.selectedSize);
      if (existing) {
        return items.map((item) => (item === existing ? { ...item, quantity: item.quantity + quantity } : item));
      }
      return [...items, { ...product, ...options, quantity }];
    });
    showToast("Added to bag");
  };

  const value = useMemo<StoreValue>(() => ({
    session,
    activeRole,
    users,
    orders,
    allProducts: backendProducts.length ? backendProducts : products,
    cart,
    wishlist,
    wishlistIds: new Set(wishlist.map((item) => item.id)),
    search,
    toast,
    cartCount: cart.reduce((sum, item) => sum + item.quantity, 0),
    wishlistCount: wishlist.length,
    checkoutItems,
    setSearch,
    login,
    register,
    logout,
    setActiveRole,
    reloadDashboard,
    createSalesPerson: async (name, email, password) => {
      if (!emailPattern.test(email)) throw new Error("Enter a valid email like pranita12@gmail.com");
      await api("/users/sales", { method: "POST", body: JSON.stringify({ name, email, password }) });
      await reloadDashboard();
      showToast("Sales person created");
    },
    saveProduct: async (payload) => {
      await api("/products", { method: "POST", body: JSON.stringify(payload) });
      await loadProducts();
      showToast("Product saved");
    },
    deleteProduct: async (id) => {
      if (!isMongoId(id)) return;
      await api(`/products/${id}`, { method: "DELETE" });
      await loadProducts();
      showToast("Product deleted");
    },
    uploadImage: async (file) => {
      const signed = await api("/uploads/sign", { method: "POST", body: JSON.stringify({}) });
      const form = new FormData();
      form.append("file", file);
      form.append("api_key", signed.apiKey);
      form.append("timestamp", signed.timestamp);
      form.append("folder", signed.folder);
      form.append("signature", signed.signature);
      const response = await fetch(`https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`, { method: "POST", body: form });
      const uploaded = await response.json();
      if (!response.ok) throw new Error(uploaded.error?.message || "Cloudinary upload failed");
      return uploaded.secure_url;
    },
    addToCart,
    removeFromCart: async (id) => {
      if (session && isMongoId(id)) {
        const data = await api(`/cart/${id}`, { method: "DELETE" });
        applyCart(data.cart);
        showToast("Removed from bag");
        return;
      }
      setCart((items) => items.filter((item) => item.id !== id));
      showToast("Removed from bag");
    },
    updateQuantity: async (id, quantity) => {
      if (session && isMongoId(id)) {
        const data = quantity > 0
          ? await api(`/cart/${id}`, { method: "PATCH", body: JSON.stringify({ quantity }) })
          : await api(`/cart/${id}`, { method: "DELETE" });
        applyCart(data.cart);
        return;
      }
      setCart((items) => items.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item)));
    },
    toggleWishlist: async (product) => {
      if (session && isMongoId(product.id)) {
        const exists = wishlist.some((item) => item.id === product.id);
        const data = await api(`/wishlist/${product.id}`, { method: exists ? "DELETE" : "POST" });
        applyWishlist(data.wishlist);
        showToast(exists ? "Removed from wishlist" : "Saved with a sparkle");
        return;
      }
      setWishlist((items) => {
        const exists = items.some((item) => item.id === product.id);
        showToast(exists ? "Removed from wishlist" : "Saved with a sparkle");
        return exists ? items.filter((item) => item.id !== product.id) : [...items, product];
      });
    },
    buyNow: (item) => {
      setCheckoutItems([item]);
      showToast("Ready for checkout");
    },
    startCheckout: () => setCheckoutItems(cart),
    checkoutWithRazorpay: async () => {
      if (!session) throw new Error("Login before checkout");
      if (!cart.length) throw new Error("Your cart is empty");
      if (cart.some((item) => !isMongoId(item.id))) throw new Error("Please checkout products added by Admin or Sales Person");
      const data = await api("/orders/from-cart", { method: "POST", body: JSON.stringify({}) });
      if (!window.Razorpay) throw new Error("Razorpay checkout is loading. Refresh once and try again.");
      const checkout = new window.Razorpay({
        key: data.razorpay.keyId,
        amount: data.razorpay.amount,
        currency: data.razorpay.currency,
        name: "Pranita Jewels",
        description: "Jewellery order payment",
        order_id: data.razorpay.orderId,
        prefill: { name: session.user.name, email: session.user.email },
        theme: { color: "#b68a2c" },
        handler: async (response: unknown) => {
          await api(`/orders/${data.order.id}/verify-payment`, { method: "POST", body: JSON.stringify(response) });
          await reloadDashboard();
          setCheckoutItems([]);
          showToast("Payment verified");
        },
      });
      checkout.open();
    },
    clearOrder: () => {
      setCart([]);
      setCheckoutItems([]);
      showToast("Order placed");
    },
    showToast,
  }), [session, activeRole, users, orders, backendProducts, cart, wishlist, search, toast, checkoutItems, setCart, setWishlist, setCheckoutItems]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside StoreProvider");
  return context;
}

const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
const discount = (product: Product) => Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
const summary = (items: CartItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = total > 50000 || total === 0 ? 0 : 900;
  return { subtotal, discount: subtotal - total, delivery, total: total + delivery };
};

const isCartItem = (item: Product | CartItem): item is CartItem => "quantity" in item;

function Loader({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion();
  useEffect(() => {
    const seen = sessionStorage.getItem("lunara-loader");
    if (seen || reduce) {
      onDone();
      return;
    }
    const timer = window.setTimeout(() => {
      sessionStorage.setItem("lunara-loader", "true");
      onDone();
    }, 2600);
    return () => window.clearTimeout(timer);
  }, [onDone, reduce]);

  return (
    <motion.div className="loader" exit={{ opacity: 0 }} transition={{ duration: 0.65 }}>
      <motion.div className="loader-diamond" initial={{ pathLength: 0, opacity: 0 }} animate={{ opacity: 1 }} />
      <div className="loader-gem">
        <Gem size={58} />
      </div>
      <motion.p initial={{ opacity: 0, filter: "blur(10px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} transition={{ delay: 0.9 }}>
        Pranita Jewels
      </motion.p>
    </motion.div>
  );
}

function Layout({ route, navigate, children }: { route: Route; navigate: (page: Page, productId?: string | number, category?: Category | "All") => void; children: ReactNode }) {
  const { cartCount, wishlistCount, search, setSearch, toast, allProducts, session } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="app-shell">
      <SoftCursor />
      <header className={`nav ${scrolled ? "nav-glass" : ""}`}>
        <button className="nav-menu" onClick={() => setMobile(true)} aria-label="Open menu"><Menu /></button>
        <button className="brand" onClick={() => navigate("home")} aria-label="Pranita home">
          <span className="brand-mark">P</span>
          <span><strong>Pranita</strong><small>JEWELS</small></span>
        </button>
        <nav className="nav-links" aria-label="Main navigation">
          {["New Arrivals", "Rings", "Necklaces", "Earrings", "Bridal", "Gift Boxes"].map((label) => (
            <button key={label} className="nav-link" onClick={() => navigate("listing", undefined, label === "New Arrivals" ? "All" : label as Category)}>
              {label}
              <span className="mega">
                <img src={allProducts[label === "Rings" ? 0 : label === "Necklaces" ? 1 : label === "Earrings" ? 2 : 4]?.image || products[0].image} alt="" />
                <em>{label} edit</em>
              </span>
            </button>
          ))}
        </nav>
        <label className="search-pill">
          <Search size={17} />
          <input value={search} onFocus={() => route.page !== "listing" && navigate("listing")} onChange={(event) => setSearch(event.target.value)} placeholder="Search rings, diamonds, gifts" />
        </label>
        <button className="icon-pill" onClick={() => setAccountOpen(true)} aria-label="Account"><User size={19} />{session && <b>{session.user.role[0].toUpperCase()}</b>}</button>
        <button className="icon-pill count" onClick={() => navigate("wishlist")} aria-label="Wishlist"><Heart size={19} />{wishlistCount > 0 && <b>{wishlistCount}</b>}</button>
        <button id="cart-target" className="icon-pill count" onClick={() => navigate("cart")} aria-label="Cart"><ShoppingBag size={19} />{cartCount > 0 && <b>{cartCount}</b>}</button>
      </header>
      <AnimatePresence>
        {mobile && (
          <motion.div className="mobile-panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button className="icon-pill" onClick={() => setMobile(false)} aria-label="Close menu"><X /></button>
            {categories.map((category) => <button key={category} onClick={() => { setMobile(false); navigate("listing", undefined, category); }}>{category}</button>)}
          </motion.div>
        )}
      </AnimatePresence>
      <main>{children}</main>
      <Footer navigate={navigate} />
      <AccountPanel open={accountOpen} onClose={() => setAccountOpen(false)} />
      <AnimatePresence>{toast && <motion.div className="toast" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}>{toast}</motion.div>}</AnimatePresence>
    </div>
  );
}

function SoftCursor() {
  const reduce = useReducedMotion();
  const dot = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reduce || matchMedia("(pointer: coarse)").matches) return;
    const move = (event: MouseEvent) => {
      if (!dot.current) return;
      dot.current.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [reduce]);
  return <div ref={dot} className="soft-cursor" />;
}

function AccountPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const {
    session, activeRole, setActiveRole, login, register, logout, users, orders, cart, wishlist,
    allProducts, createSalesPerson, saveProduct, deleteProduct, uploadImage, reloadDashboard,
  } = useStore();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [salesForm, setSalesForm] = useState({ name: "", email: "", password: "" });
  const [productForm, setProductForm] = useState({ name: "", category: "Rings", price: "", imageUrl: "" });
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const submitAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "register") await register(form.name, form.email, form.password);
      else await login(form.email, form.password);
      await reloadDashboard();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const submitSales = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      await createSalesPerson(salesForm.name, salesForm.email, salesForm.password);
      setSalesForm({ name: "", email: "", password: "" });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not create sales person");
    } finally {
      setBusy(false);
    }
  };

  const chooseProductImage = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      const imageUrl = await uploadImage(file);
      setProductForm((current) => ({ ...current, imageUrl }));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const submitProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      await saveProduct({ ...productForm, price: Number(productForm.price) });
      setProductForm({ name: "", category: "Rings", price: "", imageUrl: "" });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not save product");
    } finally {
      setBusy(false);
    }
  };

  const roleProducts = activeRole === "admin"
    ? allProducts.filter((product) => isMongoId(product.id))
    : allProducts.filter((product) => String(product.sellerId) === String(session?.user.id));

  return (
    <motion.div className="account-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.aside className="account-panel" initial={{ x: 520 }} animate={{ x: 0 }}>
        <button className="account-close" onClick={onClose}><X /></button>
        {!session ? (
          <>
            <p className="eyebrow">{mode === "register" ? "New user signup" : "Secure signin"}</p>
            <h2>{mode === "register" ? "Create User Account" : "Login"}</h2>
            <form className="panel-form" onSubmit={submitAuth}>
              {mode === "register" && <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Pranita" /></label>}
              <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="pranita12@gmail.com" /></label>
              <label>Password<input type="password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required placeholder="At least 8 characters" /></label>
              <button className="btn-gold" disabled={busy}>{mode === "register" ? "Sign up" : "Sign in"}</button>
            </form>
            <button className="link-button" onClick={() => setMode(mode === "register" ? "login" : "register")}>
              {mode === "register" ? "Already registered? Sign in" : "New user? Sign up"}
            </button>
            <p className="panel-note">Every new signup becomes a User. Already used emails cannot be registered again.</p>
          </>
        ) : (
          <>
            <p className="eyebrow">Logged in as {session.user.email}</p>
            <h2>{session.user.name}</h2>
            <div className="role-tabs">
              {(["user", "sales", "admin"] as Role[]).map((role) => (
                <button key={role} className={activeRole === role ? "active" : ""} disabled={session.user.role !== "admin" && session.user.role !== role} onClick={() => setActiveRole(role)}>
                  {role === "sales" ? "Sales" : role[0].toUpperCase() + role.slice(1)}
                </button>
              ))}
            </div>
            {activeRole === "user" && (
              <div className="panel-stack">
                <div className="mini-stats"><span>Wishlist <b>{wishlist.length}</b></span><span>Bag <b>{cart.length}</b></span><span>Orders <b>{orders.length}</b></span></div>
                <OrderList orders={orders} />
              </div>
            )}
            {activeRole === "admin" && (
              <div className="panel-stack">
                <div className="mini-stats"><span>Users <b>{users.length}</b></span><span>Sales <b>{users.filter((u) => u.role === "sales").length}</b></span><span>Orders <b>{orders.length}</b></span></div>
                <form className="panel-form" onSubmit={submitSales}>
                  <h3>Add Sales Person</h3>
                  <input placeholder="Name" value={salesForm.name} onChange={(e) => setSalesForm({ ...salesForm, name: e.target.value })} required />
                  <input type="email" placeholder="seller12@gmail.com" value={salesForm.email} onChange={(e) => setSalesForm({ ...salesForm, email: e.target.value })} required />
                  <input type="password" minLength={8} placeholder="Password" value={salesForm.password} onChange={(e) => setSalesForm({ ...salesForm, password: e.target.value })} required />
                  <button className="btn-gold" disabled={busy}>Create Sales Login</button>
                </form>
                <UserList users={users} />
                <OrderList orders={orders} />
              </div>
            )}
            {activeRole === "sales" && (
              <div className="panel-stack">
                <ProductUploadForm form={productForm} setForm={setProductForm} busy={busy} onFile={chooseProductImage} onSubmit={submitProduct} />
                <ProductList products={roleProducts} onDelete={deleteProduct} />
                <OrderList orders={orders} />
              </div>
            )}
            {activeRole === "admin" && <ProductUploadForm form={productForm} setForm={setProductForm} busy={busy} onFile={chooseProductImage} onSubmit={submitProduct} />}
            {activeRole === "admin" && <ProductList products={roleProducts} onDelete={deleteProduct} />}
            <button className="btn-ghost full-width" onClick={logout}>Logout</button>
          </>
        )}
      </motion.aside>
    </motion.div>
  );
}

function ProductUploadForm({ form, setForm, busy, onFile, onSubmit }: {
  form: { name: string; category: string; price: string; imageUrl: string };
  setForm: (value: { name: string; category: string; price: string; imageUrl: string }) => void;
  busy: boolean;
  onFile: (file?: File) => void;
  onSubmit: (event: React.FormEvent) => void;
}) {
  return (
    <form className="panel-form" onSubmit={onSubmit}>
      <h3>Add Jewellery Product</h3>
      <input placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories.map((category) => <option key={category}>{category}</option>)}</select>
      <input type="number" min={1} placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
      <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => onFile(e.target.files?.[0])} />
      {form.imageUrl && <img className="upload-preview" src={form.imageUrl} alt="Uploaded product" />}
      <button className="btn-gold" disabled={busy || !form.imageUrl}>Save Product</button>
    </form>
  );
}

function UserList({ users }: { users: UserRecord[] }) {
  return <div className="panel-table"><h3>Login Data</h3>{users.map((user) => <p key={user.id}><span>{user.name}</span><small>{user.email} - {user.role}</small></p>)}</div>;
}

function ProductList({ products, onDelete }: { products: Product[]; onDelete: (id: string | number) => Promise<void> }) {
  return <div className="panel-table"><h3>Products</h3>{products.map((product) => <p key={product.id}><span>{product.name}</span><small>{money(product.price)} - {product.category}</small><button onClick={() => onDelete(product.id)}>Delete</button></p>)}</div>;
}

function OrderList({ orders }: { orders: OrderRecord[] }) {
  return <div className="panel-table"><h3>Orders</h3>{orders.length ? orders.map((order) => <p key={order.id}><span>{money(order.totalAmount)}</span><small>{order.paymentStatus} - {order.items.map((item) => item.name).join(", ")}</small></p>) : <p><span>No orders yet</span><small>Orders appear after Razorpay checkout.</small></p>}</div>;
}

function Hero({ navigate }: { navigate: (page: Page, productId?: string | number, category?: Category | "All") => void }) {
  const [skipped, setSkipped] = useState(false);
  return (
    <section className={`hero ${skipped ? "hero-skip" : ""}`}>
      <video
        className="hero-video"
        src="/campaign/hero-video.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label="Pranita Jewels cinematic jewellery campaign video"
      />
      <ParticleField />
      <button className="skip" onClick={() => setSkipped(true)}>Skip animation</button>
      <motion.div className="hero-copy" initial={{ opacity: 0, y: 34, filter: "blur(14px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 1.1, delay: skipped ? 0 : 4.4 }}>
        <p className="eyebrow">Private celestial collection</p>
        <h1>Where Desire Becomes Jewellery</h1>
        <p>Discover luminous pieces crafted for the moments you never want to fade.</p>
        <div className="hero-actions">
          <button className="btn-gold" onClick={() => navigate("listing")}>Explore Collection</button>
          <button className="btn-ghost" onClick={() => navigate("listing", undefined, "All")}>Shop New Arrivals</button>
        </div>
      </motion.div>
    </section>
  );
}

function ParticleField() {
  return (
    <div className="particles" aria-hidden="true">
      {Array.from({ length: 46 }).map((_, index) => <span key={index} style={{ "--i": index } as React.CSSProperties} />)}
    </div>
  );
}

function Home({ navigate }: { navigate: (page: Page, productId?: string | number, category?: Category | "All") => void }) {
  const { allProducts } = useStore();
  const storyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!storyRef.current || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".gemstone-film-wrap", { scale: 0.92, opacity: 0.64 }, {
        scale: 1,
        opacity: 1,
        scrollTrigger: { trigger: ".story", start: "top 78%", end: "bottom 45%", scrub: 1 },
      });
      gsap.utils.toArray<HTMLElement>(".story-copy > *").forEach((item, index) => {
        gsap.fromTo(item, { y: 24, opacity: 0, filter: "blur(10px)" }, {
          y: 0,
          scale: 1,
          opacity: 1,
          filter: "blur(0px)",
          delay: index * 0.05,
          scrollTrigger: { trigger: ".story", start: "top 70%", toggleActions: "play none none reverse" },
        });
      });
    }, storyRef);
    return () => ctx.revert();
  }, []);

  return (
    <>
      <Hero navigate={navigate} />
      <section className="marquee" aria-label="Luxury service promises">
        {["Conflict-free diamonds", "Insured delivery", "Lifetime polishing", "Certified metals", "Private styling"].map((item) => <span key={item}>{item}</span>)}
      </section>
      <ProductRail title="Trending Jewellery" subtitle="Rare pieces catching the season's light" items={allProducts.slice(0, 5)} navigate={navigate} />
      <TryOnSection navigate={navigate} />
      <section ref={storyRef} className="story">
        <div className="story-copy">
          <p className="eyebrow">From raw glow to rare fire</p>
          <h2>Every line of light reveals a promise.</h2>
          <p>
            Watch the gemstone move through mist, precision and brilliance, as if the jewel is being shaped by moonlight before it becomes part of a forever piece.
          </p>
        </div>
        <div className="gemstone-film-wrap">
          <video
            className="gemstone-film"
            src="/campaign/gemstone-story.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Gemstone refined by glowing light lines"
          />
        </div>
      </section>
    </>
  );
}

function PopupImageLoop() {
  const frames = [
    { title: "Gifts for Him", src: "/campaign/gift-boyfriend.png" },
    { title: "Brother's Keepsake", src: "/campaign/gift-brother.png" },
    { title: "Father's Classic", src: "/campaign/gift-father.png" },
    { title: "For Her", src: "/campaign/gift-girlfriend.png" },
    { title: "Husband's Edit", src: "/campaign/gift-husband.png" },
    { title: "Mother's Glow", src: "/campaign/gift-mother.png" },
    { title: "Sister's Sparkle", src: "/campaign/gift-sister.png" },
    { title: "Wife's Keepsake", src: "/campaign/gift-wife.png" },
  ];
  const renderedFrames = Array.from({ length: frames.length * 3 }, (_, index) => frames[index % frames.length]);
  const [activeFrame, setActiveFrame] = useState(frames.length);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const frameRefs = useRef<(HTMLElement | null)[]>([]);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const updateFocusedFrame = () => {
    const track = trackRef.current;
    if (!track) return;

    const trackCenter = track.scrollLeft + track.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    frameRefs.current.forEach((frame, index) => {
      if (!frame) return;
      const frameCenter = frame.offsetLeft + frame.offsetWidth / 2;
      const distance = Math.abs(frameCenter - trackCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setActiveFrame(closestIndex);
  };

  const centerFrame = (index: number, behavior: ScrollBehavior) => {
    const track = trackRef.current;
    const frame = frameRefs.current[index];
    if (!track || !frame) return;

    track.scrollTo({
      left: frame.offsetLeft - (track.clientWidth - frame.offsetWidth) / 2,
      behavior,
    });
  };

  useEffect(() => {
    window.requestAnimationFrame(() => centerFrame(frames.length, "auto"));
  }, [frames.length]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => setGalleryVisible(entry.isIntersecting),
      { threshold: 0.42 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!galleryVisible) return;

    const timer = window.setInterval(() => {
      setActiveFrame((current) => {
        const normalizedCurrent = current >= frames.length * 2 ? frames.length + (current % frames.length) : current;
        const next = normalizedCurrent + 1;
        centerFrame(next, "smooth");

        if (next === frames.length * 2) {
          window.setTimeout(() => {
            centerFrame(frames.length, "auto");
            setActiveFrame(frames.length);
          }, 760);
        }

        return next;
      });
    }, 2000);

    return () => window.clearInterval(timer);
  }, [galleryVisible, frames.length]);

  return (
    <section ref={sectionRef} className="popup-loop section" aria-label="Looping jewellery reveal gallery">
      <div className="popup-loop-copy">
        <p className="eyebrow">Jewels in motion</p>
        <h2>One piece rises, another follows.</h2>
      </div>
      <div
        className="popup-track"
        ref={trackRef}
        onScroll={updateFocusedFrame}
        onWheel={(event) => {
          if (!trackRef.current || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
          trackRef.current.scrollLeft += event.deltaY;
        }}
        style={{ "--active-index": activeFrame % frames.length } as React.CSSProperties}
      >
        {renderedFrames.map((frame, index) => (
          <motion.article
            className={`popup-frame ${index === activeFrame ? "is-active" : "is-peek"}`}
            key={`${frame.title}-${index}`}
            ref={(node) => {
              frameRefs.current[index] = node;
            }}
            animate={{
              opacity: index === activeFrame ? 1 : 0.46,
              y: index === activeFrame ? -12 : 18,
              scale: index === activeFrame ? 1 : 0.82,
              filter: index === activeFrame ? "blur(0px)" : "blur(2px)",
            }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <img src={frame.src} alt={frame.title} loading="lazy" />
            <span>{frame.title}</span>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function ProductRail({ title, subtitle, items, navigate }: { title: string; subtitle: string; items: Product[]; navigate: (page: Page, productId?: string | number, category?: Category | "All") => void }) {
  return (
    <section className="section">
      <SectionHead eyebrow={subtitle} title={title} action="View all" onAction={() => navigate("listing")} />
      <div className="product-grid">
        {items.map((product) => <ProductCard key={product.id} product={product} navigate={navigate} />)}
      </div>
    </section>
  );
}

function ProductCard({ product, navigate }: { product: Product; navigate: (page: Page, productId?: string | number, category?: Category | "All") => void }) {
  const { addToCart, toggleWishlist, wishlistIds } = useStore();
  const saved = wishlistIds.has(product.id);
  return (
    <motion.article className="product-card" initial={{ opacity: 0, y: 28, filter: "blur(12px)" }} whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }} viewport={{ once: true, margin: "-80px" }}>
      <button className="product-image" onClick={() => navigate("product", product.id)} aria-label={`View ${product.name}`}>
        <span className="mist" />
        <span className="light-ring" />
        <img src={product.image} alt={product.name} loading="lazy" />
      </button>
      <div className="product-info">
        <div>
          <p className="eyebrow">{product.category}</p>
          <h3>{product.name}</h3>
        </div>
        <button className={`wish ${saved ? "saved" : ""}`} onClick={() => toggleWishlist(product)} aria-label="Save to wishlist"><Heart size={18} /></button>
      </div>
      <p className="description">{product.diamond}</p>
      <div className="product-meta">
        <strong>{money(product.price)}</strong>
        <span><Star size={15} fill="currentColor" /> {product.rating}</span>
      </div>
      <div className="card-actions">
        <button className="btn-ghost" onClick={() => navigate("product", product.id)}>Details</button>
        <button className="btn-gold small" onClick={() => addToCart(product)}>Add to Bag</button>
      </div>
    </motion.article>
  );
}

function TryOnSection({ navigate }: { navigate: (page: Page, productId?: string | number, category?: Category | "All") => void }) {
  return (
    <section className="tryon section">
      <div className="hands-stage">
        <video
          className="tryon-video"
          src="/campaign/ring-tryon.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="Romantic ring try-on video"
        />
        <div className="tryon-sparkle" />
        <ParticleField />
      </div>
      <div className="try-copy">
        <p className="eyebrow">Engagement ritual</p>
        <h2>Made for Your Forever</h2>
        <p>A romantic preview where the ring glides into place with a final diamond sparkle, graceful enough for proposals and private appointments.</p>
        <button className="btn-gold" onClick={() => navigate("listing", undefined, "Rings")}>Explore Engagement Rings</button>
      </div>
    </section>
  );
}

function Collections({ navigate }: { navigate: (page: Page, productId?: string | number, category?: Category | "All") => void }) {
  const { allProducts } = useStore();
  return (
    <section className="section">
      <SectionHead eyebrow="Animated categories" title="Collections in soft focus" />
      <div className="collection-grid">
        {categories.map((category, index) => {
          const product = allProducts.find((item) => item.category === category) ?? allProducts[index % allProducts.length] ?? products[index % products.length];
          return (
            <button className="collection-card" key={category} onClick={() => navigate("listing", undefined, category)}>
              <img src={product.image} alt="" loading="lazy" />
              <span className="collection-particles" />
              <strong>{category}</strong>
              <em>Explore <ChevronRight size={15} /></em>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function Listing({ route, navigate }: { route: Route; navigate: (page: Page, productId?: string | number, category?: Category | "All") => void }) {
  const { search, allProducts } = useStore();
  const [category, setCategory] = useState<Category | "All">(route.category ?? "All");
  const [metal, setMetal] = useState<Metal | "All">("All");
  const [price, setPrice] = useState(340000);
  const [sort, setSort] = useState("popular");

  useEffect(() => setCategory(route.category ?? "All"), [route.category]);

  const visible = useMemo(() => {
    const query = search.toLowerCase().trim();
    return allProducts
      .filter((product) => (category === "All" || product.category === category) && (metal === "All" || product.metal === metal) && product.price <= price)
      .filter((product) => !query || `${product.name} ${product.category} ${product.metal}`.toLowerCase().includes(query))
      .sort((a, b) => sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : sort === "new" ? +new Date(b.createdAt) - +new Date(a.createdAt) : b.popularity - a.popularity);
  }, [allProducts, category, metal, price, search, sort]);

  return (
    <section className="page section">
      <SectionHead eyebrow={`${visible.length} luminous designs`} title="Fine jewellery catalogue" />
      <div className="listing">
        <aside className="filters">
          <h2><SlidersHorizontal size={19} /> Filters</h2>
          <Select label="Category" value={category} onChange={(value) => setCategory(value as Category | "All")} options={["All", ...categories]} />
          <Select label="Metal" value={metal} onChange={(value) => setMetal(value as Metal | "All")} options={["All", "Champagne Gold", "Platinum", "Rose Gold", "White Gold"]} />
          <label className="field">Price up to {money(price)}<input type="range" min={45000} max={340000} step={5000} value={price} onChange={(event) => setPrice(Number(event.target.value))} /></label>
          <Select label="Sort" value={sort} onChange={setSort} options={["popular", "new", "low", "high"]} labels={["Most desired", "Newest", "Price low", "Price high"]} />
        </aside>
        <div className="product-grid listing-grid">
          {visible.map((product) => <ProductCard key={product.id} product={product} navigate={navigate} />)}
          {!visible.length && <div className="empty-state">No pieces matched. Soften the filters and search again.</div>}
        </div>
      </div>
    </section>
  );
}

function ProductDetail({ productId, navigate }: { productId?: string | number; navigate: (page: Page, productId?: string | number, category?: Category | "All") => void }) {
  const { addToCart, buyNow, toggleWishlist, wishlistIds, showToast, allProducts } = useStore();
  const product = allProducts.find((item) => String(item.id) === String(productId)) ?? allProducts[0] ?? products[0];
  const [metal, setMetal] = useState<Metal>(product.metal);
  const [size, setSize] = useState("14");
  const [quantity, setQuantity] = useState(1);
  const [rotation, setRotation] = useState(32);
  const [shimmer, setShimmer] = useState(0);
  const saved = wishlistIds.has(product.id);

  const add = () => {
    setShimmer((value) => value + 1);
    addToCart(product, quantity, { selectedMetal: metal, selectedSize: size });
  };

  return (
    <section className="page section detail-page">
      <div className="detail-grid">
        <div className="gallery">
          <div className="thumbs">{[0, 1, 2, 3].map((item) => <button key={item}><img src={product.image} alt="" /></button>)}</div>
          <motion.div key={`${metal}-${shimmer}`} className="detail-image" initial={{ filter: "brightness(1.8) blur(8px)" }} animate={{ filter: "brightness(1) blur(0px)" }}>
            <img src={product.image} alt={product.name} style={{ transform: `rotateY(${rotation}deg)` }} />
            <span className="detail-shimmer" />
          </motion.div>
        </div>
        <div className="detail-panel">
          <p className="eyebrow">{product.category}</p>
          <h1>{product.name}</h1>
          <div className="detail-price"><strong>{money(product.price)}</strong><span>{money(product.originalPrice)}</span><em>{discount(product)}% off</em></div>
          <p className="rating"><Star size={16} fill="currentColor" /> {product.rating} from {product.reviews} reviews</p>
          <p>{product.description}</p>
          <div className="spec-grid">
            <Spec icon={<Gem />} label="Diamond" value={product.diamond} />
            <Spec icon={<ShieldCheck />} label="Metal purity" value={`${metal}, ${product.purity}`} />
            <Spec icon={<Truck />} label="Delivery" value="Estimated 3 to 5 insured days" />
            <Spec icon={<RotateCcw />} label="360 view" value="Drag the rotation control" />
          </div>
          <Select label="Metal colour" value={metal} onChange={(value) => { setMetal(value as Metal); setShimmer((count) => count + 1); }} options={["Champagne Gold", "Platinum", "Rose Gold", "White Gold"]} />
          <Select label="Ring size" value={size} onChange={setSize} options={["10", "12", "14", "16", "18", "Custom"]} />
          <label className="field">360-degree rotation<input type="range" min={-70} max={70} value={rotation} onChange={(event) => setRotation(Number(event.target.value))} /></label>
          <div className="quantity"><button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button><span>{quantity}</span><button onClick={() => setQuantity(quantity + 1)}>+</button></div>
          <div className="detail-actions">
            <button className="btn-ghost" onClick={() => toggleWishlist(product)}>{saved ? "Wishlisted" : "Wishlist"}</button>
            <button className="btn-gold" onClick={add}>Add to Bag</button>
            <button className="btn-buy" onClick={() => { buyNow({ ...product, quantity, selectedMetal: metal, selectedSize: size }); navigate("checkout"); }}>Buy Now</button>
          </div>
          <button className="delivery-check" onClick={() => showToast("Delivery available in 3 to 5 days for most Indian metros")}>Check delivery estimate</button>
        </div>
      </div>
      <ProductRail title="Related Products" subtitle="Designed to glow together" items={allProducts.filter((item) => item.id !== product.id).slice(0, 4)} navigate={navigate} />
      <Reviews />
    </section>
  );
}

function Cart({ navigate, wishlist = false }: { navigate: (page: Page, productId?: string | number, category?: Category | "All") => void; wishlist?: boolean }) {
  const { cart, wishlist: saved, removeFromCart, updateQuantity, startCheckout } = useStore();
  const items = wishlist ? saved : cart;
  const totals = summary(cart);
  return (
    <section className="page section">
      <SectionHead eyebrow={wishlist ? "Saved pieces" : "Your bag"} title={wishlist ? "Wishlist" : "Shopping bag"} />
      <div className="cart-layout">
        <div className="cart-list">
          {items.map((item) => (
            <article className="cart-row" key={item.id}>
              <img src={item.image} alt={item.name} />
              <div><h3>{item.name}</h3><p>{item.metal} / {item.purity}</p><strong>{money(item.price)}</strong></div>
              {!wishlist && isCartItem(item) && <div className="quantity"><button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button><span>{item.quantity}</span><button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button></div>}
              {!wishlist && <button className="icon-pill" onClick={() => removeFromCart(item.id)} aria-label="Remove"><X /></button>}
            </article>
          ))}
          {!items.length && <div className="empty-state">No jewellery here yet. Start with the collection.</div>}
        </div>
        {!wishlist && <aside className="checkout-card"><h2>Order summary</h2><p><span>Subtotal</span>{money(totals.subtotal)}</p><p><span>Savings</span>{money(totals.discount)}</p><p><span>Delivery</span>{totals.delivery ? money(totals.delivery) : "Complimentary"}</p><strong><span>Total</span>{money(totals.total)}</strong><button className="btn-gold" disabled={!cart.length} onClick={() => { startCheckout(); navigate("checkout"); }}>Checkout</button></aside>}
      </div>
    </section>
  );
}

function Checkout({ navigate }: { navigate: (page: Page, productId?: string | number, category?: Category | "All") => void }) {
  const { checkoutItems, checkoutWithRazorpay, showToast, session } = useStore();
  const totals = summary(checkoutItems);
  const pay = async () => {
    try {
      if (!session) {
        showToast("Login before checkout");
        return;
      }
      await checkoutWithRazorpay();
      navigate("home");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Payment failed");
    }
  };
  return (
    <section className="page section">
      <SectionHead eyebrow="Secure checkout" title="Complete your order" />
      <div className="checkout-flow">
        <form className="checkout-form">
          <label>Full name<input required placeholder="Name on delivery" /></label>
          <label>Email<input required type="email" placeholder="care@example.com" /></label>
          <label>Phone<input required placeholder="+91" /></label>
          <label>Delivery address<textarea required placeholder="House, street, city, pincode" /></label>
          <label>Payment method<select><option>Card</option><option>UPI</option><option>Net banking</option></select></label>
        </form>
        <aside className="checkout-card">
          <CreditCard />
          <h2>Pay {money(totals.total)}</h2>
          <p>Includes insured delivery, certification, and premium gift packaging.</p>
          <button className="btn-buy" disabled={!checkoutItems.length} onClick={pay}>Pay with Razorpay</button>
        </aside>
      </div>
    </section>
  );
}

function Occasions({ navigate }: { navigate: (page: Page, productId?: string | number, category?: Category | "All") => void }) {
  return (
    <section className="section split-bands">
      {["Bridal Collection", "Shop by Occasion", "Shop by Price", "Gift Guide"].map((title) => (
        <button key={title} onClick={() => navigate("listing")}><span>{title}</span><ChevronRight /></button>
      ))}
    </section>
  );
}

function Testimonials() {
  return (
    <section className="section testimonials">
      <SectionHead eyebrow="Client notes" title="Soft-spoken devotion" />
      {["The ring looked like it had its own moonlight.", "Every detail felt private, ceremonial, and beautifully packed.", "The checkout was easy, but the reveal felt cinematic."].map((quote, index) => <blockquote key={quote}>{quote}<cite>{["Aarohi", "Mira", "Dev"][index]}</cite></blockquote>)}
    </section>
  );
}

function InstagramGallery() {
  const { allProducts } = useStore();
  return (
    <section className="section insta">
      <SectionHead eyebrow="@pranitajewels" title="Seen in candlelight" />
      {allProducts.slice(0, 6).map((product) => <img key={product.id} src={product.image} alt={product.name} loading="lazy" />)}
    </section>
  );
}

function Newsletter() {
  return (
    <section className="newsletter section">
      <p className="eyebrow">Private previews</p>
      <h2>Receive the next luminous drop first.</h2>
      <label><input type="email" placeholder="Email address" /><button className="btn-gold">Join</button></label>
    </section>
  );
}

function Reviews() {
  return <section className="reviews"><h2>Customer reviews</h2><p><Star size={16} fill="currentColor" /> 4.9 average across verified purchases. Loved for lightness, packaging, and stone fire.</p></section>;
}

function SectionHead({ eyebrow, title, action, onAction }: { eyebrow: string; title: string; action?: string; onAction?: () => void }) {
  return <div className="section-head"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>{action && <button className="link" onClick={onAction}>{action}<ChevronRight size={16} /></button>}</div>;
}

function Select({ label, value, options, labels, onChange }: { label: string; value: string; options: string[]; labels?: string[]; onChange: (value: string) => void }) {
  return <label className="field">{label}<select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option, index) => <option key={option} value={option}>{labels?.[index] ?? option}</option>)}</select></label>;
}

function Spec({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="spec">{icon}<span>{label}</span><strong>{value}</strong></div>;
}

function Footer({ navigate }: { navigate: (page: Page, productId?: string | number, category?: Category | "All") => void }) {
  return (
    <footer>
      <div><h2>Pranita Jewels</h2><p>A luxury jewellery universe for modern romance, crafted with premium product concepts and cinematic interaction design.</p></div>
      <div>{categories.slice(0, 4).map((category) => <button key={category} onClick={() => navigate("listing", undefined, category)}>{category}</button>)}</div>
      <div><span>Certified stones</span><span>Secure checkout</span><span>Lifetime care</span><span>Insured delivery</span></div>
    </footer>
  );
}

export default function App() {
  const [route, setRoute] = useState<Route>({ page: "home" });
  const [loading, setLoading] = useState(true);
  const navigate = (page: Page, productId?: string | number, category?: Category | "All") => {
    setRoute({ page, productId, category });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <StoreProvider>
      <AnimatePresence>{loading && <Loader onDone={() => setLoading(false)} />}</AnimatePresence>
      <Layout route={route} navigate={navigate}>
        <AnimatePresence mode="wait">
          <motion.div key={`${route.page}-${route.productId ?? ""}-${route.category ?? ""}`} initial={{ opacity: 0, clipPath: "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)" }} animate={{ opacity: 1, clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }} exit={{ opacity: 0 }} transition={{ duration: 0.55 }}>
            {route.page === "home" && <Home navigate={navigate} />}
            {route.page === "listing" && <Listing route={route} navigate={navigate} />}
            {route.page === "product" && <ProductDetail productId={route.productId} navigate={navigate} />}
            {route.page === "cart" && <Cart navigate={navigate} />}
            {route.page === "wishlist" && <Cart navigate={navigate} wishlist />}
            {route.page === "checkout" && <Checkout navigate={navigate} />}
          </motion.div>
        </AnimatePresence>
      </Layout>
    </StoreProvider>
  );
}
