const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";
import { X, Instagram, Facebook, Upload, Check, Loader2 } from "lucide-react";

const AUTO_PLATFORMS = [
  { key: "instagram", label: "Instagram", Icon: Instagram },
  { key: "facebook_pages", label: "Facebook Pages", Icon: Facebook },
];
const MANUAL_PLATFORMS = ["TikTok", "Facebook Marketplace", "Depop", "eBay", "Etsy"];

const labelFor = (key) => AUTO_PLATFORMS.find((p) => p.key === key)?.label || key;

export default function ListToMarketplaces({ item, onClose, onUpdated }) {
  const [listed, setListed] = useState(Array.isArray(item.platform_listed) ? item.platform_listed : []);
  const [busy, setBusy] = useState(null);
  const [result, setResult] = useState(null);

  const toggleManual = async (platform) => {
    const next = listed.includes(platform) ? listed.filter((p) => p !== platform) : [...listed, platform];
    setListed(next);
    try {
      await db.entities.Inventory.update(item.id, { platform_listed: next });
      onUpdated?.();
    } catch (e) {
      alert("Update failed: " + (e?.message || e));
      setListed(listed);
    }
  };

  const publish = async (platformKey) => {
    setBusy(platformKey);
    setResult(null);
    try {
      const res = await db.functions.invoke("publishInventoryListing", {
        inventory_id: item.id,
        platforms: [platformKey],
        origin: window.location.origin,
      });
      const r = res?.results?.[0];
      if (r?.success) {
        setResult({ ok: true, msg: `${labelFor(platformKey)} published.` });
        if (!listed.includes(labelFor(platformKey))) setListed([...listed, labelFor(platformKey)]);
      } else {
        setResult({ ok: false, msg: r?.error || "Publish failed." });
      }
      onUpdated?.();
    } catch (e) {
      setResult({ ok: false, msg: e?.message || "Failed." });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white text-black w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between p-5 border-b border-black/10 sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            {item.photos?.[0] && <img src={item.photos[0]} alt="" className="w-10 h-12 object-cover bg-black/5" />}
            <div>
              <p className="metadata text-black/40">List to Marketplaces</p>
              <h3 className="font-heading uppercase tracking-wide text-sm">{item.title}</h3>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close"><X className="w-5 h-5" strokeWidth={1.5} /></button>
        </header>

        <div className="p-5 space-y-6">
          {/* Auto-publish */}
          <section>
            <p className="metadata text-black/40 mb-3">Auto-publish</p>
            <div className="space-y-2">
              {AUTO_PLATFORMS.map(({ key, label, Icon }) => {
                const isListed = listed.includes(label);
                return (
                  <div key={key} className="flex items-center justify-between border border-black/10 p-3">
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" strokeWidth={1.5} />
                      <span className="font-heading uppercase tracking-wide text-sm">{label}</span>
                      {isListed && <Check className="w-4 h-4 text-green-600" strokeWidth={2} />}
                    </div>
                    <button
                      onClick={() => publish(key)}
                      disabled={busy === key || !item.photos?.length}
                      className="bg-black text-white px-4 py-2 font-heading uppercase tracking-widest text-xs hover:bg-black/80 disabled:opacity-50 flex items-center gap-2"
                    >
                      {busy === key ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      Publish
                    </button>
                  </div>
                );
              })}
            </div>
            {!item.photos?.length && <p className="text-xs text-red-500 mt-2">A photo is required to auto-publish.</p>}
            {result && (
              <p className={`text-xs mt-3 ${result.ok ? "text-green-600" : "text-red-500"}`}>{result.msg}</p>
            )}
          </section>

          {/* Manual tracking */}
          <section>
            <p className="metadata text-black/40 mb-3">Manual tracking</p>
            <div className="grid grid-cols-1 gap-2">
              {MANUAL_PLATFORMS.map((platform) => {
                const checked = listed.includes(platform);
                return (
                  <label key={platform} className="flex items-center gap-3 border border-black/10 p-3 cursor-pointer hover:bg-black/5">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleManual(platform)}
                      className="accent-black w-4 h-4"
                    />
                    <span className="font-heading uppercase tracking-wide text-sm">{platform}</span>
                    <span className="metadata text-black/40 ml-auto">{checked ? "Listed" : "Not listed"}</span>
                  </label>
                );
              })}
            </div>
            <p className="text-xs text-black/40 mt-2">
              These platforms have no public listing API — check them off once you've posted by hand.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}