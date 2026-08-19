import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import CartDrawer from "@/components/site/CartDrawer";
import { CartProvider } from "@/context/CartContext";

export default function SiteLayout() {
  return (
    <CartProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1"><Outlet /></main>
        <Footer />
        <CartDrawer />
      </div>
    </CartProvider>
  );
}