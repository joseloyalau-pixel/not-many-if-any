import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Search, ShoppingBag, User } from "lucide-react";
import BrandMark from "@/components/site/BrandMark";
import { useCart } from "@/context/CartContext";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Shop", path: "/shop" },
  { label: "Custom", path: "/custom-kicks" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { count, setOpen: setCartOpen } = useCart();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white border-b hairline ${
        scrolled ? "shadow-sm" : ""
      }`}
    >
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Brand mark (left) */}
          <Link to="/" className="flex items-center" aria-label="Not Many If Any — home">
            <BrandMark size="md" />
          </Link>

          {/* Nav (right) */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((l) => (
              <NavLink key={l.path} {...l} active={location.pathname === l.path} />
            ))}
            <span className="w-px h-4 bg-black/15" />
            <Link to="/shop" aria-label="Search" className="hover:opacity-60 transition-opacity">
              <Search className="w-4 h-4" strokeWidth={1.5} />
            </Link>
            <Link to="/account" aria-label="Account" className="hover:opacity-60 transition-opacity">
              <User className="w-4 h-4" strokeWidth={1.5} />
            </Link>
          </nav>

          {/* Cart (always visible) */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative hover:opacity-60 transition-opacity ml-2"
            aria-label="Cart"
          >
            <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-black text-white text-[0.6rem] w-4 h-4 rounded-full flex items-center justify-center font-mono leading-none">
                {count}
              </span>
            )}
          </button>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 -mr-2 ml-1"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-5 h-5" strokeWidth={1.5} /> : <Menu className="w-5 h-5" strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t hairline">
          <nav className="flex flex-col px-5 py-4">
            {navLinks.map((l) => (
              <Link
                key={l.path}
                to={l.path}
                className={`py-3 font-heading uppercase tracking-widest text-sm border-b hairline ${
                  location.pathname === l.path ? "opacity-100" : "opacity-70"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link to="/inventory" className="py-3 font-heading uppercase tracking-widest text-sm opacity-50">
              Inventory Admin
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

function NavLink({ label, path, active }) {
  return (
    <Link
      to={path}
      className={`font-heading uppercase tracking-widest text-sm transition-opacity relative group ${
        active ? "opacity-100" : "opacity-70 hover:opacity-100"
      }`}
    >
      {label}
      <span className="absolute -bottom-1 left-0 w-0 h-px bg-black group-hover:w-full transition-all duration-300" />
    </Link>
  );
}