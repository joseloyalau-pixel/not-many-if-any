import React, { useState } from "react";
import { Package, Heart, Truck, MapPin, LogOut } from "lucide-react";

export default function Account() {
  const [tab, setTab] = useState("orders");

  const orders = [
    { id: "JL-2026-014", date: "2026-08-01", item: "Vintage Chronograph", price: "$1,450", status: "Shipped", tracking: "AUS-77839012" },
    { id: "JL-2026-009", date: "2026-07-21", item: "Nike Dunk Low", price: "$320", status: "Delivered", tracking: "AUS-77120455" },
  ];
  const saved = [
    { id: "1", title: "Cartier Tank Française", price: "$2,800", brand: "Cartier" },
    { id: "2", title: "Vintage Levi's 501", price: "$180", brand: "Levi's" },
  ];

  return (
    <div className="pt-16 md:pt-20 min-h-screen bg-white">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-12 md:py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 border-b hairline pb-8">
          <div>
            <p className="metadata text-black/40 mb-2">Customer Archive</p>
            <h1 className="font-heading font-bold uppercase text-4xl md:text-5xl tracking-wide">My Account</h1>
          </div>
          <button className="inline-flex items-center gap-2 metadata text-black/50 hover:text-black">
            <LogOut className="w-4 h-4" strokeWidth={1.5} /> Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Sidebar */}
          <aside className="md:col-span-3">
            <nav className="flex md:flex-col gap-1 border-b hairline md:border-b-0">
              {[
                { id: "orders", label: "Order History", icon: Package },
                { id: "saved", label: "Saved Items", icon: Heart },
                { id: "tracking", label: "Tracking", icon: Truck },
                { id: "addresses", label: "Address Book", icon: MapPin },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    tab === t.id ? "bg-black text-white" : "hover:bg-[#F5F5F5]"
                  }`}
                >
                  <t.icon className="w-4 h-4" strokeWidth={1.5} />
                  <span className="font-heading uppercase tracking-wide text-sm">{t.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="md:col-span-9">
            {tab === "orders" && (
              <div>
                <h2 className="font-heading uppercase tracking-wide text-xl mb-6">Order History</h2>
                <div className="border hairline">
                  {orders.map((o) => (
                    <div key={o.id} className="grid grid-cols-2 md:grid-cols-5 gap-4 p-5 border-b hairline last:border-b-0 items-center">
                      <div>
                        <p className="metadata text-black/40">Order</p>
                        <p className="font-mono text-sm">{o.id}</p>
                      </div>
                      <div>
                        <p className="metadata text-black/40">Item</p>
                        <p className="text-sm">{o.item}</p>
                      </div>
                      <div>
                        <p className="metadata text-black/40">Date</p>
                        <p className="text-sm">{o.date}</p>
                      </div>
                      <div>
                        <p className="metadata text-black/40">Price</p>
                        <p className="font-mono text-sm">{o.price}</p>
                      </div>
                      <div>
                        <span className={`metadata px-2 py-1 ${o.status === "Delivered" ? "bg-black text-white" : "border hairline"}`}>
                          {o.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "saved" && (
              <div>
                <h2 className="font-heading uppercase tracking-wide text-xl mb-6">Saved Items</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {saved.map((s) => (
                    <div key={s.id} className="border hairline p-5 flex justify-between items-center">
                      <div>
                        <p className="metadata text-black/40">{s.brand}</p>
                        <p className="font-heading uppercase text-sm tracking-wide">{s.title}</p>
                      </div>
                      <p className="font-mono text-sm">{s.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "tracking" && (
              <div>
                <h2 className="font-heading uppercase tracking-wide text-xl mb-6">Tracking Information</h2>
                <div className="border hairline">
                  {orders.filter((o) => o.tracking).map((o) => (
                    <div key={o.id} className="p-5 border-b hairline last:border-b-0">
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-heading uppercase tracking-wide text-sm">{o.item}</p>
                        <span className="metadata border hairline px-2 py-1">{o.status}</span>
                      </div>
                      <p className="metadata text-black/40">Tracking: <span className="text-black/70">{o.tracking}</span></p>
                      <p className="metadata text-black/40 mt-1">Carrier: Australia Post</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "addresses" && (
              <div>
                <h2 className="font-heading uppercase tracking-wide text-xl mb-6">Address Book</h2>
                <div className="border hairline p-6">
                  <p className="metadata text-black/40 mb-2">Default Shipping</p>
                  <p className="text-sm">Marcus Thompson</p>
                  <p className="text-sm text-black/60">14 Flinders Lane, Melbourne VIC 3000, Australia</p>
                  <button className="mt-4 metadata text-black/50 underline hover:text-black">Edit Address</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}