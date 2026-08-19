const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";
import { Upload, Download, FileSpreadsheet, X, CheckCircle2, AlertTriangle, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

const TEMPLATE_HEADERS = [
  "title", "brand", "category", "subcategory", "description", "condition_grade",
  "colour", "size", "material", "purchase_price", "estimated_value", "sale_price",
  "storage_location", "container", "status", "date_acquired", "date_listed", "notes"
];

const STEPS = ["Template", "Upload", "Summary"];

export default function BulkImport({ onClose, onDone }) {
  const [step, setStep] = useState(0);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const downloadTemplate = () => {
    const csv = TEMPLATE_HEADERS.join(",") + "\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "notmanyifany_inventory_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const runImport = async () => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const { file_url } = await db.integrations.Core.UploadFile({ file });
      const res = await db.functions.invoke("bulkImportInventory", { file_url });
      setResult(res.data || res);
      onDone?.();
      setStep(2);
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-black border border-white/15 w-full max-w-xl max-h-[90vh] flex flex-col">
        {/* header + stepper */}
        <div className="border-b border-white/15 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[0.6rem] uppercase tracking-widest text-white/40 font-mono">Bulk Import Wizard</p>
              <h2 className="font-heading uppercase tracking-wide text-lg">Import Specimens</h2>
            </div>
            <button onClick={onClose} className="text-white/50 hover:text-white"><X className="w-5 h-5" strokeWidth={1.5} /></button>
          </div>
          <div className="flex items-center gap-2 mt-4">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-6 h-6 flex items-center justify-center text-[0.6rem] font-mono border ${i <= step ? "bg-white text-black border-white" : "border-white/20 text-white/40"}`}>{i + 1}</div>
                <span className={`metadata ${i === step ? "text-white" : "text-white/40"}`}>{s}</span>
                {i < STEPS.length - 1 && <div className={`h-px flex-1 ${i < step ? "bg-white" : "bg-white/15"}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* body */}
        <div className="p-6 overflow-y-auto flex-1">
          {step === 0 && (
            <div className="space-y-5">
              <p className="text-white/60 text-sm leading-relaxed">
                Download the CSV template, fill in your specimens (one per row), then upload it in the next step. SKUs and QR codes are auto-generated — you don't need them in the file.
              </p>
              <div className="border border-white/15 p-4">
                <p className="metadata text-white/40 mb-2">Required & optional columns</p>
                <div className="flex flex-wrap gap-1.5">
                  {TEMPLATE_HEADERS.map((h) => (
                    <span key={h} className={`metadata border px-2 py-1 ${h === "title" ? "border-white text-white" : "border-white/15 text-white/50"}`}>{h}{h === "title" ? " *" : ""}</span>
                  ))}
                </div>
                <p className="text-white/30 text-xs mt-2">* title is required for each row</p>
              </div>
              <button onClick={downloadTemplate} className="metadata border border-white/20 px-4 py-2 hover:bg-white/5 flex items-center gap-2">
                <Download className="w-4 h-4" strokeWidth={1.5} /> Download CSV Template
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <label className="block border-2 border-dashed border-white/20 p-10 text-center cursor-pointer hover:border-white/50 transition-colors">
                <input type="file" accept=".csv,.xlsx,.xls,.json" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileSpreadsheet className="w-8 h-8 text-white/60" strokeWidth={1.5} />
                    <p className="text-sm">{file.name}</p>
                    <p className="text-white/40 text-xs">{(file.size / 1024).toFixed(1)} KB · click to change</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-white/40" strokeWidth={1.5} />
                    <p className="text-sm">Drop or select a CSV / Excel / JSON file</p>
                    <p className="text-white/40 text-xs">Each row becomes one specimen</p>
                  </div>
                )}
              </label>
              {error && (
                <div className="border border-red-500/40 bg-red-500/10 p-4 flex gap-2 items-start">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" strokeWidth={1.5} />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}
            </div>
          )}

          {step === 2 && result && (
            <div className="text-center py-6 space-y-4">
              <CheckCircle2 className="w-10 h-10 mx-auto text-green-400" strokeWidth={1.5} />
              <p className="font-heading uppercase text-2xl">{result.imported} Imported</p>
              <p className="text-white/50 text-sm">
                {result.imported} of {result.total} rows added to the archive
                {result.skipped > 0 && ` · ${result.skipped} skipped (missing title)`}
              </p>
              <p className="text-white/40 text-xs">SKUs and QR codes generated automatically. Print labels from the dashboard if needed.</p>
            </div>
          )}
        </div>

        {/* footer */}
        <div className="border-t border-white/15 px-6 py-4 flex justify-between gap-3">
          {step > 0 && step < 2 ? (
            <button onClick={() => setStep(step - 1)} className="metadata border border-white/20 px-6 py-3 hover:bg-white/5 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> Back
            </button>
          ) : <div />}
          <div className="flex gap-3 ml-auto">
            <button onClick={onClose} className="metadata border border-white/20 px-6 py-3 hover:bg-white/5">{step === 2 ? "Close" : "Cancel"}</button>
            {step === 0 && (
              <button onClick={() => setStep(1)} className="metadata bg-white text-black px-6 py-3 hover:bg-white/80 flex items-center gap-2">
                Next <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </button>
            )}
            {step === 1 && (
              <button onClick={runImport} disabled={!file || busy} className="metadata bg-white text-black px-6 py-3 hover:bg-white/80 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2">
                {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Importing…</> : <><Upload className="w-4 h-4" strokeWidth={1.5} /> Import File</>}
              </button>
            )}
            {step === 2 && (
              <button onClick={onClose} className="metadata bg-white text-black px-6 py-3 hover:bg-white/80">Done</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}