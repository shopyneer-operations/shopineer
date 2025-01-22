import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { Supplier } from "src/types/Supplier";
import { deleteBrandWorkflow } from "src/workflows/delete-brand";
import { deleteSupplierWorkflow } from "src/workflows/delete-supplier";
import { updateBrandWorkflow } from "src/workflows/update-brand";
import { updateSupplierWorkflow } from "src/workflows/update-supplier";

export async function PUT(req: MedusaRequest<Supplier>, res: MedusaResponse) {
  const { result: brand } = await updateBrandWorkflow(req.scope).run({
    input: { ...req.validatedBody, id: req.params.id },
  });

  res.json({ brand });
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const { result: brandId } = await deleteBrandWorkflow(req.scope).run({ input: { id: req.params.id } });

  res.json({ brandId });
}
