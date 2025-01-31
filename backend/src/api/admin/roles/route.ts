import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { Permission } from "../../../modules/role/models/role";
import { createRoleWorkflow } from "../../../workflows/create-role";

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

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve("query");

  const {
    data: roles,
    metadata: { count, take, skip },
  } = await query.graph({
    entity: "role",
    ...req.remoteQueryConfig,
  });

  res.json({ roles, count, limit: take, offset: skip });
};
