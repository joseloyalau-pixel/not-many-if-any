import React, { useState } from "react";
import { Mail, Instagram, MapPin, Plus, Minus } from "lucide-react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    { q: "Are items really one-of-one?", a: "Yes. Every specimen in our archive is a unique, pre-owned piece. Once sold, it will not be restocked. No repeats, ever." },
    { q: "How is condition graded?", a: "Each item receives a forensic condition grade (e.g. 9/10 - Excellent) with a full condition report and macro photography of specific wear points. We prioritise total buyer transparency." },
    { q: "How are items shipped?", a: "We ship via Australia Post with tracking. Manual shipping and local pickup options are also available. Tracking numbers are provided once an item is marked Shipped." },
    { q: "Can I return an item?", a: "Due to the one-of-one nature of our inventory, all sales are final. However, if an item is materially misrepresented we will make it right — contact us within 48 hours of receipt." },
    { q: "Where are you located?", a: "We operate from Melbourne, Australia, with storage across multiple locations including Yarraville and Sunshine." },
    { q: "Do you buy items?", a: "We curate through selective sourcing. If you have a premium pre-owned piece, reach out with details and photos and our team will assess it." },
  ];

  return (
    <div className="pt-16 md:pt-20 bg-white">
      {/* Hero */}
      <section className="py-16 md:py-28 border-b hairline">
        <div className="mx-auto max-w-[1600px] px-5 md:px-10">
          <p className="metadata text-black/40 mb-4">Get In Touch</p>
          <h1 className="font-heading font-bold uppercase text-5xl md:text-7xl tracking-wide">Contact</h1>
        </div>
      </section>

      <div className="mx-auto max-w-[1600px] px-5 md:px-10 py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* Form */}
        <div>
          <h2 className="font-heading uppercase tracking-wide text-2xl mb-2">Send A Message</h2>
          <p className="text-black/50 text-sm mb-8">We respond within 24 hours.</p>
          {submitted ? (
            <div className="border-2 border-black p-8">
              <p className="font-heading uppercase tracking-wide text-lg mb-2">Message Received</p>
              <p className="text-black/60 text-sm">Thank you. Our team will be in touch shortly.</p>
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
              className="space-y-5"
            >
              <div className="grid grid-cols-2 gap-4">
                <Field label="First Name" name="first" required />
                <Field label="Last Name" name="last" required />
              </div>
              <Field label="Email" name="email" type="email" required />
              <Field label="Subject" name="subject" required />
              <div>
                <label className="metadata text-black/40 block mb-2">Message</label>
                <textarea
                  required
                  rows={5}
                  className="w-full border hairline px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors resize-none"
                />
              </div>
              <button type="submit" className="bg-black text-white px-8 py-4 font-heading uppercase tracking-widest text-sm hover:bg-black/80 transition-colors">
                Send Message
              </button>
            </form>
          )}
        </div>

        {/* Info + social */}
        <div>
          <h2 className="font-heading uppercase tracking-wide text-2xl mb-2">Direct Lines</h2>
          <p className="text-black/50 text-sm mb-8">Prefer to reach out directly.</p>
          <div className="space-y-6">
            <ContactRow icon={Mail} label="Email" value="hello@notmanyifany.com" href="mailto:hello@notmanyifany.com" />
            <ContactRow icon={Instagram} label="Instagram" value="@notmanyifany" href="https://instagram.com" />
            <ContactRow icon={MapPin} label="Location" value="Melbourne, Australia" />
          </div>

          <div className="mt-12 border-2 border-[#C0C0C0] p-6">
            <p className="metadata text-black/40 mb-2">Hours</p>
            <p className="text-sm">Mon–Fri · 9am–5pm AEST</p>
            <p className="text-sm text-black/60">Archive accessible 24/7 online</p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <section className="bg-[#F5F5F5] py-20 md:py-32">
        <div className="mx-auto max-w-[1200px] px-5 md:px-10">
          <p className="metadata text-black/40 mb-3">Frequently Asked</p>
          <h2 className="font-heading font-bold uppercase text-3xl md:text-5xl tracking-wide mb-12">Questions</h2>
          <div className="border-t hairline">
            {faqs.map((f, i) => (
              <div key={i} className="border-b hairline">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  className="w-full flex justify-between items-center py-5 text-left"
                >
                  <span className="font-heading uppercase tracking-wide text-base md:text-lg pr-4">{f.q}</span>
                  {openFaq === i ? <Minus className="w-5 h-5 shrink-0" strokeWidth={1.5} /> : <Plus className="w-5 h-5 shrink-0" strokeWidth={1.5} />}
                </button>
                {openFaq === i && (
                  <p className="pb-6 text-black/60 leading-relaxed max-w-2xl">{f.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({ label, name, type = "text", required }) {
  return (
    <div>
      <label className="metadata text-black/40 block mb-2">{label}</label>
      <input
        type={type}
        name={name}
        required={required}
        className="w-full border hairline px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
      />
    </div>
  );
}

function ContactRow({ icon: Icon, label, value, href }) {
  const content = (
    <div className="flex items-center gap-4 group">
      <div className="w-10 h-10 border hairline flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" strokeWidth={1.5} />
      </div>
      <div>
        <p className="metadata text-black/40">{label}</p>
        <p className="text-sm group-hover:underline">{value}</p>
      </div>
    </div>
  );
  return href ? <a href={href} target="_blank" rel="noreferrer">{content}</a> : content;
}