import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { Role } from "src/types/Role";
import { deleteRoleWorkflow } from "src/workflows/delete-role";
import { updateRoleWorkflow } from "src/workflows/update-role";

export async function PUT(req: MedusaRequest<Role>, res: MedusaResponse) {
  const { result } = await updateRoleWorkflow(req.scope).run({
    input: { ...req.validatedBody, id: req.params.roleId },
  });

  res.json({ result });
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { result: roleId } = await deleteRoleWorkflow(req.scope).run({ input: { id: req.params.roleId } });

    res.json({ roleId });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}
