import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function normalizeArabic(text) {
  if (!text) return "";
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[\u064B-\u065F]/g, ""); // Remove Tashkeel / Harakat
}

export function matchesProductSearch(product, query) {
  if (!query) return false;
  const rawTerm = query.toLowerCase().trim();
  const normTerm = normalizeArabic(query);

  const name = product.name?.toLowerCase() || "";
  const displayName = product.displayName?.toLowerCase() || "";
  const arName = product.ar_name || product.name_ar || "";
  const arDesc = product.ar_description || product.description || "";
  const code = product.code?.toString().toLowerCase() || "";
  const barcode = product.barcode?.toString().toLowerCase() || "";
  const sku = product.sku?.toString().toLowerCase() || "";

  // 1. Direct match (English, numbers, or verbatim Arabic)
  if (
    displayName.includes(rawTerm) ||
    name.includes(rawTerm) ||
    arName.toLowerCase().includes(rawTerm) ||
    arDesc.toLowerCase().includes(rawTerm) ||
    code.includes(rawTerm) ||
    barcode.includes(rawTerm) ||
    sku.includes(rawTerm)
  ) {
    return true;
  }

  // 2. Normalized Arabic match
  if (normTerm) {
    if (
      normalizeArabic(arName).includes(normTerm) ||
      normalizeArabic(name).includes(normTerm) ||
      normalizeArabic(displayName).includes(normTerm) ||
      normalizeArabic(arDesc).includes(normTerm)
    ) {
      return true;
    }
  }

  return false;
}

