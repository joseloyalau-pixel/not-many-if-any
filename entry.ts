const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

function genSku(category, seed) {
  const prefix = (category || "GEN").slice(0, 3).toUpperCase();
  const yy = String(new Date().getFullYear()).slice(-2);
  const num = String((seed % 9000) + 1000).padStart(4, "0");
  return `JL-${prefix}-${yy}${num}`;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);

    const body = await req.json();
    const count = Math.min(Math.max(parseInt(body.count, 10) || 0, 1), 200);
    const prefix = body.prefix || "GEN";
    const storageLocation = body.storage_location || undefined;

    const ts = Date.now();
    const baseSeq = ts % 9000;
    const records = [];
    for (let i = 0; i < count; i++) {
      const sku = genSku(prefix, baseSeq + i);
      records.push({
        title: `Pending ${sku}`,
        sku,
        inventory_id: `INV-${String(ts).slice(-6)}${String(i).padStart(3, "0")}`,
        barcode: sku,
        status: "Unprocessed",
        storage_location: storageLocation,
        is_one_of_one: true,
      });
    }

    const created = await db.asServiceRole.entities.Inventory.bulkCreate(records);
    const list = Array.isArray(created) ? created : (created?.data || []);
    return Response.json({ created: list, count: records.length });
  } catch (error) {
    console.error("bulkGenerateSkus error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}