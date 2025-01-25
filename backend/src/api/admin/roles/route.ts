import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { RBAC_MODULE } from "src/modules/rbac";
import RbacModuleService from "src/modules/rbac/service";

export const POST = async (
  req: MedusaRequest<{
    name: string;
    store_id: string;
    permissions?: string[];
  }>,
  res: MedusaResponse
) => {
  // omitting validation for simplicity
  const { name, store_id, permissions = [] } = req.body;

  const rbacService: RbacModuleService = req.scope.resolve(RBAC_MODULE);

  const roleResult = await rbacService.createRoles({
    name,
  });

  const permissionsResult = await rbacService.createPermissions(permissions);

  //   const role = await roleService.create({
  //     name,
  //     store_id,
  //     permissions,
  //   });

  //   res.json(role);
};
