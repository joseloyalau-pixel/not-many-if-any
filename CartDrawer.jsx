const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { X, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartDrawer() {
  const { items, open, setOpen, remove, total, clear } = useCart();
  const [loading, setLoading] = useState(false);

  const checkout = async () => {
    if (window.self !== window.top) {
      alert("Checkout only works from the published app. Please open the site in a new tab to complete your purchase.");
      return;
    }
    setLoading(true);
    try {
      const res = await db.functions.invoke("createCheckoutSession", {
        items: items.map((i) => ({ id: i.id })),
        origin: window.location.origin,
      });
      const url = res?.data?.url || res?.url;
      if (url) {
        window.location.href = url;
      } else {
        alert("Checkout could not be started. Please try again.");
      }
    } catch (e) {
      alert("Checkout failed: " + (e?.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setOpen(false)}
      />
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between p-5 border-b hairline">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
            <h2 className="font-heading uppercase tracking-widest text-sm">Your Archive ({items.length})</h2>
          </div>
          <button onClick={() => setOpen(false)} aria-label="Close cart" className="text-black/50 hover:text-black">
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-black/40 text-sm mb-6">Your cart is empty.</p>
              <Link
                to="/shop"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-2 font-heading uppercase tracking-widest text-sm border-b border-black pb-1"
              >
                Browse Archive <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </Link>
            </div>
          ) : (
            <ul className="divide-y hairline">
              {items.map((it) => (
                <li key={it.id} className="flex gap-4 p-5">
                  <div className="w-16 h-20 bg-[#F5F5F5] overflow-hidden shrink-0">
                    {it.photo && <img src={it.photo} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    {it.brand && <p className="metadata text-black/40">{it.brand}</p>}
                    <p className="font-heading uppercase tracking-wide text-sm truncate">{it.title}</p>
                    <p className="font-mono text-sm mt-1">
                      {it.sale_price != null ? `$${Number(it.sale_price).toLocaleString()}` : "POA"}
                    </p>
                  </div>
                  <button onClick={() => remove(it.id)} className="text-black/30 hover:text-black self-start" aria-label="Remove">
                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="border-t hairline p-5 space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="metadata text-black/40">Total</span>
              <span className="font-mono text-lg">${total.toLocaleString()}</span>
            </div>
            <button
              onClick={checkout}
              disabled={loading}
              className="w-full bg-black text-white py-4 font-heading uppercase tracking-widest text-sm hover:bg-black/80 transition-colors disabled:opacity-50"
            >
              {loading ? "Redirecting…" : "Checkout"}
            </button>
            <button onClick={clear} className="w-full metadata text-black/40 hover:text-black">
              Clear cart
            </button>
          </footer>
        )}
      </aside>
    </>
  );
}