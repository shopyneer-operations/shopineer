import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ReviewDto } from "../../../types/review";

export const GET = async (req: MedusaRequest<ReviewDto>, res: MedusaResponse) => {
  const query = req.scope.resolve("query");

  const {
    data: reviews,
    metadata: { count, take, skip },
  } = await query.graph({
    entity: "review",
    ...req.remoteQueryConfig,
  });

  res.json({ reviews, count, limit: take, offset: skip });
};
