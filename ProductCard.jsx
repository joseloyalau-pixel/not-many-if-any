import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ item, large = false }) {
  const [hovered, setHovered] = useState(false);
  const { add } = useCart();
  const photo = item.photos?.[0] || item.photo || "";
  const price = item.sale_price != null ? `$${Number(item.sale_price).toLocaleString()}` : "POA";

  return (
    <Link
      to={`/product/${item.id}`}
      className={`group block ${large ? "md:col-span-2" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-[3/4] bg-[#F5F5F5] overflow-hidden">
        {photo ? (
          <Image
            src={photo}
            alt={item.title}
            fittingType="fit"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="metadata text-black/30">No Image</span>
          </div>
        )}

        {/* Overlay on hover */}
        <div
          className={`absolute inset-0 bg-black/0 transition-all duration-300 flex flex-col justify-end p-4 ${
            hovered ? "bg-black/60" : "opacity-0"
          }`}
        >
          <div className={`transition-all duration-300 ${hovered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
            <p className="metadata text-white/70 mb-1">
              {item.condition_grade || "Graded"} · {item.storage_location || "Archive"}
            </p>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); add(item); }}
              disabled={item.status === "Sold"}
              className="bg-white text-black px-4 py-2 font-heading uppercase tracking-widest text-xs hover:bg-white/80 mt-2 disabled:opacity-50"
            >
              {item.status === "Sold" ? "Sold Out" : "Add To Cart"}
            </button>
          </div>
        </div>

        {/* One-of-one badge */}
        {item.is_one_of_one !== false && (
          <div className="absolute top-3 left-3 bg-black text-white px-2 py-1">
            <span className="metadata text-[0.6rem]">1/1</span>
          </div>
        )}
        {item.featured && (
          <div className="absolute top-3 right-3 border hairline border-black bg-white px-2 py-1">
            <span className="metadata text-[0.6rem]">Featured</span>
          </div>
        )}
      </div>

      <div className="pt-3 flex justify-between items-start gap-2">
        <div className="min-w-0">
          {item.brand && <p className="metadata text-black/40 truncate">{item.brand}</p>}
          <h3 className="font-heading uppercase tracking-wide text-sm md:text-base truncate">{item.title}</h3>
        </div>
        <p className="font-mono text-sm whitespace-nowrap">{price}</p>
      </div>
    </Link>
  );
}