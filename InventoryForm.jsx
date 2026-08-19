import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { CATEGORIES, STATUSES, LOCATIONS, PLATFORMS, generateSKU, qrUrl, formatPrice } from "./inventoryUtils";

export default function InventoryForm({ item, onSave, onClose }) {
  const [form, setForm] = useState({
    title: "", brand: "", category: "", subcategory: "", description: "",
    condition_grade: "", colour: "", size: "", material: "",
    purchase_price: "", estimated_value: "", sale_price: "",
    storage_location: "", date_acquired: "", date_listed: new Date().toISOString().slice(0, 10),
    platform_listed: [], listing_url: "", status: "Unprocessed",
    notes: "", is_one_of_one: true, featured: false,
    measurements: { length: "", width: "", height: "", weight: "" },
    container: "",
    sku: "", inventory_id: "", photos: [],
  });

  useEffect(() => {
    if (item) {
      setForm({ ...form, ...item, measurements: { ...form.measurements, ...(item.measurements || {}) } });
    }
  }, [item]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const setMeas = (key, val) => setForm((f) => ({ ...f, measurements: { ...f.measurements, [key]: val } }));

  const togglePlatform = (p) => {
    setForm((f) => ({
      ...f,
      platform_listed: f.platform_listed?.includes(p)
        ? f.platform_listed.filter((x) => x !== p)
        : [...(f.platform_listed || []), p],
    }));
  };

  const handleSave = () => {
    const data = { ...form };
    if (!data.sku) data.sku = generateSKU(data.category, Math.floor(Math.random() * 9000) + 1000);
    if (!data.inventory_id) data.inventory_id = `INV-${Date.now().toString().slice(-8)}`;
    if (!data.barcode) data.barcode = data.sku;
    ["purchase_price", "estimated_value", "sale_price"].forEach((k) => {
      if (data[k] !== "") data[k] = Number(data[k]);
    });
    onSave(data);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-black border border-white/15 w-full max-w-3xl my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-black border-b border-white/15 px-6 py-4 flex justify-between items-center z-10">
          <div>
            <p className="text-[0.6rem] uppercase tracking-widest text-white/40 font-mono">{item ? "Edit Specimen" : "New Specimen"}</p>
            <h2 className="font-heading uppercase tracking-wide text-lg">{form.title || "Untitled"}</h2>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X className="w-5 h-5" strokeWidth={1.5} /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Core */}
          <Section title="Core Details">
            <Input label="Title *" value={form.title} onChange={(v) => set("title", v)} full />
            <Input label="Brand" value={form.brand} onChange={(v) => set("brand", v)} />
            <Select label="Category" value={form.category} onChange={(v) => set("category", v)} options={CATEGORIES} />
            <Input label="Subcategory" value={form.subcategory} onChange={(v) => set("subcategory", v)} />
            <Select label="Status" value={form.status} onChange={(v) => set("status", v)} options={STATUSES} />
          </Section>

          {/* Spec */}
          <Section title="Item Specifics">
            <Input label="Colour" value={form.colour} onChange={(v) => set("colour", v)} />
            <Input label="Size" value={form.size} onChange={(v) => set("size", v)} />
            <Input label="Material" value={form.material} onChange={(v) => set("material", v)} />
            <Input label="Condition Grade" value={form.condition_grade} onChange={(v) => set("condition_grade", v)} placeholder="9/10 - Excellent" />
            <Input label="Description" value={form.description} onChange={(v) => set("description", v)} full textarea />
          </Section>

          {/* Measurements */}
          <Section title="Measurements">
            <Input label="Length" value={form.measurements.length} onChange={(v) => setMeas("length", v)} />
            <Input label="Width" value={form.measurements.width} onChange={(v) => setMeas("width", v)} />
            <Input label="Height" value={form.measurements.height} onChange={(v) => setMeas("height", v)} />
            <Input label="Weight" value={form.measurements.weight} onChange={(v) => setMeas("weight", v)} />
          </Section>

          {/* Pricing */}
          <Section title="Pricing (AUD)">
            <Input label="Purchase Price" value={form.purchase_price} onChange={(v) => set("purchase_price", v)} type="number" />
            <Input label="Estimated Value" value={form.estimated_value} onChange={(v) => set("estimated_value", v)} type="number" />
            <Input label="Sale Price" value={form.sale_price} onChange={(v) => set("sale_price", v)} type="number" />
          </Section>

          {/* Location & dates */}
          <Section title="Location & Dates">
            <Select label="Storage Location" value={form.storage_location} onChange={(v) => set("storage_location", v)} options={LOCATIONS} />
            <Input label="Container (code)" value={form.container} onChange={(v) => set("container", v)} placeholder="e.g. C001 — from printed QR" />
            <Input label="Date Acquired" value={form.date_acquired} onChange={(v) => set("date_acquired", v)} type="date" />
            <Input label="Date Listed" value={form.date_listed} onChange={(v) => set("date_listed", v)} type="date" />
            <Input label="Listing URL" value={form.listing_url} onChange={(v) => set("listing_url", v)} full />
          </Section>

          {/* Multi-channel */}
          <Section title="Platform Listings">
            <div className="col-span-2 flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlatform(p)}
                  className={`metadata border px-3 py-1.5 transition-colors ${
                    form.platform_listed?.includes(p) ? "bg-white text-black border-white" : "border-white/20 text-white/50 hover:border-white/50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </Section>

          {/* Toggles */}
          <Section title="Flags">
            <Toggle label="One-of-One" value={form.is_one_of_one} onChange={(v) => set("is_one_of_one", v)} />
            <Toggle label="Featured" value={form.featured} onChange={(v) => set("featured", v)} />
          </Section>

          <Input label="Notes" value={form.notes} onChange={(v) => set("notes", v)} full textarea />

          {/* Auto-generated preview */}
          <div className="border border-white/15 p-4 grid grid-cols-3 gap-4 items-center">
            <div className="col-span-2">
              <p className="text-[0.6rem] uppercase tracking-widest text-white/40 font-mono mb-1">QR Code (auto-generated)</p>
              <p className="font-mono text-sm text-white/70">SKU: {form.sku || generateSKU(form.category, 1000)}</p>
              <p className="font-mono text-xs text-white/40 mt-1">Scans open this inventory record</p>
            </div>
            <img src={qrUrl(form.sku || generateSKU(form.category, 1000))} alt="QR" className="w-20 h-20 ml-auto" />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-black border-t border-white/15 px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} className="metadata border border-white/20 px-6 py-3 hover:bg-white/5">Cancel</button>
          <button onClick={handleSave} className="metadata bg-white text-black px-6 py-3 hover:bg-white/80">Save Specimen</button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <p className="text-[0.6rem] uppercase tracking-widest text-white/40 font-mono mb-3 border-b border-white/10 pb-2">{title}</p>
      <div className="grid grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", full, textarea, placeholder }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="text-[0.6rem] uppercase tracking-widest text-white/40 font-mono block mb-1.5">{label}</label>
      {textarea ? (
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder={placeholder}
          className="w-full bg-transparent border border-white/15 px-3 py-2 text-sm focus:outline-none focus:border-white/50 resize-none"
        />
      ) : (
        <input
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent border border-white/15 px-3 py-2 text-sm focus:outline-none focus:border-white/50"
        />
      )}
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-[0.6rem] uppercase tracking-widest text-white/40 font-mono block mb-1.5">{label}</label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-black border border-white/15 px-3 py-2 text-sm focus:outline-none focus:border-white/50"
      >
        <option value="">—</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex items-center gap-3 metadata text-white/70"
    >
      <span className={`w-9 h-5 border ${value ? "bg-white border-white" : "border-white/20"} relative transition-colors`}>
        <span className={`absolute top-0.5 w-3.5 h-3.5 bg-black transition-all ${value ? "left-5" : "left-0.5 bg-white/40"}`} />
      </span>
      {label}: {value ? "Yes" : "No"}
    </button>
  );
}