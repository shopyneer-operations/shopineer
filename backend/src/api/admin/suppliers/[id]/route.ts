import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { Supplier } from "../../../../types/Supplier";
import { deleteSupplierWorkflow } from "../../../../workflows/delete-supplier";
import { updateSupplierWorkflow } from "../../../../workflows/update-supplier";

export async function PUT(req: MedusaRequest<Supplier>, res: MedusaResponse) {
  const { result: supplier } = await updateSupplierWorkflow(req.scope).run({
    input: { ...req.validatedBody, id: req.params.id },
  });

  res.json({ supplier });
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const { result: supplierId } = await deleteSupplierWorkflow(req.scope).run({ input: { id: req.params.id } });

  res.json({ supplierId });
}
