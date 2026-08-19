const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useMemo, useState } from "react";
import { Truck, X, Printer, Save, ExternalLink, Package } from "lucide-react";

import { qrUrl, formatPrice } from "./inventoryUtils";

const RETURN_SENDER = {
  name: "NOT MANY IF ANY",
  line1: "Melbourne, VIC, Australia",
  line2: "support@notmanyifany.com",
};

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function providerForCarrier(carrier) {
  const c = (carrier || "").toLowerCase();
  if (c.includes("australia") || c.includes("auspost")) return "Australia Post";
  if (c.includes("pickup")) return "Pickup";
  return "Manual";
}

function defaultTrackingTemplate(carrier) {
  const c = (carrier || "").toLowerCase();
  if (c.includes("sendle")) return "https://www.sendle.com/track/{tracking}";
  if (c.includes("dhl")) return "https://www.dhl.com/au/en/express/tracking.html?AWB={tracking}&submit=1";
  return "https://auspost.com.au/mypost/track/#/details/{tracking}";
}

export default function ShippingManager({ item, onClose, onDone }) {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zone, setZone] = useState("Domestic");
  const [weight, setWeight] = useState(0.5);
  const [service, setService] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [address, setAddress] = useState("");
  const [postcode, setPostcode] = useState("");
  const [country, setCountry] = useState("Australia");
  const [tracking, setTracking] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    db.entities.ShippingRate.list("-created_date", 200)
      .then((res) => {
        const d = res.data || res || [];
        setRates(Array.isArray(d) ? d : []);
      })
      .catch(() => setRates([]))
      .finally(() => setLoading(false));
  }, []);

  const zoneRates = useMemo(() => rates.filter((r) => r.zone === zone), [rates, zone]);

  const services = useMemo(() => {
    const map = {};
    zoneRates.forEach((r) => {
      if (!map[r.service_name]) map[r.service_name] = [];
      map[r.service_name].push(r);
    });
    return Object.entries(map).map(([name, tiers]) => ({
      name,
      tiers: tiers.sort((a, b) => (a.weight_kg_max || 0) - (b.weight_kg_max || 0)),
    }));
  }, [zoneRates]);

  useEffect(() => {
    if (services.length && !services.find((s) => s.name === service)) {
      setService(services[0].name);
    }
    if (!services.length) setService("");
  }, [services, service]);

  const quotedRate = useMemo(() => {
    if (!service) return null;
    const svc = services.find((s) => s.name === service);
    if (!svc) return null;
    const w = Number(weight) || 0;
    return svc.tiers.find((t) => (t.weight_kg_max || 0) >= w) || svc.tiers[svc.tiers.length - 1] || null;
  }, [service, services, weight]);

  const carrier = quotedRate?.carrier || "Australia Post";
  const trackingTemplate = quotedRate?.tracking_url_template || defaultTrackingTemplate(carrier);
  const trackLink = tracking ? trackingTemplate.replace("{tracking}", encodeURIComponent(tracking)) : null;

  const printLabel = () => {
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Shipping Label — ${escapeHtml(item.title)}</title>
      <style>
        @page { margin: 10mm; size: 100mm 150mm; }
        body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #000; margin: 0; }
        .label { border: 2px solid #000; padding: 14px; display: flex; flex-direction: column; height: 100vh; box-sizing: border-box; }
        .brand { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #000; padding-bottom: 8px; }
        .brand .nmi { font-weight: 800; letter-spacing: 1px; font-size: 13px; }
        .brand .tag { font-size: 8px; letter-spacing: 2px; text-transform: uppercase; color: #555; }
        .from { font-size: 9px; color: #444; margin-top: 10px; }
        .from b { text-transform: uppercase; letter-spacing: 1px; font-size: 8px; color: #888; }
        .to { margin-top: 12px; border: 1px solid #000; padding: 10px; }
        .to b { font-size: 8px; letter-spacing: 2px; text-transform: uppercase; color: #888; display: block; margin-bottom: 4px; }
        .to .name { font-weight: 700; font-size: 16px; text-transform: uppercase; }
        .to .line { font-size: 13px; margin-top: 2px; }
        .meta { display: flex; gap: 8px; margin-top: 12px; font-size: 9px; }
        .meta .col { flex: 1; border: 1px solid #ccc; padding: 6px; }
        .meta .col b { display: block; font-size: 7px; letter-spacing: 1px; color: #888; text-transform: uppercase; margin-bottom: 2px; }
        .track { margin-top: auto; display: flex; gap: 10px; align-items: center; border-top: 1px solid #000; padding-top: 10px; }
        .track .qr img { width: 80px; height: 80px; display: block; }
        .track .info { flex: 1; }
        .track .info b { font-size: 7px; letter-spacing: 2px; color: #888; text-transform: uppercase; }
        .track .info .num { font-family: monospace; font-size: 14px; letter-spacing: 1px; }
        .item { font-size: 9px; color: #444; margin-top: 10px; }
      </style></head><body>
      <div class="label">
        <div class="brand">
          <div class="nmi">NOT MANY IF ANY</div>
          <div class="tag">Parcel Label</div>
        </div>
        <div class="from">
          <b>From</b><br/>
          ${escapeHtml(RETURN_SENDER.name)}<br/>${escapeHtml(RETURN_SENDER.line1)}<br/>${escapeHtml(RETURN_SENDER.line2)}
        </div>
        <div class="to">
          <b>Deliver To</b>
          <div class="name">${escapeHtml(recipientName || "Recipient")}</div>
          <div class="line">${escapeHtml(address)}</div>
          <div class="line">${[postcode, country].filter(Boolean).map(escapeHtml).join(" ")}</div>
        </div>
        <div class="meta">
          <div class="col"><b>Service</b>${escapeHtml(service || quotedRate?.service_name || "—")}</div>
          <div class="col"><b>Carrier</b>${escapeHtml(carrier)}</div>
          <div class="col"><b>Weight</b>${Number(weight || 0).toFixed(2)} kg</div>
          <div class="col"><b>Postage</b>${quotedRate ? formatPrice(quotedRate.price) : "—"}</div>
        </div>
        <div class="item">Item: ${escapeHtml(item.title)} · ${escapeHtml(item.sku || "")}</div>
        <div class="track">
          <div class="qr"><img src="${qrUrl(tracking || item.sku || item.id)}" alt="QR" /></div>
          <div class="info">
            <b>Tracking No.</b>
            <div class="num">${escapeHtml(tracking || "— to be assigned —")}</div>
          </div>
        </div>
      </div>
      </body></html>`;

    const w = window.open("", "_blank");
    if (!w) {
      alert("Allow pop-ups to print the shipping label.");
      return;
    }
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 500);
  };

  const saveShipment = async () => {
    setSaving(true);
    try {
      const fullAddress = [recipientName, address, postcode, country].filter(Boolean).join(", ");
      await db.entities.Sale.create({
        inventory_id_ref: item.id,
        sku: item.sku,
        title: item.title,
        sale_platform: "In-Store",
        final_price: item.sale_price,
        purchase_price: item.purchase_price,
        shipping_provider: providerForCarrier(carrier),
        tracking_number: tracking || undefined,
        shipping_address: fullAddress || undefined,
      });
      await db.entities.Inventory.update(item.id, { status: "Shipped" });
      setSaved(true);
      onDone?.();
    } catch (e) {
      alert("Error saving shipment: " + (e.message || e));
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "bg-transparent border border-white/15 px-3 py-2 text-sm focus:outline-none focus:border-white/50";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-black border border-white/15 w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="border-b border-white/15 px-6 py-4 flex justify-between items-center">
          <div>
            <p className="text-[0.6rem] uppercase tracking-widest text-white/40 font-mono">Shipping Manager</p>
            <h2 className="font-heading uppercase tracking-wide text-lg truncate">{item.title}</h2>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X className="w-5 h-5" strokeWidth={1.5} /></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Destination */}
          <div className="space-y-3">
            <p className="metadata text-white/40">Destination</p>
            <div className="grid grid-cols-2 gap-3">
              <select value={zone} onChange={(e) => { setZone(e.target.value); setCountry(e.target.value === "Domestic" ? "Australia" : ""); }} className={inputCls}>
                <option value="Domestic">Domestic (AU)</option>
                <option value="International">International</option>
              </select>
              <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" className={inputCls} />
            </div>
            <input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Recipient name" className={`${inputCls} col-span-2 w-full`} />
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street address" rows={2} className={`${inputCls} w-full resize-none`} />
            <div className="grid grid-cols-2 gap-3">
              <input value={postcode} onChange={(e) => setPostcode(e.target.value)} placeholder="Postcode / ZIP" className={inputCls} />
              <input type="number" min="0" step="0.05" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Weight (kg)" className={inputCls} />
            </div>
          </div>

          {/* Rate quote */}
          <div className="border border-white/15 p-4 space-y-3">
            <p className="metadata text-white/40">Rate Quote</p>
            {loading ? (
              <p className="text-white/30 text-sm">Loading rates…</p>
            ) : services.length === 0 ? (
              <p className="text-white/40 text-sm">No rates configured for {zone}. Set up tiers in Shipping settings.</p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {services.map((s) => (
                    <button
                      key={s.name}
                      onClick={() => setService(s.name)}
                      className={`metadata border px-3 py-1.5 ${service === s.name ? "bg-white text-black border-white" : "border-white/15 text-white/60 hover:text-white"}`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
                {quotedRate && (
                  <div className="flex justify-between items-end pt-2 border-t border-white/10">
                    <div>
                      <p className="font-mono text-2xl">{formatPrice(quotedRate.price)}</p>
                      <p className="metadata text-white/40 mt-1">{quotedRate.eta_days || quotedRate.carrier || carrier}</p>
                    </div>
                    <p className="metadata text-white/40">≤ {quotedRate.weight_kg_max}kg · {quotedRate.carrier || carrier}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Tracking */}
          <div className="space-y-3">
            <p className="metadata text-white/40">Tracking</p>
            <input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="Tracking number (enter once you have it)" className={`${inputCls} w-full`} />
            {trackLink && (
              <a href={trackLink} target="_blank" rel="noreferrer" className="metadata text-white/60 hover:text-white inline-flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} /> Track shipment
              </a>
            )}
          </div>

          {saved && (
            <p className="text-green-400 text-sm flex items-center gap-2">
              <Package className="w-4 h-4" strokeWidth={1.5} /> Shipment saved · item marked Shipped.
            </p>
          )}
        </div>

        <div className="border-t border-white/15 px-6 py-4 flex gap-3">
          <button onClick={printLabel} className="flex-1 border border-white/30 py-3 font-heading uppercase tracking-widest text-xs hover:bg-white/5 flex items-center justify-center gap-2">
            <Printer className="w-4 h-4" strokeWidth={1.5} /> Print Label
          </button>
          <button onClick={saveShipment} disabled={saving || saved} className="flex-1 bg-white text-black py-3 font-heading uppercase tracking-widest text-xs hover:bg-white/80 disabled:opacity-40 flex items-center justify-center gap-2">
            <Save className="w-4 h-4" strokeWidth={1.5} /> {saving ? "Saving…" : "Save Shipment"}
          </button>
        </div>
      </div>
    </div>
  );
}