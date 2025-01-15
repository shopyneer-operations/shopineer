import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { createSupplierWorkflow } from "src/workflows/create-supplier";

type PostAdminCreateSupplierType = {
  name: string;
};

export async function POST(req: MedusaRequest<PostAdminCreateSupplierType>, res: MedusaResponse) {
  const { result: supplier } = await createSupplierWorkflow(req.scope).run({ input: req.validatedBody });

  res.json({ supplier });
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve("query");

  const { data: suppliers } = await query.graph({ entity: "supplier", fields: ["*", "products.*"] });

  res.json({ suppliers });
}
