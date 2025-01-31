import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { Supplier } from "../../../../types/Supplier";
import { deleteBrandWorkflow } from "../../../../workflows/delete-brand";
import { updateBrandWorkflow } from "../../../../workflows/update-brand";

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
