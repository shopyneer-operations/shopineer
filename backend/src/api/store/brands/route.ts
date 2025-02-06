import { MedusaRequest, MedusaResponse } from "@medusajs/framework";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve("query");

  const {
    data: brands,
    metadata: { count, take, skip },
  } = await query.graph({
    entity: "brand",
    // fields: ["*", "products.*"],
    ...req.remoteQueryConfig,
  });

  res.json({ brands, count, limit: take, offset: skip });
}
