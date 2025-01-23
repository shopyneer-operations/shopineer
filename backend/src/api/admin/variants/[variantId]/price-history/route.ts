import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve("query");

  const { data: variantsPriceHistories } = await query.graph({
    entity: "product_variant",
    fields: ["*", "price_histories.*"],
    filters: {
      id: req.params.variantId,
    },
  });

  res.json({ variant: variantsPriceHistories[0] });
};
