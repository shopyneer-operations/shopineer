import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ROLE_MODULE } from "src/modules/role";
import { Permission } from "src/modules/role/models/role";
import RoleModuleService from "src/modules/role/service";

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

  const roleService: RoleModuleService = req.scope.resolve(ROLE_MODULE);

  const roleResult = await roleService.createRoles({
    name,
    permissions,
  });

  //   const role = await roleService.create({
  //     name,
  //     store_id,
  //     permissions,
  //   });

  //   res.json(role);
};
