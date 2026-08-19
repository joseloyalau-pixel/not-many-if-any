const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf, RefreshCw, Gem, Shield } from "lucide-react";

import { Image } from "@/components/ui/image";
import ProductCard from "@/components/site/ProductCard";
import Logo from "@/components/site/Logo";

const HERO_IMG = "https://media.db.com/images/public/6a753d5d215e364909293a11/954e5d7fb_generated_0f42cb35.png";

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.entities.Inventory.list("-created_date", 8)
      .then((res) => {
        const data = res.data || res || [];
        setItems(Array.isArray(data) ? data : []);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const latest = items.slice(0, 4);
  const featured = items.filter((i) => i.featured).slice(0, 3);

  return (
    <div className="bg-white">
      {/* HERO */}
      <section className="relative h-screen min-h-[700px] w-full overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2">
          {/* Image side */}
          <div className="relative h-[50vh] md:h-full overflow-hidden">
            <Image
              src={HERO_IMG}
              alt="NOT MANY IF ANY archive specimen"
              fittingType="fit"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/10" />
          </div>
          {/* Text side */}
          <div className="relative h-[50vh] md:h-full bg-white flex flex-col justify-between p-6 md:p-16">
            <div className="flex justify-end">
              <span className="metadata text-black/40">Est. 2026 · Melbourne, AU</span>
            </div>
            <div className="flex flex-col items-start">
              <span className="metadata text-black/40 mb-4">Luxury Thrift · Premium Resale</span>
              <h1 className="font-heading font-bold uppercase leading-[0.82] text-[14vw] md:text-[7vw] tracking-[0.02em]">
                Not Many<br /><span className="bg-black text-white px-3 inline-flex items-end gap-2"><span className="text-[0.45em] pb-2 opacity-80">If</span>Any</span>
              </h1>
              <p className="mt-6 text-black/60 max-w-sm leading-relaxed">
                Curated goods. One-of-one finds. Premium resale. No repeats. No shortcuts. No restocks.
              </p>
            </div>
            <div className="flex justify-start md:justify-end">
              <Link
                to="/shop"
                className="group inline-flex items-center gap-3 bg-black text-white px-10 py-5 hover:bg-black/80 transition-colors"
              >
                <span className="font-heading uppercase tracking-widest text-sm">Shop Now</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* LATEST ARRIVALS */}
      <Section
        eyebrow="01 — Latest Arrivals"
        title="Freshly Archived"
        action={{ label: "View All", path: "/shop" }}
      >
        <ProductGrid items={latest} loading={loading} />
      </Section>

      {/* FEATURED */}
      <section className="bg-[#F5F5F5] py-20 md:py-32">
        <div className="mx-auto max-w-[1600px] px-5 md:px-10">
          <div className="flex justify-between items-end mb-12">
            <div>
              <p className="metadata text-black/40 mb-3">02 — Featured</p>
              <h2 className="font-heading font-bold uppercase text-3xl md:text-5xl tracking-wide">The Specimens</h2>
            </div>
            <Link to="/shop" className="hidden md:flex items-center gap-2 metadata text-black/60 hover:text-black">
              All Items <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
            </Link>
          </div>
          <ProductGrid items={featured} loading={loading} />
        </div>
      </section>

      {/* WHY BUY PRE-LOVED */}
      <Section eyebrow="03 — Philosophy" title="Why Buy Pre-Loved">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[#C0C0C0]">
          {[
            { icon: Leaf, title: "Sustainable", text: "Extending the lifecycle of quality goods reduces waste and demand for new production." },
            { icon: RefreshCw, title: "Circular", text: "Every purchase fuels a circular economy where pre-owned is the new luxury standard." },
            { icon: Gem, title: "Curated", text: "Each piece is hand-selected for provenance, condition, and individuality. No mass-production." },
            { icon: Shield, title: "Authentic", text: "Every item is graded and documented with a full condition report and archival metadata." },
          ].map((f) => (
            <div key={f.title} className="bg-white p-8 md:p-10">
              <f.icon className="w-7 h-7 mb-6" strokeWidth={1} />
              <h3 className="font-heading uppercase tracking-wide text-lg mb-3">{f.title}</h3>
              <p className="text-black/60 text-sm leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* BRAND STORY */}
      <section className="bg-black text-white py-20 md:py-40">
        <div className="mx-auto max-w-[1600px] px-5 md:px-10 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
          <div className="md:col-span-4">
            <p className="metadata text-white/40 mb-4">04 — Brand Story</p>
            <h2 className="font-heading font-bold uppercase text-3xl md:text-5xl tracking-wide leading-none">
              Every Item<br />Has A Story
            </h2>
          </div>
          <div className="md:col-span-7 md:col-start-6">
            <p className="text-white/70 text-lg md:text-xl leading-relaxed">
              NOT MANY IF ANY exists to give quality pre-owned goods a second life through a premium buying experience.
              We curate unique pieces that cannot be replicated — creating a modern luxury resale destination
              built around individuality.
            </p>
            <p className="text-white/50 mt-6 leading-relaxed">
              Curated over mass-produced. No repeats. No shortcuts. No restocks. Each specimen enters our archive
              once and leaves forever.
            </p>
            <Link to="/about" className="inline-flex items-center gap-2 mt-10 group">
              <span className="font-heading uppercase tracking-widest text-sm border-b border-white pb-1">Read Our Ethos</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <Section eyebrow="05 — Testimonials" title="Client Archive">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#C0C0C0]">
          {[
            { quote: "The condition grading was forensic. I knew exactly what I was buying — no surprises, pure quality.", name: "Marcus T.", meta: "Verified Buyer · Sneakers" },
            { quote: "NOT MANY IF ANY found me a piece I'd been hunting for three years. One-of-one is not a slogan here — it's reality.", name: "Eleanor R.", meta: "Verified Buyer · Collectibles" },
            { quote: "Premium resale done properly. The archival detail and shipping speed were flawless.", name: "David K.", meta: "Verified Buyer · Apparel" },
          ].map((r, i) => (
            <div key={i} className="bg-white p-8 md:p-12">
              <div className="metadata text-black/30 mb-6">★★★★★</div>
              <p className="text-lg leading-relaxed mb-8">"{r.quote}"</p>
              <p className="font-heading uppercase tracking-wide">{r.name}</p>
              <p className="metadata text-black/40 mt-1">{r.meta}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* NEWSLETTER */}
      <section className="bg-[#F5F5F5] py-20 md:py-32">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <p className="metadata text-black/40 mb-4">06 — Notify</p>
          <h2 className="font-heading font-bold uppercase text-3xl md:text-5xl tracking-wide mb-5">
            First Access To New Finds
          </h2>
          <p className="text-black/60 mb-10 max-w-xl mx-auto">
            Join the archive. Be notified before new one-of-one specimens are listed publicly.
          </p>
          <form
            onSubmit={(e) => { e.preventDefault(); e.target.reset(); }}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              required
              placeholder="Email address"
              className="flex-1 bg-white border hairline px-5 py-4 font-body text-sm focus:outline-none focus:border-black transition-colors"
            />
            <button type="submit" className="bg-black text-white px-8 py-4 font-heading uppercase tracking-widest text-sm hover:bg-black/80 transition-colors">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

function Section({ eyebrow, title, action, children }) {
  return (
    <section className="py-20 md:py-32">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <div className="flex justify-between items-end mb-12">
          <div>
            <p className="metadata text-black/40 mb-3">{eyebrow}</p>
            <h2 className="font-heading font-bold uppercase text-3xl md:text-5xl tracking-wide">{title}</h2>
          </div>
          {action && (
            <Link to={action.path} className="hidden md:flex items-center gap-2 metadata text-black/60 hover:text-black">
              {action.label} <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
            </Link>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}

function ProductGrid({ items, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] bg-[#F5F5F5] animate-pulse" />
        ))}
      </div>
    );
  }
  if (!items.length) {
    return <p className="metadata text-black/40">The archive is being curated. Check back soon.</p>;
  }
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6">
      {items.map((item) => (
        <ProductCard key={item.id} item={item} />
      ))}
    </div>
  );
}