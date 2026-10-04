import { useState } from "react";
import ProductArt from "../components/ProductArt";
import ProductCard from "../components/ProductCard";
import { Icon } from "../components/Icons";
import { products } from "../data/products";
import { discountPercent, formatCurrency } from "../utils";
import { useStore } from "../context/StoreContext";

export default function ProductDetail({ productId, onNavigate }) {
  const product = products.find((item) => item.id === productId) || products[0];
  const similar = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4);
  const { addToCart, buyNow, toggleWishlist, wishlistIds, showToast } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState("Standard");
  const [pincode, setPincode] = useState("");
  const saved = wishlistIds.has(product.id);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1fr]">
        <div className="grid gap-4 md:grid-cols-[90px_1fr]">
          <div className="grid grid-cols-4 gap-3 md:grid-cols-1">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="rounded-2xl border border-stone-200 bg-white p-1">
                <ProductArt product={{ ...product, id: product.id + item }} />
              </div>
            ))}
          </div>
          <div className="rounded-[2rem] border border-stone-200 bg-white p-4 shadow-sm">
            <ProductArt product={product} size="large" />
          </div>
        </div>
        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <p className="eyebrow">{product.category}</p>
          <div className="mt-3 flex items-start justify-between gap-4">
            <h1 className="font-serif text-4xl leading-tight text-stone-950 md:text-5xl">{product.name}</h1>
            <button className={`icon-button ${saved ? "bg-amber-100 text-amber-800" : ""}`} onClick={() => toggleWishlist(product)}>
              <Icon name="heart" className={saved ? "h-5 w-5 fill-current" : "h-5 w-5"} />
            </button>
          </div>
          <div className="mt-5 flex flex-wrap items-end gap-3">
            <p className="text-3xl font-bold">{formatCurrency(product.price)}</p>
            <p className="text-lg text-stone-400 line-through">{formatCurrency(product.originalPrice)}</p>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800">{discountPercent(product)}% off</span>
          </div>
          <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-stone-700">
            <Icon name="star" className="h-4 w-4 fill-amber-400 stroke-amber-500" />
            {product.rating} rating · {product.reviews} reviews
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Spec label="Metal" value={product.metal} />
            <Spec label="Purity" value={product.purity} />
            <Spec label="Weight" value={product.weight} />
            <Spec label="Occasion" value={product.occasion} />
          </div>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <label>
              <span className="text-sm font-bold text-stone-700">Size</span>
              <select className="mt-2 w-full rounded-xl border border-stone-200 bg-[#fffaf1] px-4 py-3 outline-none" value={size} onChange={(event) => setSize(event.target.value)}>
                <option>Standard</option>
                <option>Small</option>
                <option>Medium</option>
                <option>Large</option>
              </select>
            </label>
            <div>
              <span className="text-sm font-bold text-stone-700">Quantity</span>
              <div className="mt-2 flex w-fit items-center rounded-full border border-stone-200 bg-[#fffaf1] p-1">
                <button className="icon-button" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Icon name="minus" /></button>
                <span className="w-12 text-center font-bold">{quantity}</span>
                <button className="icon-button" onClick={() => setQuantity(quantity + 1)}><Icon name="plus" /></button>
              </div>
            </div>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <button className="btn-outline py-4" onClick={() => addToCart(product, quantity)}>Add to Cart</button>
            <button
              className="btn-gold py-4"
              onClick={() => {
                buyNow({ ...product, selectedSize: size }, quantity);
                onNavigate("checkout");
              }}
            >
              Buy Now
            </button>
          </div>

          <div className="mt-7 rounded-2xl bg-[#fffaf1] p-4">
            <p className="font-bold">Check delivery</p>
            <div className="mt-3 flex gap-2">
              <input className="min-w-0 flex-1 rounded-full border border-stone-200 px-4 py-3 outline-none" value={pincode} onChange={(event) => setPincode(event.target.value)} placeholder="Enter pincode" />
              <button className="btn-soft px-5" onClick={() => showToast(pincode.length >= 6 ? "Delivery available in 3 to 5 days" : "Enter a valid 6 digit pincode")}>Check</button>
            </div>
          </div>

          <div className="mt-7">
            <h2 className="font-serif text-2xl">Description</h2>
            <p className="mt-2 leading-7 text-stone-600">{product.description}</p>
          </div>
        </div>
      </div>

      <section className="mt-14">
        <div className="section-heading px-0">
          <div>
            <p className="eyebrow">You may also like</p>
            <h2>Similar products</h2>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {(similar.length ? similar : products.slice(0, 4)).map((item) => (
            <ProductCard key={item.id} product={item} onNavigate={onNavigate} />
          ))}
        </div>
      </section>
    </section>
  );
}

function Spec({ label, value }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-[#fffaf1] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-stone-500">{label}</p>
      <p className="mt-1 font-bold text-stone-950">{value}</p>
    </div>
  );
}
