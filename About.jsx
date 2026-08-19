import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf, RefreshCw, Gem } from "lucide-react";

export default function About() {
  return (
    <div className="pt-16 md:pt-20 bg-white">
      {/* Hero */}
      <section className="py-20 md:py-40 border-b hairline">
        <div className="mx-auto max-w-[1600px] px-5 md:px-10">
          <p className="metadata text-black/40 mb-4">The Ethos</p>
          <h1 className="font-heading font-bold uppercase text-5xl md:text-8xl tracking-wide leading-[0.9] max-w-4xl">
            Giving Quality Goods A Second Life
          </h1>
          <p className="mt-8 text-black/60 text-lg max-w-2xl leading-relaxed">
            NOT MANY IF ANY exists to give quality pre-owned goods a second life through a premium buying experience.
            We curate unique pieces that cannot be replicated — a modern luxury resale destination built around individuality.
          </p>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-20 md:py-32">
        <div className="mx-auto max-w-[1600px] px-5 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#C0C0C0]">
            {[
              { icon: Leaf, title: "Sustainability", text: "Every pre-owned purchase avoids new production. We extend the lifecycle of quality goods, reducing landfill demand and the environmental cost of manufacturing. Resale is the most sustainable luxury." },
              { icon: RefreshCw, title: "Circular Economy", text: "We operate within a circular model — items are sourced, graded, archived, and re-homed rather than discarded. Each sale funds the next curation. Nothing is wasted; everything circulates." },
              { icon: Gem, title: "Curated Resale", text: "We reject mass-production. Every specimen is hand-selected for provenance, condition, and individuality. One-of-one means it enters our archive once and leaves forever — no restocks, no repeats." },
            ].map((p) => (
              <div key={p.title} className="bg-white p-8 md:p-12">
                <p.icon className="w-8 h-8 mb-8" strokeWidth={1} />
                <h2 className="font-heading uppercase tracking-wide text-2xl mb-4">{p.title}</h2>
                <p className="text-black/60 leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section className="bg-black text-white py-20 md:py-40">
        <div className="mx-auto max-w-[1200px] px-5 md:px-10">
          <p className="metadata text-white/40 mb-8">Manifesto</p>
          <div className="space-y-8">
            {[
              "Curated over mass-produced.",
              "No repeats.",
              "No shortcuts.",
              "No restocks.",
            ].map((line, i) => (
              <h2 key={i} className="font-heading font-bold uppercase text-4xl md:text-6xl tracking-wide leading-none">
                {line}
              </h2>
            ))}
          </div>
          <p className="mt-12 text-white/50 max-w-xl leading-relaxed">
            Each specimen enters our archive once and leaves forever. That is the NOT MANY IF ANY promise —
            modern connoisseurship through curated resale.
          </p>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 md:py-32">
        <div className="mx-auto max-w-[1600px] px-5 md:px-10">
          <p className="metadata text-black/40 mb-3">The Process</p>
          <h2 className="font-heading font-bold uppercase text-3xl md:text-5xl tracking-wide mb-16">From Source To Archive</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { n: "01", title: "Source", text: "We acquire unique pre-owned pieces with provenance and character." },
              { n: "02", title: "Grade", text: "Each item is inspected, condition-graded, and measured with forensic precision." },
              { n: "03", title: "Archive", text: "Assigned a SKU, QR code, and archival metadata. Photographed studio-grade." },
              { n: "04", title: "Re-Home", text: "Listed once, sold once. One-of-one leaves the archive for its next life." },
            ].map((step) => (
              <div key={step.n} className="border-t hairline pt-6">
                <p className="font-mono text-black/30 mb-4">{step.n}</p>
                <h3 className="font-heading uppercase tracking-wide text-lg mb-2">{step.title}</h3>
                <p className="text-black/60 text-sm leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#F5F5F5] py-20 md:py-32 text-center">
        <div className="mx-auto max-w-2xl px-5">
          <h2 className="font-heading font-bold uppercase text-3xl md:text-5xl tracking-wide mb-6">
            Explore The Archive
          </h2>
          <p className="text-black/60 mb-8">One-of-one specimens. No restocks. Ever.</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-3 bg-black text-white px-10 py-5 hover:bg-black/80 transition-colors"
          >
            <span className="font-heading uppercase tracking-widest text-sm">Shop Now</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </Link>
        </div>
      </section>
    </div>
  );
}