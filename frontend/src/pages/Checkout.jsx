import { useState } from "react";
import { useStore } from "../context/StoreContext";
import { cartSummary, formatCurrency } from "../utils";
import { Empty, PriceSummary } from "./Cart";

const requiredFields = [
  ["fullName", "Full name"],
  ["phone", "Phone number"],
  ["pincode", "Pincode"],
  ["city", "City"],
  ["state", "State"],
  ["building", "House / building"],
  ["address", "Address"],
];

export default function Checkout({ onNavigate }) {
  const { checkoutItems, clearOrder, showToast } = useStore();
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    pincode: "",
    city: "",
    state: "",
    building: "",
    address: "",
  });
  const [errors, setErrors] = useState({});
  const summary = cartSummary(checkoutItems);

  const updateField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const validateCheckout = () => {
    const nextErrors = {};

    requiredFields.forEach(([name, label]) => {
      if (!form[name].trim()) {
        nextErrors[name] = `${label} is required`;
      }
    });

    if (form.phone.trim() && !/^[6-9]\d{9}$/.test(form.phone.trim())) {
      nextErrors.phone = "Enter a valid 10 digit mobile number";
    }

    if (form.pincode.trim() && !/^\d{6}$/.test(form.pincode.trim())) {
      nextErrors.pincode = "Enter a valid 6 digit pincode";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const placeOrder = () => {
    if (!validateCheckout()) {
      showToast("Please fill all mandatory fields");
      return;
    }

    if (paymentMethod === "UPI") {
      showToast("Redirecting to online payment");
      onNavigate("payment");
      return;
    }

    clearOrder();
    setSuccess(true);
    showToast("Order placed successfully");
  };

  if (success) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-[2rem] border border-amber-200 bg-white p-10 text-center shadow-sm">
          <p className="eyebrow">Order placed</p>
          <h1 className="mt-3 font-serif text-5xl text-stone-950">Thank you for shopping with Svarika.</h1>
          <p className="mx-auto mt-4 max-w-lg text-stone-600">
            Your demo order has been confirmed. A confirmation message would be sent after payment integration in production.
          </p>
          <button className="btn-gold mt-8 px-7 py-3" onClick={() => onNavigate("home")}>Back to home</button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-7">
        <p className="eyebrow">Secure checkout</p>
        <h1 className="font-serif text-5xl text-stone-950">Checkout</h1>
      </div>
      {checkoutItems.length === 0 ? (
        <Empty title="No items selected for checkout" action="Go to cart" onClick={() => onNavigate("cart")} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <form className="space-y-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm" onSubmit={(event) => event.preventDefault()}>
            <div>
              <h2 className="font-serif text-2xl">Delivery address</h2>
              <p className="mt-1 text-sm text-stone-600">All fields marked with * are mandatory.</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Input label="Full name" name="fullName" value={form.fullName} error={errors.fullName} onChange={updateField} />
                <Input label="Phone number" name="phone" value={form.phone} error={errors.phone} onChange={updateField} />
                <Input label="Pincode" name="pincode" value={form.pincode} error={errors.pincode} onChange={updateField} />
                <Input label="City" name="city" value={form.city} error={errors.city} onChange={updateField} />
                <Input label="State" name="state" value={form.state} error={errors.state} onChange={updateField} />
                <Input label="House / building" name="building" value={form.building} error={errors.building} onChange={updateField} />
                <label className="sm:col-span-2">
                  <span className="text-sm font-bold text-stone-700">Address <Required /></span>
                  <textarea
                    className={`mt-2 min-h-28 w-full rounded-xl border bg-[#fffaf1] px-4 py-3 outline-none focus:border-amber-700 ${errors.address ? "border-red-400" : "border-stone-200"}`}
                    value={form.address}
                    onChange={(event) => updateField("address", event.target.value)}
                    required
                  />
                  {errors.address && <p className="mt-1 text-xs font-semibold text-red-700">{errors.address}</p>}
                </label>
              </div>
            </div>
            <div>
              <h2 className="font-serif text-2xl">Payment method</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {["UPI", "Card", "Cash on delivery"].map((method) => (
                  <label key={method} className="rounded-2xl border border-stone-200 bg-[#fffaf1] p-4 text-sm font-bold">
                    <input
                      className="mr-2 accent-amber-700"
                      type="radio"
                      name="payment"
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                    />
                    {method}
                  </label>
                ))}
              </div>
              {paymentMethod === "UPI" && (
                <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
                  After the mandatory address fields are filled, you will be redirected to the online UPI payment page.
                </p>
              )}
            </div>
            <div>
              <h2 className="font-serif text-2xl">Order summary</h2>
              <div className="mt-4 space-y-3">
                {checkoutItems.map((item) => (
                  <div key={item.id} className="flex justify-between gap-4 rounded-xl bg-[#fffaf1] p-4 text-sm">
                    <span>{item.name} &times; {item.quantity}</span>
                    <span className="font-bold">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          </form>
          <PriceSummary
            summary={summary}
            button={paymentMethod === "UPI" ? "Continue to UPI Payment" : "Place Order"}
            onClick={placeOrder}
          />
        </div>
      )}
    </section>
  );
}

function Input({ label, name, value, error, onChange }) {
  return (
    <label>
      <span className="text-sm font-bold text-stone-700">{label} <Required /></span>
      <input
        className={`mt-2 w-full rounded-xl border bg-[#fffaf1] px-4 py-3 outline-none focus:border-amber-700 ${error ? "border-red-400" : "border-stone-200"}`}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        required
      />
      {error && <p className="mt-1 text-xs font-semibold text-red-700">{error}</p>}
    </label>
  );
}

function Required() {
  return <span className="text-red-700">*</span>;
}
