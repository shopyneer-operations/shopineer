import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { createBrandWorkflow } from "../../../workflows/create-brand";

type PostAdminCreateSupplierType = {
  name: string;
};

export async function POST(req: MedusaRequest<PostAdminCreateSupplierType>, res: MedusaResponse) {
  const { result: brand } = await createBrandWorkflow(req.scope).run({ input: req.validatedBody });

  res.json({ brand });
}

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
