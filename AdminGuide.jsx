import React, { useState } from "react";
import { X, Search, Plus, Upload, Tags, QrCode, CheckSquare, Workflow } from "lucide-react";

const SECTIONS = [
  {
    icon: Plus,
    title: "Add Specimen",
    body: "Create a new one-of-one listing manually. Fill the core details (title, brand, category), item specifics, measurements, pricing and storage location. A unique SKU and inventory ID are generated automatically, and the QR code is created from the SKU — no manual numbering needed. Toggle One-of-One (default) and Featured as required."
  },
  {
    icon: Search,
    title: "Search & Filter",
    body: "Use the search bar to find items by SKU, inventory ID, brand, category, title, colour, size or storage location. Press ⌘K (or Ctrl+K) to jump to search instantly. Use the status chips to filter the table by workflow stage — click a chip again to clear it."
  },
  {
    icon: CheckSquare,
    title: "Bulk Actions",
    body: "Tick the checkbox on any row (or the header checkbox to select all filtered results) to enable bulk actions. Use the \"Bulk change status\" dropdown to move many specimens to a new stage at once. Clear the selection when done."
  },
  {
    icon: Workflow,
    title: "Status Workflow",
    body: "Every specimen moves through: Unprocessed → Awaiting Photos → Ready To List → Listed → Sold → Shipped → Archived. Change a single item's status inline via the dropdown in its row, or use bulk actions for many at once. Status drives your dashboard stats."
  },
  {
    icon: Upload,
    title: "Bulk Import",
    body: "Upload a CSV or Excel file to create many specimens at once. Download the provided template first so your column headers match, then fill it and upload. The system auto-generates SKU, inventory ID and barcode for each row and assigns default values for missing fields. Use this to onboard existing stock quickly."
  },
  {
    icon: Tags,
    title: "Container Labels",
    body: "Create physical storage containers (e.g. \"Garage Bin A\", \"Yarraville Box 12\") with a short code. Print a sheet of QR labels for all containers in one go. To assign inventory to a container, open a specimen and enter the container's code in the Container field — scanning the printed label later opens the matching record."
  },
  {
    icon: QrCode,
    title: "QR Codes",
    body: "Each specimen has an auto-generated QR code (from its SKU). Click the QR icon on a row to view and print it. Scanning the code opens that specimen's public product record. Container QR codes (printed via Container Labels) open the container's group instead."
  }
];

export default function AdminGuide({ onClose }) {
  const [open, setOpen] = useState(null);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-black border border-white/15 w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-black border-b border-white/15 px-6 py-4 flex justify-between items-center z-10">
          <div>
            <p className="text-[0.6rem] uppercase tracking-widest text-white/40 font-mono">Command Center</p>
            <h2 className="font-heading uppercase tracking-wide text-lg">Admin User Guide</h2>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X className="w-5 h-5" strokeWidth={1.5} /></button>
        </div>

        <div className="p-6 space-y-2">
          <p className="text-sm text-white/50 mb-4 leading-relaxed">
            Everything you need to manage the NOT MANY IF ANY archive. Tap a topic to expand it.
          </p>
          {SECTIONS.map((s, i) => {
            const isOpen = open === i;
            return (
              <div key={s.title} className="border border-white/10">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-white/5 transition-colors"
                >
                  <s.icon className="w-4 h-4 text-white/60 shrink-0" strokeWidth={1.5} />
                  <span className="font-heading uppercase tracking-widest text-sm flex-1">{s.title}</span>
                  <span className="text-white/30 text-xs font-mono">{isOpen ? "—" : "+"}</span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-sm text-white/60 leading-relaxed animate-[fade-up_0.2s_ease-out]">
                    {s.body}
                  </div>
                )}
              </div>
            );
          })}

          <div className="mt-6 border border-white/15 p-4">
            <p className="text-[0.6rem] uppercase tracking-widest text-white/40 font-mono mb-2">Keyboard Shortcuts</p>
            <div className="flex items-center justify-between text-sm text-white/70">
              <span>Focus search</span>
              <span className="font-mono text-xs border border-white/20 px-2 py-1">⌘K</span>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-black border-t border-white/15 px-6 py-4 flex justify-end">
          <button onClick={onClose} className="metadata bg-white text-black px-6 py-3 hover:bg-white/80">Close Guide</button>
        </div>
      </div>
    </div>
  );
}