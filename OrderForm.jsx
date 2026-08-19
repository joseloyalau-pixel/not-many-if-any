const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";
import { Upload, X, Loader2, AlertCircle } from "lucide-react";

import { Section, Field, TextInput, TextArea, ChipGrid, SwatchPicker } from "./FormFields";

const DESIGN_STYLES = ["Minimal", "Streetwear", "Luxury", "Graffiti", "Anime", "Cartoon", "Floral", "Abstract", "Sports", "Gaming", "Music Inspired", "Custom Logo", "Other"];
const BUDGETS = ["Under $300", "$300–500", "$500–800", "$800+"];
const EXTRAS = ["Matching laces", "Protective coating", "Extra lace set", "Display box", "Signature by artist", "Surprise creative freedom"];
const ACCEPTED = /\.(jpe?g|png|heic|heif|pdf)$/i;
const MAX_SIZE = 20 * 1024 * 1024;

const empty = {
  full_name: "", email: "", mobile: "", instagram: "",
  owns_shoes: "",
  sneaker_brand: "", sneaker_model: "", sneaker_size: "", sneaker_gender: "", preferred_colour: "",
  design_styles: [], other_style: "",
  colour_preferences: [], other_colours: "",
  design_description: "",
  budget: "",
  required_date: "", event_reason: "",
  extras: [],
  shipping_type: "", shipping_address: "",
  terms_accepted: false,
  website: ""
};

export default function OrderForm({ onSubmitSuccess }) {
  const [form, setForm] = useState(empty);
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: undefined, submit: undefined }));
  };

  const addFiles = async (fileList) => {
    const files = Array.from(fileList);
    for (const f of files) {
      if (images.length >= 10) break;
      if (!ACCEPTED.test(f.name)) { setSubmitError(`"${f.name}" is not a supported format`); continue; }
      if (f.size > MAX_SIZE) { setSubmitError(`"${f.name}" exceeds 20MB`); continue; }
      const id = Math.random().toString(36).slice(2);
      const preview = URL.createObjectURL(f);
      setImages((prev) => [...prev, { id, name: f.name, preview, remoteUrl: null, uploading: true }]);
      try {
        const { file_url } = await db.integrations.Core.UploadFile({ file: f });
        setImages((prev) => prev.map((p) => (p.id === id ? { ...p, remoteUrl: file_url, uploading: false } : p)));
      } catch (_) {
        setImages((prev) => prev.filter((p) => p.id !== id));
        setSubmitError(`Failed to upload "${f.name}"`);
      }
    }
  };

  const removeImage = (id) => setImages((prev) => prev.filter((p) => p.id !== id));

  const validate = (f) => {
    const e = {};
    if (!f.full_name.trim()) e.full_name = "Required";
    if (!f.email.trim()) e.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "Invalid email";
    if (!f.mobile.trim()) e.mobile = "Required";
    if (!f.design_description.trim()) e.design_description = "Required";
    if (!f.budget) e.budget = "Required";
    if (!f.shipping_type) e.shipping_type = "Required";
    else if (!f.shipping_address.trim()) e.shipping_address = "Required";
    if (!f.terms_accepted) e.terms = "You must accept the terms";
    if (f.owns_shoes === "No") {
      if (!f.sneaker_brand.trim()) e.sneaker_brand = "Required";
      if (!f.sneaker_size.trim()) e.sneaker_size = "Required";
    }
    return e;
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) {
      const firstErr = document.querySelector("[data-error='true'], [aria-invalid='true']");
      firstErr?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (images.some((i) => i.uploading)) { setSubmitError("Please wait for image uploads to finish"); return; }

    setSubmitting(true);
    try {
      const payload = { ...form, inspiration_images: images.map((i) => i.remoteUrl).filter(Boolean) };
      const res = await db.functions.invoke("submitCustomOrder", payload);
      const data = res.data || res;
      onSubmitSuccess(data.order_id);
    } catch (err) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="pb-16">
      {/* Honeypot */}
      <input type="text" name="website" value={form.website} onChange={(e) => set("website", e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <Section step="01" title="Customer Details">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Full Name" required error={errors.full_name} id="full_name">
            <TextInput id="full_name" value={form.full_name} onChange={(v) => set("full_name", v)} placeholder="Your full name" required />
          </Field>
          <Field label="Email Address" required error={errors.email} id="email">
            <TextInput id="email" type="email" value={form.email} onChange={(v) => set("email", v)} placeholder="you@email.com" required />
          </Field>
          <Field label="Mobile Number" required error={errors.mobile} id="mobile">
            <TextInput id="mobile" value={form.mobile} onChange={(v) => set("mobile", v)} placeholder="04xx xxx xxx" required />
          </Field>
          <Field label="Instagram Username" id="instagram">
            <TextInput id="instagram" value={form.instagram} onChange={(v) => set("instagram", v)} placeholder="@yourhandle (optional)" />
          </Field>
        </div>
      </Section>

      <Section step="02" title="Sneaker Information" hint="Do you already own the shoes you want customised?">
        <Field error={errors.owns_shoes}>
          <ChipGrid options={["Yes", "No"]} selected={form.owns_shoes} onToggle={(v) => set("owns_shoes", v)} multi={false} columns="grid-cols-2" />
        </Field>
        {form.owns_shoes === "No" && (
          <div className="grid sm:grid-cols-2 gap-4 mt-6 animate-[fade-up_0.4s_ease-out]">
            <Field label="Brand" required error={errors.sneaker_brand} id="sneaker_brand">
              <TextInput id="sneaker_brand" value={form.sneaker_brand} onChange={(v) => set("sneaker_brand", v)} placeholder="Nike, Adidas, etc." required />
            </Field>
            <Field label="Model" id="sneaker_model">
              <TextInput id="sneaker_model" value={form.sneaker_model} onChange={(v) => set("sneaker_model", v)} placeholder="Air Force 1, Stan Smith…" />
            </Field>
            <Field label="Size (US/AU)" required error={errors.sneaker_size} id="sneaker_size">
              <TextInput id="sneaker_size" value={form.sneaker_size} onChange={(v) => set("sneaker_size", v)} placeholder="US 9" required />
            </Field>
            <Field label="Men's / Women's" id="sneaker_gender">
              <ChipGrid options={["Men's", "Women's", "Unisex"]} selected={form.sneaker_gender} onToggle={(v) => set("sneaker_gender", v)} multi={false} columns="grid-cols-3" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Preferred Base Colour" id="preferred_colour">
                <TextInput id="preferred_colour" value={form.preferred_colour} onChange={(v) => set("preferred_colour", v)} placeholder="e.g. all white, off-white" />
              </Field>
            </div>
          </div>
        )}
      </Section>

      <Section step="03" title="Design Style" hint="Select all that appeal to you.">
        <Field error={errors.design_styles}>
          <ChipGrid options={DESIGN_STYLES} selected={form.design_styles} onToggle={(v) => set("design_styles", v)} multi={true} />
        </Field>
        {form.design_styles.includes("Other") && (
          <div className="mt-4">
            <Field label="Describe your other style" id="other_style">
              <TextInput id="other_style" value={form.other_style} onChange={(v) => set("other_style", v)} placeholder="Tell us your vision" />
            </Field>
          </div>
        )}
      </Section>

      <Section step="04" title="Colour Preferences" hint="Tap the colours you'd like featured.">
        <SwatchPicker selected={form.colour_preferences} onToggle={(v) => set("colour_preferences", v)} />
        <div className="mt-4">
          <Field label="Other / specific colours" id="other_colours">
            <TextInput id="other_colours" value={form.other_colours} onChange={(v) => set("other_colours", v)} placeholder="e.g. champagne, forest green" />
          </Field>
        </div>
      </Section>

      <Section step="05" title="Upload Inspiration" hint="Up to 10 images · JPG, PNG, HEIC or PDF · 20MB each">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((img) => (
            <div key={img.id} className="relative aspect-square border border-black/15 bg-[#F5F5F5] overflow-hidden">
              {img.preview && <img src={img.preview} alt={img.name} className="w-full h-full object-cover" />}
              {img.uploading && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-black/60" strokeWidth={1.5} />
                </div>
              )}
              <button type="button" onClick={() => removeImage(img.id)} className="absolute top-1 right-1 bg-black/70 text-white p-1 hover:bg-black">
                <X className="w-3 h-3" strokeWidth={2} />
              </button>
              <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[0.55rem] px-1 py-0.5 truncate font-mono">{img.name}</span>
            </div>
          ))}
          {images.length < 10 && (
            <label className="aspect-square border-2 border-dashed border-black/20 flex flex-col items-center justify-center cursor-pointer hover:border-black/50 transition-colors text-center px-2">
              <input type="file" accept=".jpg,.jpeg,.png,.heic,.heif,.pdf,image/jpeg,image/png,image/heic,application/pdf" multiple className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
              <Upload className="w-5 h-5 text-black/40 mb-1" strokeWidth={1.5} />
              <span className="text-[0.6rem] uppercase tracking-widest text-black/40 font-mono">Add Files</span>
            </label>
          )}
        </div>
      </Section>

      <Section step="06" title="Design Description">
        <Field error={errors.design_description} id="design_description">
          <TextArea id="design_description" value={form.design_description} onChange={(v) => set("design_description", v)} placeholder="Describe your dream custom sneakers in as much detail as possible." rows={5} required />
        </Field>
      </Section>

      <Section step="07" title="Budget">
        <Field error={errors.budget}>
          <ChipGrid options={BUDGETS} selected={form.budget} onToggle={(v) => set("budget", v)} multi={false} columns="grid-cols-2 sm:grid-cols-4" />
        </Field>
      </Section>

      <Section step="08" title="Required Date">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Required By" id="required_date">
            <TextInput id="required_date" type="date" value={form.required_date} onChange={(v) => set("required_date", v)} />
          </Field>
          <Field label="Event Reason (optional)" id="event_reason">
            <TextInput id="event_reason" value={form.event_reason} onChange={(v) => set("event_reason", v)} placeholder="Birthday, Wedding, Festival…" />
          </Field>
        </div>
      </Section>

      <Section step="09" title="Extras">
        <ChipGrid options={EXTRAS} selected={form.extras} onToggle={(v) => set("extras", v)} multi={true} columns="grid-cols-2 sm:grid-cols-3" />
      </Section>

      <Section step="10" title="Shipping">
        <Field error={errors.shipping_type}>
          <ChipGrid options={["Australia", "International"]} selected={form.shipping_type} onToggle={(v) => set("shipping_type", v)} multi={false} columns="grid-cols-2" />
        </Field>
        {form.shipping_type && (
          <div className="mt-5 animate-[fade-up_0.4s_ease-out]">
            <Field label="Shipping Address" required error={errors.shipping_address} id="shipping_address">
              <TextArea id="shipping_address" value={form.shipping_address} onChange={(v) => set("shipping_address", v)} placeholder="Full name, street, city, state, postcode, country" rows={3} required />
            </Field>
          </div>
        )}
      </Section>

      <Section step="11" title="Terms">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.terms_accepted}
            onChange={(e) => set("terms_accepted", e.target.checked)}
            aria-required="true"
            className="mt-1 w-4 h-4 accent-black"
          />
          <span className="text-sm text-black/70">
            I understand every pair is hand-made and unique. Design approval and production times may vary.
            {errors.terms && <span className="block text-red-600 mt-1">{errors.terms}</span>}
          </span>
        </label>
      </Section>

      {submitError && (
        <div className="mt-6 border border-red-500/40 bg-red-50 px-4 py-3 flex gap-2 items-start">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" strokeWidth={1.5} />
          <p className="text-red-700 text-sm">{submitError}</p>
        </div>
      )}

      <div className="pt-8">
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-black text-white py-5 font-heading uppercase tracking-[0.2em] text-sm md:text-base hover:bg-black/85 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all"
        >
          {submitting ? <><Loader2 className="w-5 h-5 animate-spin" strokeWidth={1.5} /> Submitting…</> : "Start My Custom Order"}
        </button>
      </div>
    </form>
  );
}