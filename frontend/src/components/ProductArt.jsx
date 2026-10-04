export default function ProductArt({ product, size = "card" }) {
  const [gold, gem, pale] = product.palette;
  const isLarge = size === "large";
  const isRing = product.category === "Rings";
  const isBangle = product.category === "Bangles";
  const isEarring = product.category === "Earrings";
  const isSet = product.category === "Wedding" || product.category === "Necklaces";

  return (
    <div className={`product-art ${isLarge ? "product-art-large" : ""}`}>
      <div className="arch-glow" style={{ background: `radial-gradient(circle, ${pale}, transparent 64%)` }} />
      <svg viewBox="0 0 360 360" className="h-full w-full" role="img" aria-label={product.name}>
        <defs>
          <linearGradient id={`gold-${product.id}`} x1="0" x2="1">
            <stop offset="0" stopColor="#fff1b5" />
            <stop offset="0.5" stopColor={gold} />
            <stop offset="1" stopColor={gem} />
          </linearGradient>
          <filter id={`soft-${product.id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#4b2a16" floodOpacity=".22" />
          </filter>
        </defs>
        <path d="M74 316V142C74 78 121 34 180 34s106 44 106 108v174Z" fill="#fffaf0" stroke="#ead9b8" strokeWidth="3" />
        {isRing && (
          <g filter={`url(#soft-${product.id})`}>
            <circle cx="180" cy="205" r="68" fill="none" stroke={`url(#gold-${product.id})`} strokeWidth="22" />
            <path d="M145 158c22-35 49-35 70 0" fill="none" stroke="#fff6ce" strokeWidth="8" />
            <circle cx="180" cy="124" r="32" fill={gem} stroke="#fff7cc" strokeWidth="10" />
            <circle cx="180" cy="124" r="15" fill="#fff" opacity=".7" />
          </g>
        )}
        {isBangle && (
          <g filter={`url(#soft-${product.id})`}>
            <ellipse cx="180" cy="190" rx="90" ry="74" fill="none" stroke={`url(#gold-${product.id})`} strokeWidth="24" />
            <ellipse cx="180" cy="190" rx="56" ry="43" fill="none" stroke="#fff8dc" strokeWidth="8" />
            {[112, 142, 180, 218, 248].map((x) => (
              <circle key={x} cx={x} cy="140" r="8" fill={gem} />
            ))}
          </g>
        )}
        {isEarring && (
          <g filter={`url(#soft-${product.id})`}>
            {[142, 218].map((x) => (
              <g key={x}>
                <circle cx={x} cy="112" r="21" fill={`url(#gold-${product.id})`} />
                <path d={`M${x} 136c-32 45-20 91 0 116 20-25 32-71 0-116Z`} fill={gold} stroke={gem} strokeWidth="5" />
                <circle cx={x} cy="186" r="18" fill="#fffef8" opacity=".82" />
                <circle cx={x} cy="252" r="11" fill={gem} />
              </g>
            ))}
          </g>
        )}
        {isSet && (
          <g filter={`url(#soft-${product.id})`}>
            <path d="M93 128c23 79 56 120 87 120s64-41 87-120" fill="none" stroke={`url(#gold-${product.id})`} strokeWidth="22" />
            <path d="M118 138c19 55 40 82 62 82s43-27 62-82" fill="none" stroke="#fff4bf" strokeWidth="8" />
            {[114, 142, 180, 218, 246].map((x, index) => (
              <circle key={x} cx={x} cy={index === 2 ? 250 : 224} r={index === 2 ? 18 : 12} fill={gem} stroke="#fff8dc" strokeWidth="5" />
            ))}
          </g>
        )}
        {!isRing && !isBangle && !isEarring && !isSet && (
          <g filter={`url(#soft-${product.id})`}>
            <path d="M180 78v170" stroke={`url(#gold-${product.id})`} strokeWidth="10" />
            <circle cx="180" cy="202" r="48" fill={gold} stroke={gem} strokeWidth="8" />
            <circle cx="180" cy="202" r="24" fill="#fffdf4" opacity=".85" />
          </g>
        )}
      </svg>
    </div>
  );
}
