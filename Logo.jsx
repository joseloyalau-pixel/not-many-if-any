import React from "react";
import { cn } from "@/lib/utils";

/**
 * NOT MANY IF ANY brand mark.
 * variant="stacked" — compact two-line wordmark (navbar).
 * variant="boxed"   — full square-framed logo (footer/hero accents).
 * invert=true       — for dark backgrounds (white frame/text, white bar with black text).
 */
export default function Logo({ variant = "stacked", invert = false, className }) {
  const frame = invert ? "border-white" : "border-black";
  const topColor = invert ? "text-white" : "text-black";
  const barBg = invert ? "bg-white" : "bg-black";
  const barText = invert ? "text-black" : "text-white";

  if (variant === "stacked") {
    return (
      <span className={cn("inline-flex flex-col font-heading font-bold uppercase leading-[0.82] tracking-tight", topColor, className)}>
        <span>Not Many</span>
        <span className="flex items-end gap-1 leading-none">
          <span className={cn("text-[0.5em] pb-[0.15em] opacity-80", barText, barBg, "px-1")}>If</span>
          <span className="text-[1.15em]">Any</span>
        </span>
      </span>
    );
  }

  return (
    <span className={cn("inline-block border-2 p-3 font-heading font-bold uppercase leading-[0.85] tracking-tight", frame, className)}>
      <span className={cn("block", topColor)}>Not Many</span>
      <span className={cn("mt-1 flex items-end gap-1.5 -mx-0.5", barBg, "px-1.5 py-1")}>
        <span className={cn("text-sm pb-0.5 opacity-80", barText)}>If</span>
        <span className={cn("text-2xl leading-none", barText)}>Any</span>
      </span>
    </span>
  );
}