const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";
import { X, QrCode, Printer, Loader2, Hash, Download } from "lucide-react";

import { qrUrl, CATEGORIES, LOCATIONS } from "./inventoryUtils";

export default function GenerateSkuLabels({ onClose, onDone }) {
  const [count, setCount] = useState(10);
  const [category, setCategory] = useState("One-of-One");
  const [location, setLocation] = useState("");
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(null);
  const [error, setError] = useState("");

  const generate = async () => {
    const n = Math.min(Math.max(parseInt(count, 10) || 0, 1), 200);
    setBusy(true);
    setError("");
    setCreated(null);
    try {
      const res = await db.functions.invoke("bulkGenerateSkus", {
        count: n,
        prefix: category,
        storage_location: location || undefined,
      });
      const data = res.data || res;
      setCreated(data.created || []);
      onDone?.();
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  };

  const buildSheetHtml = () => {
    if (!created?.length) return "";
    const origin = window.location.origin;
    const items = created.map((r) => ({
      sku: r.sku,
      qr: qrUrl(`${origin}/product/${r.id}`),
    }));
    const cards = items.map((it) => `
      <div class="label">
        <div class="qr"><img src="${it.qr}" alt="QR" /></div>
        <div class="meta">
          <div class="brand">NOT MANY IF ANY</div>
          <div class="sku">${escapeHtml(it.sku)}</div>
          <div class="tag">PENDING · SCAN TO OPEN</div>
        </div>
      </div>`).join("");

    return `<!doctype html><html><head><meta charset="utf-8"><title>SKU Labels — NOT MANY IF ANY</title>
      <style>
        @page { margin: 12mm; }
        body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #000; margin: 0; }
        .sheet-title { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #888; margin-bottom: 16px; }
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .label { border: 1.5px solid #000; padding: 10px; display: flex; gap: 10px; align-items: center; page-break-inside: avoid; }
        .qr img { width: 70px; height: 70px; display: block; }
        .meta { min-width: 0; }
        .brand { font-weight: 700; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; }
        .sku { font-family: monospace; font-size: 11px; margin-top: 4px; }
        .tag { font-size: 7px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-top: 4px; }
      </style></head><body>
      <div class="sheet-title">NOT MANY IF ANY — SKU Labels · ${items.length} labels · ${new Date().toLocaleDateString()}</div>
      <div class="grid">${cards}</div>
      </body></html>`;
  };

  const printSheet = () => {
    const html = buildSheetHtml();
    if (!html) return;
    const w = window.open("", "_blank");
    if (!w) { alert("Allow pop-ups to print labels."); return; }
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 400);
  };

  const saveSheet = () => {
    const html = buildSheetHtml();
    if (!html) return;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nmi-sku-labels-${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-black border border-white/15 w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="border-b border-white/15 px-6 py-4 flex justify-between items-center">
          <div>
            <p className="text-[0.6rem] uppercase tracking-widest text-white/40 font-mono">Generate SKU Labels</p>
            <h2 className="font-heading uppercase tracking-wide text-lg">Print First · Fill Later</h2>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X className="w-5 h-5" strokeWidth={1.5} /></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          <p className="text-white/60 text-sm leading-relaxed">
            Generate blank specimen records with auto SKUs + QR codes, print the labels, then stick them on items and fill in the details from the dashboard whenever you're ready.
          </p>

          <div className="border border-white/15 p-4 space-y-3">
            <div>
              <label className="metadata text-white/40 block mb-1.5">How many labels?</label>
              <input type="number" min="1" max="200" value={count} onChange={(e) => setCount(e.target.value)} className="w-full bg-transparent border border-white/15 px-3 py-2 text-sm focus:outline-none focus:border-white/50" />
            </div>
            <div>
              <label className="metadata text-white/40 block mb-1.5">Category (sets SKU prefix)</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-black border border-white/15 px-3 py-2 text-sm focus:outline-none focus:border-white/50">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                <option value="GEN">Generic (GEN)</option>
              </select>
            </div>
            <div>
              <label className="metadata text-white/40 block mb-1.5">Storage location (optional)</label>
              <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-black border border-white/15 px-3 py-2 text-sm focus:outline-none focus:border-white/50">
                <option value="">— None —</option>
                {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          {created && created.length > 0 && (
            <div className="border border-white/15 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="metadata text-white/40">{created.length} records created</p>
                <div className="flex gap-2">
                  <button onClick={saveSheet} className="metadata border border-white/20 px-4 py-2 flex items-center gap-2 hover:bg-white/5">
                    <Download className="w-4 h-4" strokeWidth={1.5} /> Save
                  </button>
                  <button onClick={printSheet} className="metadata border border-white bg-white text-black px-4 py-2 flex items-center gap-2 hover:bg-white/80">
                    <Printer className="w-4 h-4" strokeWidth={1.5} /> Print Labels
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                {created.map((r) => (
                  <div key={r.id} className="border border-white/10 p-2 flex flex-col items-center">
                    <img src={qrUrl(`${window.location.origin}/product/${r.id}`)} alt="" className="w-12 h-12 bg-white/5" />
                    <p className="font-mono text-[0.6rem] text-white/60 mt-1 text-center break-all">{r.sku}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-white/15 px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} className="metadata border border-white/20 px-6 py-3 hover:bg-white/5">Close</button>
          <button onClick={generate} disabled={busy} className="metadata bg-white text-black px-6 py-3 hover:bg-white/80 disabled:opacity-30 flex items-center gap-2">
            {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : <><Hash className="w-4 h-4" strokeWidth={1.5} /> Generate Labels</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}