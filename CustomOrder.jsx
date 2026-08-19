import React, { useState } from "react";
import OrderForm from "@/components/custom/OrderForm";
import BrandMark from "@/components/site/BrandMark";
import { CheckCircle2 } from "lucide-react";

export default function CustomOrder() {
  const [orderId, setOrderId] = useState(null);

  return (
    <div className="pt-16 md:pt-20 bg-white text-black min-h-screen">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <header className="py-10 md:py-14 border-b border-black/10">
          <BrandMark size="lg" />
          <h1 className="font-heading uppercase tracking-[0.15em] text-2xl md:text-3xl mt-8 leading-tight">
            Design Your One-of-One Custom Kicks
          </h1>
          <p className="text-black/60 mt-4 max-w-xl text-sm md:text-base leading-relaxed">
            Every pair is individually designed and hand-painted to your vision. No mass production. No repeats.
          </p>
        </header>

        {orderId ? (
          <ThankYou orderId={orderId} />
        ) : (
          <OrderForm onSubmitSuccess={setOrderId} />
        )}
      </div>
    </div>
  );
}

function ThankYou({ orderId }) {
  return (
    <div className="py-16 md:py-24 text-center animate-[fade-up_0.6s_ease-out]">
      <CheckCircle2 className="w-14 h-14 mx-auto mb-8 text-black" strokeWidth={1} />
      <p className="metadata text-black/40 mb-4">Order Received · {orderId}</p>
      <h2 className="font-heading uppercase tracking-widest text-2xl md:text-3xl mb-6">Thank You For Your Order</h2>
      <p className="text-black/60 max-w-lg mx-auto leading-relaxed text-sm md:text-base">
        We've received your request and will review your design. You'll receive a confirmation email shortly,
        and we'll contact you to discuss your custom artwork, pricing, and production timeline.
      </p>
    </div>
  );
}