import ProductArt from "./ProductArt";
import { Icon } from "./Icons";
import { formatCurrency, discountPercent } from "../utils";
import { useStore } from "../context/StoreContext";

export default function ProductCard({ product, onNavigate, compact = false }) {
  const { addToCart, buyNow, toggleWishlist, wishlistIds } = useStore();
  const saved = wishlistIds.has(product.id);

  return (
    <article className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <button className="relative block w-full" onClick={() => onNavigate("product", product.id)}>
        <ProductArt product={product} />
        <span className="absolute left-4 top-4 rounded-full bg-white/88 px-3 py-1 text-xs font-semibold text-stone-700 shadow-sm">
          {discountPercent(product)}% off
        </span>
      </button>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-amber-700">{product.category}</p>
            <h3 className="mt-1 min-h-12 font-serif text-lg leading-snug text-stone-950">{product.name}</h3>
          </div>
          <button
            className={`icon-button shrink-0 ${saved ? "bg-amber-100 text-amber-800" : ""}`}
            onClick={() => toggleWishlist(product)}
            aria-label="Toggle wishlist"
          >
            <Icon name="heart" className={saved ? "h-5 w-5 fill-current" : "h-5 w-5"} />
          </button>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-lg font-bold text-stone-950">{formatCurrency(product.price)}</p>
            <p className="text-sm text-stone-400 line-through">{formatCurrency(product.originalPrice)}</p>
          </div>
          <p className="flex items-center gap-1 text-sm font-semibold text-stone-700">
            <Icon name="star" className="h-4 w-4 fill-amber-400 stroke-amber-500" />
            {product.rating}
          </p>
        </div>
        {!compact && (
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button className="btn-soft" onClick={() => onNavigate("product", product.id)}>
              Quick view
            </button>
            <button className="btn-soft" onClick={() => addToCart(product)}>
              Add
            </button>
            <button
              className="btn-gold"
              onClick={() => {
                buyNow(product);
                onNavigate("checkout");
              }}
            >
              Buy
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
