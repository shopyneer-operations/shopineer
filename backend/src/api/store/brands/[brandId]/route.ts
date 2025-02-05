import { MedusaRequest, MedusaResponse } from "@medusajs/framework";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve("query");

  const {
    data: [brand],
  } = await query.graph({
    entity: "brand",
    fields: ["*", "products.*"],
    filters: {
      id: req.params.brandId,
    },
  });

  res.json({ brand });
};
