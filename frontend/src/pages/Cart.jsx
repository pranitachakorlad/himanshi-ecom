import { Icon } from "../components/Icons";
import ProductArt from "../components/ProductArt";
import { useStore } from "../context/StoreContext";
import { cartSummary, formatCurrency } from "../utils";

export default function Cart({ onNavigate }) {
  const { cart, updateQuantity, removeFromCart, startCheckoutFromCart } = useStore();
  const summary = cartSummary(cart);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-7">
        <p className="eyebrow">Your selection</p>
        <h1 className="font-serif text-5xl text-stone-950">Shopping cart</h1>
      </div>
      {cart.length === 0 ? (
        <Empty title="Your cart is empty" action="Continue shopping" onClick={() => onNavigate("listing")} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="grid gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-[130px_1fr_auto]">
                <ProductArt product={item} />
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-amber-700">{item.category}</p>
                  <h2 className="mt-1 font-serif text-2xl">{item.name}</h2>
                  <p className="mt-2 text-sm text-stone-600">{item.purity} {item.metal} · {item.weight}</p>
                  <p className="mt-3 font-bold">{formatCurrency(item.price)}</p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <div className="flex items-center rounded-full border border-stone-200 bg-[#fffaf1] p-1">
                    <button className="icon-button" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Icon name="minus" /></button>
                    <span className="w-10 text-center font-bold">{item.quantity}</span>
                    <button className="icon-button" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Icon name="plus" /></button>
                  </div>
                  <button className="icon-button text-red-700" onClick={() => removeFromCart(item.id)} aria-label="Remove item">
                    <Icon name="trash" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <PriceSummary
            summary={summary}
            button="Checkout"
            onClick={() => {
              startCheckoutFromCart();
              onNavigate("checkout");
            }}
          />
        </div>
      )}
    </section>
  );
}

export function PriceSummary({ summary, button, onClick }) {
  return (
    <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-5 shadow-sm lg:sticky lg:top-36">
      <h2 className="font-serif text-2xl">Price summary</h2>
      <div className="mt-5 space-y-3 text-sm">
        <Row label="Subtotal" value={formatCurrency(summary.subtotal)} />
        <Row label="Discount" value={`-${formatCurrency(summary.discount)}`} good />
        <Row label="Delivery" value={summary.delivery === 0 ? "Free" : formatCurrency(summary.delivery)} />
        <div className="border-t border-stone-200 pt-3">
          <Row label="Total" value={formatCurrency(summary.total)} strong />
        </div>
      </div>
      <button className="btn-gold mt-6 w-full py-4" onClick={onClick}>{button}</button>
      <p className="mt-3 text-center text-xs text-stone-500">Taxes and making charges included in demo prices.</p>
    </aside>
  );
}

function Row({ label, value, strong, good }) {
  return (
    <div className={`flex justify-between gap-4 ${strong ? "text-lg font-bold" : ""}`}>
      <span className="text-stone-600">{label}</span>
      <span className={good ? "font-bold text-emerald-700" : "font-bold text-stone-950"}>{value}</span>
    </div>
  );
}

export function Empty({ title, action, onClick }) {
  return (
    <div className="rounded-[2rem] border border-stone-200 bg-white p-12 text-center shadow-sm">
      <h2 className="font-serif text-4xl text-stone-950">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-stone-600">Explore the collection and save the pieces you love.</p>
      <button className="btn-gold mt-7 px-7 py-3" onClick={onClick}>{action}</button>
    </div>
  );
}
