import React from "react";
import { X, Printer, Download, FileSpreadsheet, FileType, Tags } from "lucide-react";
import { qrUrl } from "./inventoryUtils";

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function csvCell(val) {
  const s = String(val ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function downloadBlob(filename, mime, content) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2500);
}

export default function LabelExport({ items, onClose }) {
  const origin = window.location.origin;
  const rows = items.map((it) => ({
    title: it.title && it.title.trim() ? it.title : "PENDING",
    sku: it.sku || "",
    brand: it.brand || "",
    qr: qrUrl(`${origin}/product/${it.id}`),
    url: `${origin}/product/${it.id}`,
  }));
  const stamp = new Date().toISOString().slice(0, 10);

  const buildHtml = () => {
    const cards = rows.map((r) => `
      <div class="label">
        <div class="qr"><img src="${r.qr}" alt="QR" /></div>
        <div class="meta">
          <div class="brand">NOT MANY IF ANY</div>
          <div class="title">${escapeHtml(r.title)}</div>
          <div class="sku">${escapeHtml(r.sku)}</div>
        </div>
      </div>`).join("");
    return `<!doctype html><html><head><meta charset="utf-8"><title>NOT MANY IF ANY — Labels</title>
      <style>
        @page { margin: 12mm; }
        body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #000; margin: 0; }
        .sheet-title { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #888; margin-bottom: 16px; }
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .label { border: 1.5px solid #000; padding: 10px; display: flex; gap: 10px; align-items: center; page-break-inside: avoid; }
        .qr img { width: 70px; height: 70px; display: block; }
        .meta { min-width: 0; }
        .brand { font-weight: 700; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; }
        .title { font-size: 11px; text-transform: uppercase; margin-top: 4px; line-height: 1.15; }
        .sku { font-family: monospace; font-size: 11px; margin-top: 4px; }
      </style></head><body>
      <div class="sheet-title">NOT MANY IF ANY — Labels · ${rows.length} · ${new Date().toLocaleDateString()}</div>
      <div class="grid">${cards}</div>
      </body></html>`;
  };

  const printSheet = () => {
    const html = buildHtml();
    const w = window.open("", "_blank");
    if (!w) { alert("Allow pop-ups to print labels."); return; }
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 400);
  };

  const saveHtml = () => downloadBlob(`nmi-labels-${stamp}.html`, "text/html", buildHtml());

  const exportCsv = () => {
    const header = ["SKU", "Title", "Brand", "QR URL", "Product URL"];
    const lines = [header.join(",")];
    rows.forEach((r) => {
      lines.push([csvCell(r.sku), csvCell(r.title), csvCell(r.brand), csvCell(r.qr), csvCell(r.url)].join(","));
    });
    downloadBlob(`nmi-labels-${stamp}.csv`, "text/csv;charset=utf-8", "\uFEFF" + lines.join("\n"));
  };

  const exportWord = () => {
    const cells = rows.map((r) => `
      <td class="cell">
        <img class="qr" src="${r.qr}" alt="QR" />
        <div class="brand">NOT MANY IF ANY</div>
        <div class="title">${escapeHtml(r.title)}</div>
        <div class="sku">${escapeHtml(r.sku)}</div>
      </td>`);
    let tableRows = "";
    for (let i = 0; i < cells.length; i += 3) {
      tableRows += `<tr>${cells.slice(i, i + 3).join("")}</tr>`;
    }
    const doc = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>NOT MANY IF ANY — Labels</title>
<style>
@page Section1 { size: 297mm 210mm; margin: 10mm; mso-page-orientation: landscape; }
body { font-family: Arial, sans-serif; }
table { width: 100%; border-collapse: collapse; }
td.cell { width: 33.33%; height: 55mm; border: 1px solid #000; text-align: center; vertical-align: middle; padding: 8px; }
img.qr { width: 70px; height: 70px; }
.brand { font-weight: 700; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; }
.title { font-size: 12px; text-transform: uppercase; margin-top: 4px; line-height: 1.15; }
.sku { font-family: monospace; font-size: 10px; margin-top: 4px; }
br { mso-data-placement: same-cell; }
</style></head>
<body><table>${tableRows}</table></body></html>`;
    downloadBlob(`nmi-labels-${stamp}.doc`, "application/msword", doc);
  };

  const btn = "metadata border border-white/20 px-4 py-2.5 flex items-center gap-2 hover:bg-white/5";
  const primary = "metadata border border-white bg-white text-black px-4 py-2.5 flex items-center gap-2 hover:bg-white/80";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-black border border-white/15 w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="border-b border-white/15 px-6 py-4 flex justify-between items-center">
          <div>
            <p className="text-[0.6rem] uppercase tracking-widest text-white/40 font-mono">Export Labels</p>
            <h2 className="font-heading uppercase tracking-wide text-lg">{rows.length} labels · titles from assigned items</h2>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X className="w-5 h-5" strokeWidth={1.5} /></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {rows.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-8">No items selected. Select specimens in the dashboard, then choose Labels.</p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 max-h-52 overflow-y-auto">
                {rows.map((r, i) => (
                  <div key={i} className="border border-white/10 p-2 flex flex-col items-center">
                    <img src={r.qr} alt="" className="w-12 h-12 bg-white/5" />
                    <p className="text-[0.6rem] text-white/70 mt-1 text-center line-clamp-2 leading-tight">{r.title}</p>
                    <p className="font-mono text-[0.55rem] text-white/40 mt-0.5 break-all text-center">{r.sku}</p>
                  </div>
                ))}
              </div>
              <p className="text-white/40 text-xs">Titles show the assigned name — items without a title print as "PENDING". Export to Word/Excel to resize cells to match your label sheets.</p>
            </>
          )}
        </div>

        {rows.length > 0 && (
          <div className="border-t border-white/15 px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button onClick={exportCsv} className={btn}><FileSpreadsheet className="w-4 h-4" strokeWidth={1.5} /> Excel</button>
            <button onClick={exportWord} className={btn}><FileType className="w-4 h-4" strokeWidth={1.5} /> Word</button>
            <button onClick={saveHtml} className={btn}><Download className="w-4 h-4" strokeWidth={1.5} /> Save HTML</button>
            <button onClick={printSheet} className={primary}><Printer className="w-4 h-4" strokeWidth={1.5} /> Print</button>
          </div>
        )}
      </div>
    </div>
  );
}