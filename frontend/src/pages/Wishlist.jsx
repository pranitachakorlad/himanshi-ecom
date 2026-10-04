import ProductCard from "../components/ProductCard";
import { useStore } from "../context/StoreContext";
import { Empty } from "./Cart";

export default function Wishlist({ onNavigate }) {
  const { wishlist, addToCart } = useStore();

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-7">
        <p className="eyebrow">Saved designs</p>
        <h1 className="font-serif text-5xl text-stone-950">Wishlist</h1>
      </div>
      {wishlist.length === 0 ? (
        <Empty title="No saved products yet" action="Browse jewellery" onClick={() => onNavigate("listing")} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {wishlist.map((product) => (
            <div key={product.id}>
              <ProductCard product={product} onNavigate={onNavigate} compact />
              <button className="btn-gold mt-3 w-full py-3" onClick={() => addToCart(product)}>Move to cart</button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
