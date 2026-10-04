import { useEffect, useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";
import { categories } from "../data/products";
import { useStore } from "../context/StoreContext";

const metals = ["Gold", "Diamond", "Rose Gold"];
const occasions = ["Wedding", "Festive", "Daily Wear", "Party", "Office"];

export default function Listing({ initialCategory, onNavigate }) {
  const { allProducts, search } = useStore();
  const [filters, setFilters] = useState({
    category: initialCategory || "All",
    metal: "All",
    occasion: "All",
    price: 350000,
    rating: 0,
  });
  const [sort, setSort] = useState("popularity");

  useEffect(() => {
    setFilters((current) => ({ ...current, category: initialCategory || "All" }));
  }, [initialCategory]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = allProducts.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.metal.toLowerCase().includes(query);
      return (
        matchesSearch &&
        (filters.category === "All" || product.category === filters.category) &&
        (filters.metal === "All" || product.metal === filters.metal) &&
        (filters.occasion === "All" || product.occasion === filters.occasion) &&
        product.price <= filters.price &&
        product.rating >= Number(filters.rating)
      );
    });

    return result.sort((a, b) => {
      if (sort === "low") return a.price - b.price;
      if (sort === "high") return b.price - a.price;
      if (sort === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      return b.popularity - a.popularity;
    });
  }, [allProducts, filters, search, sort]);

  const update = (key, value) => setFilters((current) => ({ ...current, [key]: value }));

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">Catalogue</p>
          <h1 className="font-serif text-4xl text-stone-950 md:text-5xl">Fine jewellery</h1>
          <p className="mt-2 text-stone-600">{filtered.length} designs found</p>
        </div>
        <label className="flex items-center gap-3 rounded-full border border-stone-200 bg-white px-4 py-3 shadow-sm">
          <span className="text-sm font-semibold text-stone-600">Sort</span>
          <select className="bg-transparent text-sm outline-none" value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="popularity">Popularity</option>
            <option value="newest">Newest</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
          </select>
        </label>
      </div>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-5 shadow-sm lg:sticky lg:top-36">
          <h2 className="font-serif text-2xl">Filters</h2>
          <FilterSelect label="Category" value={filters.category} options={["All", ...categories]} onChange={(value) => update("category", value)} />
          <FilterSelect label="Metal" value={filters.metal} options={["All", ...metals]} onChange={(value) => update("metal", value)} />
          <FilterSelect label="Occasion" value={filters.occasion} options={["All", ...occasions]} onChange={(value) => update("occasion", value)} />
          <div className="mt-5">
            <label className="text-sm font-bold text-stone-700">Price up to Rs. {Number(filters.price).toLocaleString("en-IN")}</label>
            <input className="mt-3 w-full accent-amber-700" type="range" min="25000" max="350000" step="5000" value={filters.price} onChange={(event) => update("price", Number(event.target.value))} />
          </div>
          <FilterSelect label="Rating" value={filters.rating} options={[0, 4, 4.5, 4.8]} labels={["Any", "4+ stars", "4.5+ stars", "4.8+ stars"]} onChange={(value) => update("rating", value)} />
        </aside>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full rounded-2xl border border-stone-200 bg-white p-10 text-center">
              <h2 className="font-serif text-3xl">No matching designs</h2>
              <p className="mt-2 text-stone-600">Try a wider price range or fewer filters.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function FilterSelect({ label, value, options, labels, onChange }) {
  return (
    <label className="mt-5 block">
      <span className="text-sm font-bold text-stone-700">{label}</span>
      <select className="mt-2 w-full rounded-xl border border-stone-200 bg-[#fffaf1] px-3 py-3 text-sm outline-none focus:border-amber-700" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option, index) => (
          <option key={option} value={option}>
            {labels ? labels[index] : option}
          </option>
        ))}
      </select>
    </label>
  );
}
