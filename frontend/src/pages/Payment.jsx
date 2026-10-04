import { useState } from "react";
import { useStore } from "../context/StoreContext";
import { cartSummary, formatCurrency } from "../utils";
import { Empty } from "./Cart";

export default function Payment({ onNavigate }) {
  const { checkoutItems, clearOrder, showToast } = useStore();
  const [paid, setPaid] = useState(false);
  const summary = cartSummary(checkoutItems);

  if (paid) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-[2rem] border border-amber-200 bg-white p-10 text-center shadow-sm">
          <p className="eyebrow">Payment successful</p>
          <h1 className="mt-3 font-serif text-5xl text-stone-950">Your order is confirmed.</h1>
          <p className="mx-auto mt-4 max-w-lg text-stone-600">
            This is a demo payment confirmation page. In production, connect this screen to Razorpay, Cashfree, PhonePe, or another payment gateway.
          </p>
          <button className="btn-gold mt-8 px-7 py-3" onClick={() => onNavigate("home")}>Back to home</button>
        </div>
      </section>
    );
  }

  if (checkoutItems.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-8">
        <Empty title="No payment is pending" action="Go to cart" onClick={() => onNavigate("cart")} />
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <p className="eyebrow">Online payment</p>
          <h1 className="mt-3 font-serif text-5xl text-stone-950">Pay securely with UPI</h1>
          <p className="mt-3 max-w-2xl text-stone-600">
            Complete the demo payment to confirm your Svarika Jewels order. A hosted production site should connect this page to a real payment gateway.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-[240px_1fr]">
            <div className="grid aspect-square place-items-center rounded-3xl bg-[#fffaf1] p-5">
              <div className="grid h-full w-full grid-cols-5 gap-2 rounded-2xl bg-white p-4 shadow-inner">
                {Array.from({ length: 25 }).map((_, index) => (
                  <span
                    key={index}
                    className={`rounded ${[0, 1, 2, 5, 10, 6, 12, 18, 22, 23, 24, 19, 14].includes(index) ? "bg-stone-950" : "bg-amber-100"}`}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-stone-200 bg-[#fffaf1] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">UPI ID</p>
                <p className="mt-1 text-xl font-bold text-stone-950">svarika-demo@upi</p>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-[#fffaf1] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Amount payable</p>
                <p className="mt-1 text-3xl font-bold text-stone-950">{formatCurrency(summary.total)}</p>
              </div>
              <button
                className="btn-gold w-full py-4"
                onClick={() => {
                  clearOrder();
                  setPaid(true);
                  showToast("Payment successful");
                }}
              >
                Pay Now
              </button>
              <button className="btn-outline w-full py-4" onClick={() => onNavigate("checkout")}>Back to checkout</button>
            </div>
          </div>
        </div>
        <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="font-serif text-2xl">Payment summary</h2>
          <div className="mt-4 space-y-3">
            {checkoutItems.map((item) => (
              <div key={item.id} className="rounded-xl bg-[#fffaf1] p-3 text-sm">
                <p className="font-bold">{item.name}</p>
                <p className="mt-1 text-stone-600">{item.quantity} &times; {formatCurrency(item.price)}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
