import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CheckoutSuccess() {
  const { clear } = useCart();

  useEffect(() => {
    clear();
  }, [clear]);

  return (
    <div className="pt-20 min-h-screen bg-white flex items-center justify-center">
      <div className="text-center px-5 max-w-lg">
        <CheckCircle2 className="w-12 h-12 mx-auto mb-6" strokeWidth={1} />
        <p className="metadata text-black/40 mb-3">Transaction Complete</p>
        <h1 className="font-heading uppercase tracking-wide text-3xl md:text-4xl mb-4">Purchase Confirmed</h1>
        <p className="text-black/60 mb-8 leading-relaxed">
          Thank you. Your one-of-one specimen is reserved. A confirmation has been sent to your email and your item will be prepared for dispatch shortly.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 font-heading uppercase tracking-widest text-sm hover:bg-black/80 transition-colors"
        >
          Continue Browsing
        </Link>
      </div>
    </div>
  );
}