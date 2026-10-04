import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import ProductArt from "../components/ProductArt";
import CampaignImage from "../components/CampaignImage";
import { campaignImages } from "../data/campaignImages";
import { categories, products } from "../data/products";
import { formatCurrency } from "../utils";

export default function Home({ onNavigate }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const bestSellers = [...products].sort((a, b) => b.popularity - a.popularity).slice(0, 4);
  const newArrivals = [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);
  const wedding = products.filter((item) => item.occasion === "Wedding").slice(0, 4);
  const heroProduct = products[5];
  const heroCampaign = campaignImages[activeSlide];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % campaignImages.length);
    }, 2000);

    return () => window.clearInterval(timer);
  }, []);

  const moveSlide = (direction) => {
    setActiveSlide((current) => (current + direction + campaignImages.length) % campaignImages.length);
  };

  return (
    <>
      <section className="hero-shell">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 lg:grid-cols-[1fr_0.9fr] lg:py-20">
          <div>
            <p className="eyebrow">New ceremonial edit</p>
            <h1 className="mt-5 max-w-3xl font-serif text-5xl leading-[0.95] text-stone-950 md:text-7xl">
              Jewellery with the quiet glow of heirlooms.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-stone-700">
              Discover original gold, diamond, bridal, and everyday pieces in a polished shopping experience made for modern Indian celebrations.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button className="btn-gold px-7 py-3 text-base" onClick={() => onNavigate("listing")}>
                Shop collection
              </button>
              <button className="btn-outline px-7 py-3 text-base" onClick={() => onNavigate("listing", null, "Wedding")}>
                Explore wedding
              </button>
            </div>
          </div>
          <div className="hero-slider">
            <div className="hero-slide-track" style={{ transform: `translateX(-${activeSlide * 100}%)` }}>
              {campaignImages.map((image) => (
                <div key={image.title} className="hero-slide">
                  <CampaignImage image={image} />
                </div>
              ))}
            </div>
            <button className="slider-arrow left-4" onClick={() => moveSlide(-1)} aria-label="Previous gift image">
              ‹
            </button>
            <button className="slider-arrow right-4" onClick={() => moveSlide(1)} aria-label="Next gift image">
              ›
            </button>
            <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/88 p-4 shadow-xl backdrop-blur">
              <p className="text-xs uppercase tracking-[0.22em] text-amber-800">Featured gift edit</p>
              <div className="mt-1 flex items-end justify-between gap-3">
                <div>
                  <h2 className="font-serif text-2xl text-stone-950">{heroCampaign.title}</h2>
                  <p className="text-sm text-stone-600">{heroCampaign.copy}</p>
                </div>
                <p className="font-bold text-stone-950">{formatCurrency(heroProduct.price)}</p>
              </div>
              <div className="mt-4 flex gap-2">
                {campaignImages.map((image, index) => (
                  <button
                    key={image.title}
                    className={`h-2 rounded-full transition-all ${activeSlide === index ? "w-8 bg-amber-700" : "w-2 bg-stone-300"}`}
                    onClick={() => setActiveSlide(index)}
                    aria-label={`Show ${image.title}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="atelier-film-section" aria-labelledby="atelier-film-title">
        <div className="atelier-film-copy">
          <p className="eyebrow">The KDR atelier</p>
          <h2 id="atelier-film-title">A closer look at the finish, fire, and craft.</h2>
          <p>
            Watch the details catch the light before you choose the piece that becomes part of a celebration.
          </p>
          <button className="btn-gold px-6 py-3" onClick={() => onNavigate("listing")}>
            View premium pieces
          </button>
        </div>
        <div className="atelier-film-frame">
          <video
            className="atelier-film"
            src="/campaign/brand-film.mp4"
            poster="/campaign/gift-wife.png"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="KDR jewellery brand film"
          />
          <div className="film-caption">
            <span>Fine jewellery edit</span>
            <strong>Crafted for grand entrances</strong>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Shop by craft</p>
            <h2>Choose your occasion</h2>
          </div>
          <button className="link-button" onClick={() => onNavigate("listing")}>View all</button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, index) => {
            const product = products.find((item) => item.category === category) || products[index];
            return (
              <button key={category} className="category-card text-left" onClick={() => onNavigate("listing", null, category)}>
                <ProductArt product={product} />
                <span className="font-serif text-2xl text-stone-950">{category}</span>
                <span className="mt-1 block text-sm text-stone-600">Curated pieces for refined styling</span>
              </button>
            );
          })}
        </div>
      </section>

      <ProductSection title="Best Sellers" subtitle="Most loved by shoppers this season" products={bestSellers} onNavigate={onNavigate} />
      <ProductSection title="New Arrivals" subtitle="Fresh pieces from the latest studio drop" products={newArrivals} onNavigate={onNavigate} />
      <ProductSection title="Wedding Collection" subtitle="Grand silhouettes for engagement, sangeet, and wedding day" products={wedding} onNavigate={onNavigate} />
    </>
  );
}

function ProductSection({ title, subtitle, products, onNavigate }) {
  return (
    <section className="section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{subtitle}</p>
          <h2>{title}</h2>
        </div>
        <button className="link-button" onClick={() => onNavigate("listing")}>Shop more</button>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
        ))}
      </div>
    </section>
  );
}
