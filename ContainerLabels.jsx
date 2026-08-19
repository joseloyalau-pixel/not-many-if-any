const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";
import { Plus, Printer, Trash2, X, QrCode, Box } from "lucide-react";

import { qrUrl, LOCATIONS } from "./inventoryUtils";

export default function ContainerLabels({ onClose }) {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const load = () => {
    setLoading(true);
    db.entities.Container.list("-created_date", 200)
      .then((res) => {
        const data = res.data || res || [];
        setContainers(Array.isArray(data) ? data : []);
      })
      .catch(() => setContainers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!name.trim()) return;
    const autoCode = code.trim() || `C${String(containers.length + 1).padStart(3, "0")}`;
    await db.entities.Container.create({
      name: name.trim(),
      code: autoCode,
      storage_location: location || undefined,
      notes: notes.trim() || undefined,
    });
    setName("");
    setCode("");
    setLocation("");
    setNotes("");
    load();
  };

  const remove = async (id) => {
    if (!confirm("Delete this container label?")) return;
    await db.entities.Container.delete(id);
    load();
  };

  const printSheet = () => {
    const items = containers.map((c) => ({
      name: c.name,
      code: c.code || c.id.slice(-6).toUpperCase(),
      location: c.storage_location || "",
      qr: qrUrl(`NOTMANYIFANY:CONTAINER:${c.code || c.id}`),
    }));
    const cards = items.map((it) => `
      <div class="label">
        <div class="qr"><img src="${it.qr}" alt="QR" /></div>
        <div class="meta">
          <div class="name">${escapeHtml(it.name)}</div>
          <div class="code">${it.code}</div>
          ${it.location ? `<div class="loc">${escapeHtml(it.location)}</div>` : ""}
        </div>
      </div>`).join("");

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Container Labels — NOT MANY IF ANY</title>
      <style>
        @page { margin: 12mm; }
        body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #000; margin: 0; }
        .sheet-title { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #888; margin-bottom: 16px; }
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .label { border: 1.5px solid #000; padding: 10px; display: flex; gap: 10px; align-items: center; page-break-inside: avoid; }
        .qr img { width: 70px; height: 70px; display: block; }
        .meta { min-width: 0; }
        .name { font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.1; }
        .code { font-family: monospace; font-size: 10px; margin-top: 4px; }
        .loc { font-size: 8px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-top: 2px; }
      </style></head><body>
      <div class="sheet-title">NOT MANY IF ANY — Container Labels · ${items.length} labels · ${new Date().toLocaleDateString()}</div>
      <div class="grid">${cards}</div>
      </body></html>`;

    const w = window.open("", "_blank");
    if (!w) { alert("Allow pop-ups to print labels."); return; }
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-black border border-white/15 w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="border-b border-white/15 px-6 py-4 flex justify-between items-center">
          <div>
            <p className="text-[0.6rem] uppercase tracking-widest text-white/40 font-mono">Container Labels</p>
            <h2 className="font-heading uppercase tracking-wide text-lg">Print & Assign Later</h2>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X className="w-5 h-5" strokeWidth={1.5} /></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Add form */}
          <div className="border border-white/15 p-4 space-y-3">
            <p className="metadata text-white/40">New Container</p>
            <div className="grid grid-cols-2 gap-3">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (e.g. Garage Bin A)" className="bg-transparent border border-white/15 px-3 py-2 text-sm focus:outline-none focus:border-white/50 col-span-2" />
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Code (auto: C001)" className="bg-transparent border border-white/15 px-3 py-2 text-sm focus:outline-none focus:border-white/50" />
              <select value={location} onChange={(e) => setLocation(e.target.value)} className="bg-black border border-white/15 px-3 py-2 text-sm focus:outline-none focus:border-white/50">
                <option value="">— Location —</option>
                {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <button onClick={add} disabled={!name.trim()} className="w-full bg-white text-black py-3 font-heading uppercase tracking-widest text-xs disabled:opacity-30 flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" strokeWidth={1.5} /> Add Container
            </button>
          </div>

          {/* List */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <p className="metadata text-white/40">{containers.length} containers</p>
              {containers.length > 0 && (
                <button onClick={printSheet} className="metadata border border-white bg-white text-black px-4 py-2 flex items-center gap-2 hover:bg-white/80">
                  <Printer className="w-4 h-4" strokeWidth={1.5} /> Print Labels
                </button>
              )}
            </div>
            {loading ? (
              <p className="text-white/30 text-sm text-center py-8">Loading…</p>
            ) : containers.length === 0 ? (
              <div className="border border-dashed border-white/15 p-8 text-center">
                <Box className="w-8 h-8 mx-auto mb-3 text-white/30" strokeWidth={1} />
                <p className="text-white/40 text-sm">No containers yet. Add one above, print the labels, then assign items to containers when processing stock.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {containers.map((c) => (
                  <div key={c.id} className="border border-white/15 p-3 flex items-center gap-3">
                    <img src={qrUrl(`NOTMANYIFANY:CONTAINER:${c.code || c.id}`)} alt="" className="w-14 h-14 shrink-0 bg-white/5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm truncate">{c.name}</p>
                      <p className="font-mono text-xs text-white/40">{c.code}</p>
                      {c.storage_location && <p className="text-[0.6rem] uppercase tracking-widest text-white/30 mt-0.5">{c.storage_location}</p>}
                    </div>
                    <button onClick={() => remove(c.id)} className="text-white/30 hover:text-red-400 p-1"><Trash2 className="w-4 h-4" strokeWidth={1.5} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-white/15 px-6 py-3">
          <p className="text-[0.6rem] uppercase tracking-widest text-white/30 font-mono text-center flex items-center justify-center gap-2">
            <QrCode className="w-3 h-3" strokeWidth={1.5} /> Print first · assign items to containers later via the storage form
          </p>
        </div>
      </div>
    </div>
  );
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}