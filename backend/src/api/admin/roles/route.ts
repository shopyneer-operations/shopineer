import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { Permission } from "src/modules/role/models/role";
import { createRoleWorkflow } from "src/workflows/create-role";

export const POST = async (
  req: MedusaRequest<{
    name: string;
    store_id: string;
    permissions?: Permission[];
  }>,
  res: MedusaResponse
) => {
  // omitting validation for simplicity
  const { name, store_id, permissions = [] } = req.body;

  const { result } = await createRoleWorkflow(req.scope).run({ input: { name, store_id, permissions } });

  res.json(result);
};
