import React from "react";
import { cn } from "@/lib/utils";

/**
 * NOT MANY IF ANY brand lockup: a small square monogram + the wordmark.
 * Used as the header on the navbar and inner page headers.
 */
const SIZES = {
  sm: { square: "w-7 h-7 text-[0.6rem]", name: "text-sm" },
  md: { square: "w-9 h-9 text-[0.7rem]", name: "text-base" },
  lg: { square: "w-11 h-11 text-sm", name: "text-lg" }
};

export default function BrandMark({ size = "md", invert = false, showName = true, className }) {
  const s = SIZES[size] || SIZES.md;
  const squareBg = invert ? "bg-white" : "bg-black";
  const squareText = invert ? "text-black" : "text-white";
  const nameColor = invert ? "text-white" : "text-black";

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "inline-flex items-center justify-center font-heading font-bold uppercase leading-none",
          s.square, squareBg, squareText
        )}
        aria-hidden="true"
      >
        NM
      </span>
      {showName && (
        <span className={cn("font-heading uppercase tracking-[0.18em] font-medium whitespace-nowrap", s.name, nameColor)}>
          Not Many If Any
        </span>
      )}
    </span>
  );
}