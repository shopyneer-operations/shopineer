import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { getTogetherProductsListWorkflow } from "../../../../workflows/get-together-products-list";

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const { result: products } = await getTogetherProductsListWorkflow(req.scope).run({
    input: { productId: req.params.productId, count: req.query.count && Number(req.query.count) },
    throwOnError: true,
    logOnError: true,
  });

  res.json({ products });
};
