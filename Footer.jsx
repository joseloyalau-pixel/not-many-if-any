import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Mail } from "lucide-react";
import Logo from "@/components/site/Logo";

const soldItems = [
  "Rolex Submariner 1985",
  "Nike Dunk Low Paris",
  "Vintage Levi's 501",
  "Cartier Tank Française",
  "Jordan 1 Chicago 1994",
  "Hermès Silk Scarf",
  "Omega Speedmaster Mk II",
  "Stüssy World Tour Tee",
  "Patek Philippe Calatrava",
  "Vintage Akari Lamp",
];

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      {/* Recently sold ticker */}
      <div className="border-b border-white/15 py-3 overflow-hidden">
        <div className="ticker-track">
          {[...soldItems, ...soldItems].map((item, i) => (
            <span key={i} className="metadata text-white/60 mx-6 flex items-center gap-3 whitespace-nowrap">
              <span className="text-white/30">◆</span> SOLD — {item}
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-5 md:px-10 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <Logo variant="stacked" invert className="text-3xl md:text-4xl" />
            <p className="mt-5 text-white/50 max-w-md leading-relaxed">
              Luxury thrift. Premium resale. Every item is one-of-one and will not be restocked.
              Curated over mass-produced — giving quality pre-owned goods a second life.
            </p>
          </div>

          <div>
            <h4 className="metadata text-white/40 mb-5">Navigate</h4>
            <ul className="space-y-3">
              {[
                { label: "Shop", path: "/shop" },
                { label: "Latest Arrivals", path: "/shop?sort=newest" },
                { label: "About", path: "/about" },
                { label: "Contact", path: "/contact" },
                { label: "My Account", path: "/account" },
              ].map((l) => (
                <li key={l.path}>
                  <Link to={l.path} className="text-white/70 hover:text-white transition-colors text-sm">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="metadata text-white/40 mb-5">Connect</h4>
            <ul className="space-y-3">
              <li>
                <a href="mailto:hello@notmanyifany.com" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm">
                  <Mail className="w-4 h-4" strokeWidth={1.5} /> hello@notmanyifany.com
                </a>
              </li>
              <li>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm">
                  <Instagram className="w-4 h-4" strokeWidth={1.5} /> @notmanyifany
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/15 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <p className="metadata text-white/40">© 2026 NOT MANY IF ANY — All Rights Reserved</p>
          <div className="flex gap-6">
            <Link to="/about" className="metadata text-white/40 hover:text-white">Privacy</Link>
            <Link to="/about" className="metadata text-white/40 hover:text-white">Terms</Link>
            <Link to="/about" className="metadata text-white/40 hover:text-white">Shipping</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}