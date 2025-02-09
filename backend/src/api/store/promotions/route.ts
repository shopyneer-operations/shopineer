import { MedusaRequest, MedusaResponse } from "@medusajs/framework";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve("query");

  const {
    data: promotions,
    metadata: { count, take, skip },
  } = await query.graph({
    entity: "promotion",
    ...req.remoteQueryConfig,
  });

  res.json({ promotions, count, limit: take, offset: skip });
}
