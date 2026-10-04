import { useState } from "react";

export default function CampaignImage({ image, className = "" }) {
  const sources = image.sources || [image.src];
  const [sourceIndex, setSourceIndex] = useState(0);
  const failed = sourceIndex >= sources.length;
  const src = failed ? "" : `${sources[sourceIndex]}?v=campaign-20260709`;

  if (failed) {
    return (
      <div className={`grid h-full w-full place-items-center bg-gradient-to-br from-amber-50 via-orange-100 to-stone-100 ${className}`}>
        <div className="px-6 text-center">
          <p className="eyebrow">{image.title}</p>
          <p className="mt-3 font-serif text-3xl text-stone-950">{image.relation}</p>
          <p className="mt-2 text-sm text-stone-600">Add image file at {image.src}</p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={image.title}
      className={`h-full w-full object-cover ${className}`}
      loading="lazy"
      onError={() => setSourceIndex((current) => current + 1)}
    />
  );
}
