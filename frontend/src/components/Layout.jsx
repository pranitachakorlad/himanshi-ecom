import { categories } from "../data/products";
import { useStore } from "../context/StoreContext";
import { Icon } from "./Icons";

export default function Layout({ page, onNavigate, children }) {
  const { cartCount, wishlistCount, search, setSearch, toast } = useStore();

  return (
    <div className="min-h-screen bg-[#fffaf1] text-stone-900">
      <div className="bg-stone-950 px-4 py-2 text-center text-xs font-medium uppercase tracking-[0.28em] text-amber-100">
        Complimentary insured delivery on orders above Rs. 25,000
      </div>
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-[#fffaf1]/94 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4">
          <button className="lg:hidden" aria-label="Menu">
            <Icon name="menu" />
          </button>
          <button className="flex items-center gap-3" onClick={() => onNavigate("home")}>
            <span className="grid h-11 w-11 place-items-center rounded-full bg-stone-950 font-serif text-xl text-amber-200 shadow-lg">
              SJ
            </span>
            <span>
              <span className="block font-serif text-2xl leading-none text-stone-950">Svarika</span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.32em] text-amber-700">Jewels</span>
            </span>
          </button>
          <label className="ml-auto hidden flex-1 items-center gap-3 rounded-full border border-stone-200 bg-white px-4 py-2 shadow-sm md:flex">
            <Icon name="search" className="h-4 w-4 text-stone-500" />
            <input
              className="w-full bg-transparent text-sm outline-none"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onFocus={() => page !== "listing" && onNavigate("listing")}
              placeholder="Search necklaces, rings, wedding jewellery"
            />
          </label>
          <div className="flex items-center gap-2">
            <button className="icon-button hidden md:grid" aria-label="Login">
              <Icon name="user" />
            </button>
            <button className="icon-button relative" onClick={() => onNavigate("wishlist")} aria-label="Wishlist">
              <Icon name="heart" />
              {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
            </button>
            <button className="icon-button relative" onClick={() => onNavigate("cart")} aria-label="Cart">
              <Icon name="cart" />
              {cartCount > 0 && <span className="badge">{cartCount}</span>}
            </button>
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-3">
          {categories.map((category) => (
            <button
              key={category}
              className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-white hover:text-amber-800"
              onClick={() => onNavigate("listing", null, category)}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="px-4 pb-3 md:hidden">
          <label className="flex items-center gap-3 rounded-full border border-stone-200 bg-white px-4 py-2 shadow-sm">
            <Icon name="search" className="h-4 w-4 text-stone-500" />
            <input
              className="w-full bg-transparent text-sm outline-none"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onFocus={() => page !== "listing" && onNavigate("listing")}
              placeholder="Search jewellery"
            />
          </label>
        </div>
      </header>
      <main>{children}</main>
      <Footer onNavigate={onNavigate} />
      {toast && <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white shadow-2xl">{toast}</div>}
    </div>
  );
}

function Footer({ onNavigate }) {
  return (
    <footer className="mt-20 bg-stone-950 text-stone-200">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.2fr_0.8fr_0.8fr_1.2fr]">
        <div>
          <h2 className="font-serif text-3xl text-amber-100">Svarika Jewels</h2>
          <p className="mt-4 max-w-sm text-sm leading-6 text-stone-400">
            Original Indian jewellery concepts for a demo storefront: crafted in code with graceful shopping flows.
          </p>
        </div>
        <FooterLinks title="Shop" items={["Gold", "Diamond", "Wedding", "Collections"]} onNavigate={onNavigate} />
        <FooterLinks title="Help" items={["Shipping", "Returns", "Size guide", "Contact"]} onNavigate={onNavigate} />
        <div>
          <h3 className="font-semibold text-white">Newsletter</h3>
          <p className="mt-3 text-sm text-stone-400">Receive private previews, launch offers, and styling notes.</p>
          <div className="mt-4 flex rounded-full bg-white p-1">
            <input className="min-w-0 flex-1 rounded-full px-4 text-sm text-stone-900 outline-none" placeholder="Email address" />
            <button className="rounded-full bg-amber-600 px-5 py-2 text-sm font-bold text-white">Join</button>
          </div>
          <p className="mt-5 text-sm text-stone-400">Call: +91 98765 43210<br />Email: care@svarikajewels.test</p>
        </div>
      </div>
    </footer>
  );
}

function FooterLinks({ title, items, onNavigate }) {
  return (
    <div>
      <h3 className="font-semibold text-white">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <button key={item} className="block text-sm text-stone-400 hover:text-amber-100" onClick={() => onNavigate("listing", null, item)}>
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
