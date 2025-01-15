import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { createSupplierWorkflow } from "workflows/create-supplier";

type PostAdminCreateSupplierType = {
  name: string;
};

export async function POST(req: MedusaRequest<PostAdminCreateSupplierType>, res: MedusaResponse) {
  const { result: supplier } = await createSupplierWorkflow(req.scope).run({ input: req.validatedBody });

  res.json({ supplier });
}
