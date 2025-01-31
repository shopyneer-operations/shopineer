import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { assignRoleWorkflow } from "../../../../../../workflows/assign-role-to-user";

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { roleId, userId } = req.params;

  const { result } = await assignRoleWorkflow(req.scope).run({ input: { userId, roleId } });

  res.json(result);
};
