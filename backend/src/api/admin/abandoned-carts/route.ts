import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { subDays } from "date-fns";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve("query");

  const oneDayAgo = subDays(new Date(), 1); // Get the date 1 day ago

  const {
    data: abandonedCarts,
    metadata: { count, take, skip },
  } = await query.graph({
    entity: "cart",
    filters: { updated_at: { $lte: oneDayAgo.toISOString() }, completed_at: null }, // Carts updated before this date
    ...req.remoteQueryConfig,
  });
  res.json({ abandonedCarts, count, limit: take, offset: skip });
}
