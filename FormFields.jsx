import React from "react";

export function Section({ step, title, hint, children }) {
  return (
    <section className="border-b border-black/10 py-8 md:py-12 first:pt-2">
      <div className="flex items-baseline gap-3 mb-5">
        {step && <span className="font-mono text-xs text-black/30">{step}</span>}
        <h2 className="font-heading uppercase tracking-widest text-base md:text-lg">{title}</h2>
      </div>
      {hint && <p className="text-sm text-black/50 mb-5 -mt-2">{hint}</p>}
      {children}
    </section>
  );
}

export function Field({ label, required, error, children, id }) {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block metadata text-black/50 mb-2">
          {label}{required && <span className="text-black/30"> *</span>}
        </label>
      )}
      {children}
      {error && <p role="alert" className="text-xs text-red-600 mt-1.5">{error}</p>}
    </div>
  );
}

export function TextInput({ id, value, onChange, type = "text", placeholder, required }) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-required={required}
      className="w-full border border-black/15 bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
    />
  );
}

export function TextArea({ id, value, onChange, placeholder, rows = 4, required }) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      aria-required={required}
      className="w-full border border-black/15 bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors resize-none"
    />
  );
}

export function ChipGrid({ options, selected, onToggle, multi = true, columns = "grid-cols-2 sm:grid-cols-3" }) {
  const isSelected = (opt) => (multi ? selected.includes(opt) : selected === opt);
  const handle = (opt) => {
    if (multi) {
      onToggle(selected.includes(opt) ? selected.filter((o) => o !== opt) : [...selected, opt]);
    } else {
      onToggle(opt);
    }
  };
  return (
    <div className={`grid ${columns} gap-2`}>
      {options.map((opt) => (
        <button
          type="button"
          key={opt}
          onClick={() => handle(opt)}
          aria-pressed={isSelected(opt)}
          className={`text-left px-4 py-3 border text-sm transition-all ${isSelected(opt) ? "border-black bg-black text-white" : "border-black/15 hover:border-black/50"}`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

const SWATCHES = [
  { name: "Black", hex: "#000000" }, { name: "White", hex: "#ffffff" }, { name: "Silver", hex: "#c0c0c0" },
  { name: "Gold", hex: "#d4af37" }, { name: "Red", hex: "#dc2626" }, { name: "Orange", hex: "#ea580c" },
  { name: "Yellow", hex: "#facc15" }, { name: "Green", hex: "#16a34a" }, { name: "Blue", hex: "#2563eb" },
  { name: "Purple", hex: "#7c3aed" }, { name: "Pink", hex: "#ec4899" }, { name: "Brown", hex: "#78350f" },
  { name: "Grey", hex: "#6b7280" }, { name: "Navy", hex: "#1e3a8a" }, { name: "Beige", hex: "#e7d8c9" }
];

export function SwatchPicker({ selected, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {SWATCHES.map((s) => {
        const active = selected.includes(s.name);
        return (
          <button
            type="button"
            key={s.name}
            onClick={() => onToggle(active ? selected.filter((n) => n !== s.name) : [...selected, s.name])}
            title={s.name}
            aria-label={s.name}
            aria-pressed={active}
            className={`w-10 h-10 border-2 transition-all ${active ? "border-black scale-110 ring-2 ring-black/15" : "border-black/10 hover:border-black/40"}`}
            style={{ backgroundColor: s.hex }}
          />
        );
      })}
    </div>
  );
}