const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from "react";
import { Plus, Trash2, X, Truck } from "lucide-react";

import { formatPrice } from "./inventoryUtils";

const TEMPLATES = {
  "Australia Post": "https://auspost.com.au/mypost/track/#/details/{tracking}",
  Sendle: "https://www.sendle.com/track/{tracking}",
  DHL: "https://www.dhl.com/au/en/express/tracking.html?AWB={tracking}&submit=1",
  Manual: "",
};

export default function ShippingRates({ onClose }) {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    service_name: "Standard",
    carrier: "Australia Post",
    zone: "Domestic",
    weight_kg_max: 1,
    price: 9.95,
    eta_days: "2-4 business days",
    tracking_url_template: TEMPLATES["Australia Post"],
  });

  const load = () => {
    setLoading(true);
    db.entities.ShippingRate.list("-created_date", 200)
      .then((res) => {
        const d = res.data || res || [];
        setRates(Array.isArray(d) ? d : []);
      })
      .catch(() => setRates([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.service_name || form.price == null) return;
    await db.entities.ShippingRate.create({
      ...form,
      weight_kg_max: Number(form.weight_kg_max) || 0,
      price: Number(form.price) || 0,
      tracking_url_template: form.tracking_url_template || undefined,
    });
    setForm((f) => ({ ...f }));
    load();
  };

  const remove = async (id) => {
    if (!confirm("Delete this rate tier?")) return;
    await db.entities.ShippingRate.delete(id);
    load();
  };

  const inputCls = "bg-transparent border border-white/15 px-3 py-2 text-sm focus:outline-none focus:border-white/50";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-black border border-white/15 w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="border-b border-white/15 px-6 py-4 flex justify-between items-center">
          <div>
            <p className="text-[0.6rem] uppercase tracking-widest text-white/40 font-mono">Shipping Rates</p>
            <h2 className="font-heading uppercase tracking-wide text-lg">Rate Tier Manager</h2>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X className="w-5 h-5" strokeWidth={1.5} /></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Add form */}
          <div className="border border-white/15 p-4 space-y-3">
            <p className="metadata text-white/40">New Rate Tier</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <input value={form.service_name} onChange={(e) => setForm({ ...form, service_name: e.target.value })} placeholder="Service (e.g. Standard)" className={inputCls} />
              <select value={form.carrier} onChange={(e) => setForm({ ...form, carrier: e.target.value, tracking_url_template: TEMPLATES[e.target.value] ?? form.tracking_url_template })} className={inputCls}>
                {Object.keys(TEMPLATES).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} className={inputCls}>
                <option value="Domestic">Domestic</option>
                <option value="International">International</option>
              </select>
              <input type="number" min="0" step="0.1" value={form.weight_kg_max} onChange={(e) => setForm({ ...form, weight_kg_max: e.target.value })} placeholder="Max weight (kg)" className={inputCls} />
              <input type="number" min="0" step="0.05" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price (AUD)" className={inputCls} />
              <input value={form.eta_days} onChange={(e) => setForm({ ...form, eta_days: e.target.value })} placeholder="ETA" className={inputCls} />
              <input value={form.tracking_url_template} onChange={(e) => setForm({ ...form, tracking_url_template: e.target.value })} placeholder="Tracking URL template ({tracking})" className={`${inputCls} col-span-2 md:col-span-3`} />
            </div>
            <button onClick={add} className="w-full bg-white text-black py-3 font-heading uppercase tracking-widest text-xs flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" strokeWidth={1.5} /> Add Rate Tier
            </button>
          </div>

          {/* List */}
          <div>
            <p className="metadata text-white/40 mb-3">{rates.length} rate tiers</p>
            {loading ? (
              <p className="text-white/30 text-sm text-center py-8">Loading…</p>
            ) : rates.length === 0 ? (
              <div className="border border-dashed border-white/15 p-8 text-center">
                <Truck className="w-8 h-8 mx-auto mb-3 text-white/30" strokeWidth={1} />
                <p className="text-white/40 text-sm">No rate tiers yet. Add tiers above to quote shipping in the Shipping Manager.</p>
              </div>
            ) : (
              <div className="border border-white/10 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left">
                      {["Service", "Carrier", "Zone", "≤ kg", "Price", "ETA", ""].map((h) => (
                        <th key={h} className="p-3 text-[0.6rem] uppercase tracking-widest text-white/40 font-mono">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rates.map((r) => (
                      <tr key={r.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-3">{r.service_name}</td>
                        <td className="p-3 text-white/60">{r.carrier}</td>
                        <td className="p-3 text-white/60">{r.zone}</td>
                        <td className="p-3 font-mono text-white/60">{r.weight_kg_max}</td>
                        <td className="p-3 font-mono">{formatPrice(r.price)}</td>
                        <td className="p-3 text-white/50 text-xs">{r.eta_days}</td>
                        <td className="p-3 text-right">
                          <button onClick={() => remove(r.id)} className="text-white/30 hover:text-red-400 p-1"><Trash2 className="w-4 h-4" strokeWidth={1.5} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}