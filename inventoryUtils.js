import React from "react";

export const CATEGORIES = ["Apparel", "Sneakers", "Footwear", "Collectibles", "Homewares", "Vintage", "Accessories", "One-of-One"];
export const STATUSES = ["Unprocessed", "Awaiting Photos", "Ready To List", "Listed", "Sold", "Shipped", "Archived"];
export const LOCATIONS = ["Garage", "Bedroom", "Caravan", "Sunshine Storage", "Yarraville Storage"];
export const PLATFORMS = ["eBay", "Facebook Marketplace", "Depop", "Etsy", "Shopify", "Wix", "Jose Loyal Website"];

export function generateSKU(category, index) {
  const prefix = (category || "GEN").slice(0, 3).toUpperCase();
  const date = new Date();
  const yy = String(date.getFullYear()).slice(-2);
  const num = String(index || Math.floor(Math.random() * 9000) + 1000).padStart(4, "0");
  return `JL-${prefix}-${yy}${num}`;
}

export function qrUrl(text) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
}

export function formatPrice(val) {
  if (val == null || val === "") return "—";
  return `$${Number(val).toLocaleString()}`;
}