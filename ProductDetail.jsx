const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import { Image } from "@/components/ui/image";
import { ArrowLeft, Heart, ShoppingBag, Truck, MapPin, ShieldCheck, ZoomIn } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function ProductDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [accordion, setAccordion] = useState("condition");
  const { add } = useCart();

  useEffect(() => {
    setLoading(true);
    db.entities.Inventory.get(id)
      .then((res) => {
        const data = res.data || res;
        setItem(data);
        if (data && data.id) {
          db.entities.Inventory.update(data.id, { views: (data.views || 0) + 1 }).catch(() => {});
        }
      })
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-white">
        <div className="mx-auto max-w-[1600px] px-5 md:px-10 py-20 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-[3/4] bg-[#F5F5F5] animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-[#F5F5F5] animate-pulse w-3/4" />
            <div className="h-4 bg-[#F5F5F5] animate-pulse w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="pt-20 min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="font-heading uppercase text-3xl mb-3">Specimen Not Found</p>
          <Link to="/shop" className="metadata text-black/60 hover:text-black underline">Return to archive</Link>
        </div>
      </div>
    );
  }

  const photos = item.photos?.length ? item.photos : [];
  const specs = [
    { label: "Brand", value: item.brand },
    { label: "Category", value: item.category },
    { label: "Subcategory", value: item.subcategory },
    { label: "Colour", value: item.colour },
    { label: "Size", value: item.size },
    { label: "Material", value: item.material },
    { label: "Condition", value: item.condition_grade },
    { label: "Storage", value: item.storage_location },
  ].filter((s) => s.value);

  const measurements = item.measurements || {};

  return (
    <div className="pt-16 md:pt-20 min-h-screen bg-white">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10 py-6">
        <Link to="/shop" className="inline-flex items-center gap-2 metadata text-black/50 hover:text-black">
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> Back to archive
        </Link>
      </div>

      <div className="mx-auto max-w-[1600px] px-5 md:px-10 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 pb-20">
        {/* Left: photos 60% */}
        <div className="md:col-span-7">
          <div className="flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails */}
            {photos.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-x-visible">
                {photos.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhoto(i)}
                    className={`w-20 h-24 shrink-0 overflow-hidden border-2 transition-colors ${
                      activePhoto === i ? "border-black" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={p} alt="" fittingType="fit" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            {/* Main image */}
            <div className="flex-1 relative aspect-[3/4] bg-[#F5F5F5] overflow-hidden group">
              {photos[activePhoto] ? (
                <div
                  className="w-full h-full cursor-zoom-in"
                  onClick={() => setZoom(true)}
                >
                  <Image
                    src={photos[activePhoto]}
                    alt={item.title}
                    fittingType="fit"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="metadata text-black/30">No Image</span>
                </div>
              )}
              <button
                onClick={() => setZoom(true)}
                className="absolute bottom-4 right-4 bg-white/80 backdrop-blur p-3 hover:bg-white transition-colors"
                aria-label="Zoom"
              >
                <ZoomIn className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>

        {/* Right: sticky dossier 40% */}
        <div className="md:col-span-5">
          <div className="md:sticky md:top-28">
            {/* Metadata header */}
            <div className="flex justify-between items-center pb-4 border-b hairline">
              <p className="metadata text-black/40">SKU: {item.sku || item.inventory_id || "—"}</p>
              <p className="metadata text-black/40">INV-{item.inventory_id?.slice(-6) || item.id?.slice(-6)}</p>
            </div>

            {/* Title */}
            <div className="py-6">
              {item.brand && <p className="metadata text-black/40 mb-2">{item.brand}</p>}
              <h1 className="font-heading font-bold uppercase text-3xl md:text-4xl tracking-wide leading-none">
                {item.title}
              </h1>
            </div>

            {/* Price */}
            <p className="font-mono text-2xl mb-6">
              {item.sale_price != null ? `$${Number(item.sale_price).toLocaleString()}` : "Price on Application"}
            </p>

            {/* One-of-one declaration */}
            {item.is_one_of_one !== false && (
              <div className="border-2 border-[#C0C0C0] p-5 mb-6">
                <p className="font-heading uppercase tracking-widest text-sm">One-of-One</p>
                <p className="text-black/60 text-sm mt-1">This item is one-of-one and will not be restocked.</p>
              </div>
            )}

            {/* Quick meta */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <MetaItem icon={MapPin} label="Location" value={item.storage_location || "Archive"} />
              <MetaItem icon={Truck} label="Shipping" value="Australia Post · 2–5 days" />
              <MetaItem icon={ShieldCheck} label="Condition" value={item.condition_grade || "Graded"} />
              <MetaItem icon={ShoppingBag} label="Status" value={item.status || "Listed"} />
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={() => add(item)}
                disabled={item.status === "Sold"}
                className="flex-1 bg-black text-white py-5 font-heading uppercase tracking-widest text-sm hover:bg-black/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {item.status === "Sold" ? "Sold Out" : "Add To Cart"}
              </button>
              <button
                className="border hairline px-5 hover:bg-black hover:text-white transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Accordion sections */}
            <div className="border-t hairline">
              <Accordion
                id="condition"
                open={accordion === "condition"}
                onToggle={() => setAccordion(accordion === "condition" ? "" : "condition")}
                title="Condition Report"
              >
                <p className="text-black/60 text-sm leading-relaxed">
                  Graded <strong className="text-black">{item.condition_grade || "Not graded"}</strong>.
                  Each specimen is inspected and documented. Macro photography of specific wear points
                  accompanies every listing to ensure total buyer confidence.
                </p>
              </Accordion>
              <Accordion
                id="specs"
                open={accordion === "specs"}
                onToggle={() => setAccordion(accordion === "specs" ? "" : "specs")}
                title="Item Specifics"
              >
                <dl className="grid grid-cols-2 gap-y-3 text-sm">
                  {specs.map((s) => (
                    <div key={s.label} className="contents">
                      <dt className="metadata text-black/40">{s.label}</dt>
                      <dd className="text-black/80">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </Accordion>
              <Accordion
                id="measurements"
                open={accordion === "measurements"}
                onToggle={() => setAccordion(accordion === "measurements" ? "" : "measurements")}
                title="Measurements"
              >
                <dl className="grid grid-cols-2 gap-y-3 text-sm">
                  {measurements.length && <Spec label="Length" value={measurements.length} />}
                  {measurements.width && <Spec label="Width" value={measurements.width} />}
                  {measurements.height && <Spec label="Height" value={measurements.height} />}
                  {measurements.weight && <Spec label="Weight" value={measurements.weight} />}
                  {!measurements.length && !measurements.width && !measurements.height && (
                    <p className="text-black/40 text-sm">Measurements available on request.</p>
                  )}
                </dl>
              </Accordion>
              {item.description && (
                <Accordion
                  id="description"
                  open={accordion === "description"}
                  onToggle={() => setAccordion(accordion === "description" ? "" : "description")}
                  title="Description"
                >
                  <p className="text-black/60 text-sm leading-relaxed whitespace-pre-line">{item.description}</p>
                </Accordion>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Zoom modal */}
      {zoom && photos[activePhoto] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8 cursor-zoom-out"
          onClick={() => setZoom(false)}
        >
          <img src={photos[activePhoto]} alt={item.title} className="max-h-full max-w-full object-contain" />
          <button className="absolute top-6 right-6 text-white/70 hover:text-white" onClick={() => setZoom(false)}>
            ✕ Close
          </button>
        </div>
      )}
    </div>
  );
}

function MetaItem({ icon: Icon, label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-black/40" strokeWidth={1.5} />
        <span className="metadata text-black/40">{label}</span>
      </div>
      <span className="text-sm">{value}</span>
    </div>
  );
}

function Spec({ label, value }) {
  return (
    <>
      <dt className="metadata text-black/40">{label}</dt>
      <dd className="text-black/80">{value}</dd>
    </>
  );
}

function Accordion({ open, onToggle, title, children }) {
  return (
    <div className="border-b hairline">
      <button onClick={onToggle} className="w-full flex justify-between items-center py-4 text-left">
        <span className="font-heading uppercase tracking-wide text-sm">{title}</span>
        <span className="text-xl font-light">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="pb-5">{children}</div>}
    </div>
  );
}