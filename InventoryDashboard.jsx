const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";

import { Plus, Search, QrCode, Edit2, Trash2, X, ExternalLink, Boxes, ArrowLeft, Upload, Tags, HelpCircle, Share2, Truck } from "lucide-react";
import { STATUSES, qrUrl, formatPrice } from "@/components/inventory/inventoryUtils";
import InventoryStats from "@/components/inventory/InventoryStats";
import InventoryForm from "@/components/inventory/InventoryForm";
import BulkImport from "@/components/inventory/BulkImport";
import ContainerLabels from "@/components/inventory/ContainerLabels";
import AdminGuide from "@/components/inventory/AdminGuide";
import ListToMarketplaces from "@/components/inventory/ListToMarketplaces";
import GenerateSkuLabels from "@/components/inventory/GenerateSkuLabels";
import ShippingManager from "@/components/inventory/ShippingManager";
import ShippingRates from "@/components/inventory/ShippingRates";
import LabelExport from "@/components/inventory/LabelExport";

export default function InventoryDashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [qrItem, setQrItem] = useState(null);
  const [selected, setSelected] = useState([]);
  const [importOpen, setImportOpen] = useState(false);
  const [labelsOpen, setLabelsOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [listItem, setListItem] = useState(null);
  const [skuGenOpen, setSkuGenOpen] = useState(false);
  const [shipItem, setShipItem] = useState(null);
  const [ratesOpen, setRatesOpen] = useState(false);
  const [labelItems, setLabelItems] = useState([]);
  const [labelOpen, setLabelOpen] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    db.entities.Inventory.list("-created_date", 500)
      .then((res) => {
        const data = res.data || res || [];
        setItems(Array.isArray(data) ? data : []);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // CMD+K focus
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("inv-search")?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const filtered = useMemo(() => {
    let r = items;
    if (statusFilter) r = r.filter((i) => i.status === statusFilter);
    if (search.trim()) {
      const k = search.toLowerCase();
      r = r.filter((i) =>
        [i.title, i.brand, i.category, i.sku, i.inventory_id, i.storage_location, i.colour, i.size]
          .filter(Boolean)
          .some((v) => v.toLowerCase().includes(k))
      );
    }
    return r;
  }, [items, search, statusFilter]);

  const handleSave = async (data) => {
    try {
      if (editing?.id) {
        await db.entities.Inventory.update(editing.id, data);
      } else {
        await db.entities.Inventory.create(data);
      }
      setFormOpen(false);
      setEditing(null);
      load();
    } catch (e) {
      alert("Error saving: " + (e.message || e));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this specimen permanently?")) return;
    await db.entities.Inventory.delete(id);
    load();
  };

  const quickStatus = async (id, status) => {
    await db.entities.Inventory.update(id, { status });
    setItems((arr) => arr.map((i) => (i.id === id ? { ...i, status } : i)));
  };

  const toggleSelect = (id) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const bulkStatus = async (status) => {
    if (!selected.length) return;
    await db.entities.Inventory.bulkUpdate(selected.map((id) => ({ id, status })));
    setSelected([]);
    load();
  };

  const bulkDelete = async () => {
    if (!selected.length) return;
    if (!confirm(`Delete ${selected.length} selected specimens permanently? This cannot be undone.`)) return;
    await db.entities.Inventory.deleteMany({ id: { $in: selected } });
    setSelected([]);
    load();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top bar */}
      <header className="border-b border-white/10 sticky top-0 bg-black z-40">
        <div className="px-4 md:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Boxes className="w-5 h-5" strokeWidth={1.5} />
            <div>
              <p className="font-heading uppercase tracking-widest text-sm">NOT MANY IF ANY · Command Center</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="metadata text-white/40 hover:text-white flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} /> Storefront
            </Link>
            <button
              onClick={() => setGuideOpen(true)}
              className="border border-white/20 px-4 py-2 font-heading uppercase tracking-widest text-xs hover:bg-white/5 flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" strokeWidth={1.5} /> Guide
            </button>
            <button
              onClick={() => setLabelsOpen(true)}
              className="border border-white/20 px-4 py-2 font-heading uppercase tracking-widest text-xs hover:bg-white/5 flex items-center gap-2"
            >
              <Tags className="w-4 h-4" strokeWidth={1.5} /> Container Labels
            </button>
            <button
              onClick={() => setSkuGenOpen(true)}
              className="border border-white/20 px-4 py-2 font-heading uppercase tracking-widest text-xs hover:bg-white/5 flex items-center gap-2"
            >
              <QrCode className="w-4 h-4" strokeWidth={1.5} /> Generate SKU Labels
            </button>
            <button
              onClick={() => setRatesOpen(true)}
              className="border border-white/20 px-4 py-2 font-heading uppercase tracking-widest text-xs hover:bg-white/5 flex items-center gap-2"
            >
              <Truck className="w-4 h-4" strokeWidth={1.5} /> Shipping
            </button>
            <button
              onClick={() => setImportOpen(true)}
              className="border border-white/20 px-4 py-2 font-heading uppercase tracking-widest text-xs hover:bg-white/5 flex items-center gap-2"
            >
              <Upload className="w-4 h-4" strokeWidth={1.5} /> Bulk Import
            </button>
            <button
              onClick={() => { setEditing(null); setFormOpen(true); }}
              className="bg-white text-black px-4 py-2 font-heading uppercase tracking-widest text-xs hover:bg-white/80 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" strokeWidth={1.5} /> Add Specimen
            </button>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-8 space-y-6">
        <InventoryStats items={items} />

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" strokeWidth={1.5} />
            <input
              id="inv-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search SKU, brand, location… (⌘K)"
              className="w-full bg-transparent border border-white/15 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-white/50"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setStatusFilter("")}
              className={`metadata border px-3 py-1.5 whitespace-nowrap ${!statusFilter ? "bg-white text-black border-white" : "border-white/15 text-white/50 hover:text-white"}`}
            >
              All ({items.length})
            </button>
            {STATUSES.map((s) => {
              const count = items.filter((i) => i.status === s).length;
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(statusFilter === s ? "" : s)}
                  className={`metadata border px-3 py-1.5 whitespace-nowrap ${statusFilter === s ? "bg-white text-black border-white" : "border-white/15 text-white/50 hover:text-white"}`}
                >
                  {s} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Bulk actions */}
        {selected.length > 0 && (
          <div className="border border-white/15 p-3 flex items-center gap-3 flex-wrap">
            <span className="metadata text-white/60">{selected.length} selected</span>
            <select
              onChange={(e) => e.target.value && bulkStatus(e.target.value)}
              className="bg-transparent border border-white/15 px-3 py-1.5 text-xs focus:outline-none"
              defaultValue=""
            >
              <option value="">Bulk change status…</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={() => { setLabelItems(filtered.filter((i) => selected.includes(i.id))); setLabelOpen(true); }} className="metadata border border-white/20 px-3 py-1.5 hover:bg-white/5 flex items-center gap-1.5">
              <Tags className="w-3.5 h-3.5" strokeWidth={1.5} /> Labels ({selected.length})
            </button>
            <button onClick={bulkDelete} className="metadata border border-red-500/40 text-red-400 px-3 py-1.5 hover:bg-red-500/10 flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} /> Delete ({selected.length})
            </button>
            <button onClick={() => setSelected([])} className="metadata text-white/40 hover:text-white ml-auto">Clear</button>
          </div>
        )}

        {/* Table */}
        <div className="border border-white/10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="p-3 w-8"><input type="checkbox" className="accent-white" onChange={(e) => setSelected(e.target.checked ? filtered.map((i) => i.id) : [])} /></th>
                <th className="p-3 text-[0.6rem] uppercase tracking-widest text-white/40 font-mono">Specimen</th>
                <th className="p-3 text-[0.6rem] uppercase tracking-widest text-white/40 font-mono hidden md:table-cell">SKU</th>
                <th className="p-3 text-[0.6rem] uppercase tracking-widest text-white/40 font-mono hidden lg:table-cell">Category</th>
                <th className="p-3 text-[0.6rem] uppercase tracking-widest text-white/40 font-mono hidden md:table-cell">Location</th>
                <th className="p-3 text-[0.6rem] uppercase tracking-widest text-white/40 font-mono hidden lg:table-cell">Container</th>
                <th className="p-3 text-[0.6rem] uppercase tracking-widest text-white/40 font-mono">Price</th>
                <th className="p-3 text-[0.6rem] uppercase tracking-widest text-white/40 font-mono">Status</th>
                <th className="p-3 text-[0.6rem] uppercase tracking-widest text-white/40 font-mono text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="p-12 text-center text-white/30">Loading archive…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="p-12 text-center text-white/30">No specimens found. Add your first item.</td></tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-3"><input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggleSelect(item.id)} className="accent-white" /></td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {item.photos?.[0] && <img src={item.photos[0]} alt="" className="w-10 h-12 object-cover bg-white/5" />}
                        <div className="min-w-0">
                          <p className="truncate font-medium">{item.title}</p>
                          {item.brand && <p className="text-white/40 text-xs">{item.brand}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-xs text-white/60 hidden md:table-cell">{item.sku || "—"}</td>
                    <td className="p-3 text-white/60 hidden lg:table-cell">{item.category || "—"}</td>
                    <td className="p-3 text-white/60 hidden md:table-cell">{item.storage_location || "—"}</td>
                    <td className="p-3 font-mono text-xs text-white/60 hidden lg:table-cell">{item.container || "—"}</td>
                    <td className="p-3 font-mono">{formatPrice(item.sale_price)}</td>
                    <td className="p-3">
                      <select
                        value={item.status || "Unprocessed"}
                        onChange={(e) => quickStatus(item.id, e.target.value)}
                        className="bg-transparent border border-white/15 px-2 py-1 text-xs focus:outline-none focus:border-white/50 cursor-pointer"
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setShipItem(item)} className="p-1.5 hover:bg-white/10" title="Ship"><Truck className="w-4 h-4" strokeWidth={1.5} /></button>
                        <button onClick={() => setQrItem(item)} className="p-1.5 hover:bg-white/10" title="QR Code"><QrCode className="w-4 h-4" strokeWidth={1.5} /></button>
                        {item.listing_url && <a href={item.listing_url} target="_blank" rel="noreferrer" className="p-1.5 hover:bg-white/10" title="Listing"><ExternalLink className="w-4 h-4" strokeWidth={1.5} /></a>}
                        <button onClick={() => setListItem(item)} className="p-1.5 hover:bg-white/10" title="List to Marketplaces"><Share2 className="w-4 h-4" strokeWidth={1.5} /></button>
                        <button onClick={() => { setEditing(item); setFormOpen(true); }} className="p-1.5 hover:bg-white/10" title="Edit"><Edit2 className="w-4 h-4" strokeWidth={1.5} /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-white/10 text-red-400" title="Delete"><Trash2 className="w-4 h-4" strokeWidth={1.5} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && (
          <p className="metadata text-white/30">{filtered.length} of {items.length} specimens</p>
        )}
      </div>

      {formOpen && (
        <InventoryForm
          item={editing}
          onSave={handleSave}
          onClose={() => { setFormOpen(false); setEditing(null); }}
        />
      )}

      {importOpen && (
        <BulkImport
          onClose={() => setImportOpen(false)}
          onDone={load}
        />
      )}

      {labelsOpen && (
        <ContainerLabels onClose={() => setLabelsOpen(false)} />
      )}

      {skuGenOpen && (
        <GenerateSkuLabels onClose={() => setSkuGenOpen(false)} onDone={load} />
      )}

      {guideOpen && (
        <AdminGuide onClose={() => setGuideOpen(false)} />
      )}

      {listItem && (
        <ListToMarketplaces item={listItem} onClose={() => setListItem(null)} onUpdated={load} />
      )}

      {shipItem && (
        <ShippingManager item={shipItem} onClose={() => setShipItem(null)} onDone={load} />
      )}

      {ratesOpen && (
        <ShippingRates onClose={() => setRatesOpen(false)} />
      )}

      {labelOpen && (
        <LabelExport items={labelItems} onClose={() => setLabelOpen(false)} />
      )}

      {qrItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setQrItem(null)}>
          <div className="bg-white text-black p-8 max-w-xs w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[0.6rem] uppercase tracking-widest text-black/40 font-mono">QR Code</p>
                <h3 className="font-heading uppercase tracking-wide">{qrItem.title}</h3>
              </div>
              <button onClick={() => setQrItem(null)}><X className="w-4 h-4" strokeWidth={1.5} /></button>
            </div>
            <img src={qrUrl(`${window.location.origin}/product/${qrItem.id}`)} alt="QR" className="w-full mx-auto" />
            <p className="font-mono text-xs text-center mt-4 text-black/60">{qrItem.sku}</p>
            <p className="text-[0.6rem] uppercase tracking-widest text-black/40 font-mono text-center mt-1">Scan to open record</p>
            <button onClick={() => window.print()} className="w-full mt-4 bg-black text-white py-3 font-heading uppercase tracking-widest text-xs">Print</button>
          </div>
        </div>
      )}
    </div>
  );
}