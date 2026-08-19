import React from "react";

const STATUSES = ["Unprocessed", "Awaiting Photos", "Ready To List", "Listed", "Sold", "Shipped", "Archived"];

const statusColors = {
  Unprocessed: "text-white/40 border-white/15",
  "Awaiting Photos": "text-yellow-400 border-yellow-400/30",
  "Ready To List": "text-blue-400 border-blue-400/30",
  Listed: "text-green-400 border-green-400/30",
  Sold: "text-purple-400 border-purple-400/30",
  Shipped: "text-cyan-400 border-cyan-400/30",
  Archived: "text-white/30 border-white/10",
};

export default function InventoryStats({ items }) {
  const total = items.length;
  const totalValue = items.reduce((s, i) => s + (Number(i.estimated_value) || 0), 0);
  const potentialRevenue = items.reduce((s, i) => s + (Number(i.sale_price) || 0), 0);
  const listed = items.filter((i) => i.status === "Listed").length;
  const awaiting = items.filter((i) => i.status === "Ready To List" || i.status === "Awaiting Photos").length;
  const sold = items.filter((i) => i.status === "Sold" || i.status === "Shipped").length;

  const stats = [
    { label: "Total Inventory", value: total },
    { label: "Total Value", value: `$${totalValue.toLocaleString()}` },
    { label: "Potential Revenue", value: `$${potentialRevenue.toLocaleString()}` },
    { label: "Listed", value: listed },
    { label: "Awaiting Listing", value: awaiting },
    { label: "Sold", value: sold },
  ];

  const byCategory = STATUSES.map((st) => ({
    status: st,
    count: items.filter((i) => i.status === st).length,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-white/10">
        {stats.map((s) => (
          <div key={s.label} className="bg-black p-5">
            <p className="text-[0.6rem] uppercase tracking-widest text-white/40 font-mono mb-2">{s.label}</p>
            <p className="font-heading text-2xl md:text-3xl tracking-wide">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {byCategory.map((c) => (
          <span key={c.status} className={`metadata border px-2 py-1 ${statusColors[c.status]}`}>
            {c.status}: {c.count}
          </span>
        ))}
      </div>
    </div>
  );
}