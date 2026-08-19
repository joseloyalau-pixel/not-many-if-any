const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { SlidersHorizontal, X, Search } from "lucide-react";
import ProductCard from "@/components/site/ProductCard";

const CATEGORIES = ["Apparel", "Sneakers", "Footwear", "Collectibles", "Homewares", "Vintage", "Accessories", "One-of-One"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "38", "39", "40", "41", "42", "43", "44", "OS"];
const CONDITIONS = ["10/10 - New", "9/10 - Excellent", "8/10 - Very Good", "7/10 - Good", "6/10 - Fair"];
const LOCATIONS = ["Garage", "Bedroom", "Caravan", "Sunshine Storage", "Yarraville Storage"];

const SORTS = [
  { label: "Newest", value: "-created_date" },
  { label: "Oldest", value: "created_date" },
  { label: "Highest Price", value: "-sale_price" },
  { label: "Lowest Price", value: "sale_price" },
  { label: "Most Viewed", value: "-views" },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [keyword, setKeyword] = useState("");

  const sort = searchParams.get("sort") || "-created_date";
  const filters = {
    category: searchParams.get("category") || "",
    size: searchParams.get("size") || "",
    condition: searchParams.get("condition") || "",
    location: searchParams.get("location") || "",
  };

  useEffect(() => {
    setLoading(true);
    db.entities.Inventory.list(sort, 200)
      .then((res) => {
        const data = res.data || res || [];
        setAllItems(Array.isArray(data) ? data : []);
      })
      .catch(() => setAllItems([]))
      .finally(() => setLoading(false));
  }, [sort]);

  const filtered = useMemo(() => {
    let result = allItems;
    if (filters.category) result = result.filter((i) => i.category === filters.category);
    if (filters.size) result = result.filter((i) => i.size === filters.size);
    if (filters.condition) result = result.filter((i) => i.condition_grade === filters.condition);
    if (filters.location) result = result.filter((i) => i.storage_location === filters.location);
    if (keyword.trim()) {
      const k = keyword.toLowerCase();
      result = result.filter((i) =>
        [i.title, i.brand, i.category, i.sku, i.subcategory, i.colour, i.storage_location]
          .filter(Boolean)
          .some((v) => v.toLowerCase().includes(k))
      );
    }
    return result;
  }, [allItems, filters, keyword]);

  const setFilter = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val);
    else next.delete(key);
    setSearchParams(next);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="pt-16 md:pt-20 min-h-screen bg-white">
      {/* Header */}
      <div className="border-b hairline">
        <div className="mx-auto max-w-[1600px] px-5 md:px-10 py-12 md:py-20">
          <p className="metadata text-black/40 mb-3">The Archive</p>
          <h1 className="font-heading font-bold uppercase text-4xl md:text-7xl tracking-wide">Shop</h1>
          <p className="mt-4 text-black/50 max-w-xl">
            Curated pre-owned specimens. Every item is one-of-one and will not be restocked.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="sticky top-16 md:top-20 z-30 bg-white/95 backdrop-blur-md border-b hairline">
        <div className="mx-auto max-w-[1600px] px-5 md:px-10 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <Search className="w-4 h-4 text-black/40 shrink-0" strokeWidth={1.5} />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search SKU, brand, keyword…"
              className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-black/30"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 metadata text-black/70 hover:text-black"
            >
              <SlidersHorizontal className="w-4 h-4" strokeWidth={1.5} />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-black text-white text-[0.6rem] w-4 h-4 flex items-center justify-center">{activeFilterCount}</span>
              )}
            </button>
            <select
              value={sort}
              onChange={(e) => { const n = new URLSearchParams(searchParams); n.set("sort", e.target.value); setSearchParams(n); }}
              className="metadata text-black/70 bg-transparent border hairline px-3 py-2 focus:outline-none focus:border-black cursor-pointer"
            >
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {/* Filter panel */}
        {filtersOpen && (
          <div className="border-t hairline bg-white">
            <div className="mx-auto max-w-[1600px] px-5 md:px-10 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <FilterGroup label="Category" options={CATEGORIES} value={filters.category} onChange={(v) => setFilter("category", v)} />
              <FilterGroup label="Size" options={SIZES} value={filters.size} onChange={(v) => setFilter("size", v)} />
              <FilterGroup label="Condition" options={CONDITIONS} value={filters.condition} onChange={(v) => setFilter("condition", v)} />
              <FilterGroup label="Location" options={LOCATIONS} value={filters.location} onChange={(v) => setFilter("location", v)} />
            </div>
          </div>
        )}
      </div>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="mx-auto max-w-[1600px] px-5 md:px-10 py-4 flex flex-wrap gap-2">
          {Object.entries(filters).filter(([, v]) => v).map(([k, v]) => (
            <button
              key={k}
              onClick={() => setFilter(k, "")}
              className="inline-flex items-center gap-2 border hairline px-3 py-1.5 metadata text-black/70 hover:bg-black hover:text-white"
            >
              {v} <X className="w-3 h-3" strokeWidth={1.5} />
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="mx-auto max-w-[1600px] px-5 md:px-10 py-10">
        <div className="flex justify-between items-center mb-8">
          <p className="metadata text-black/40">{filtered.length} {filtered.length === 1 ? "Specimen" : "Specimens"}</p>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10 md:gap-x-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-[#F5F5F5] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-32 text-center">
            <p className="font-heading uppercase tracking-wide text-2xl mb-2">No Specimens Found</p>
            <p className="metadata text-black/40">Adjust your filters or search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10 md:gap-x-6">
            {filtered.map((item, i) => (
              <ProductCard key={item.id} item={item} large={i === 0 && item.featured} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterGroup({ label, options, value, onChange }) {
  return (
    <div>
      <p className="metadata text-black/40 mb-3">{label}</p>
      <div className="flex flex-col gap-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(value === opt ? "" : opt)}
            className={`text-left text-sm py-1 transition-colors ${value === opt ? "font-medium" : "text-black/60 hover:text-black"}`}
          >
            {value === opt && <span className="inline-block w-3">●</span>}
            {value !== opt && <span className="inline-block w-3">○</span>}
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}