import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { deleteSupplierWorkflow } from "src/workflows/delete-supplier";

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const { result: supplierId } = await deleteSupplierWorkflow(req.scope).run({ input: { id: req.params.id } });

  res.json({ supplierId });
}
