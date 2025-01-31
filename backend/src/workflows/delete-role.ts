import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { ROLE_MODULE } from "src/modules/role";
import RoleModuleService from "src/modules/role/service";

type DeleteRoleDto = {
  id: string;
};

export const deleteRoleStep = createStep(
  "delete-role-step",
  async function step({ id }: DeleteRoleDto, { container }) {
    const query = container.resolve("query");
    const roleModuleService: RoleModuleService = container.resolve(ROLE_MODULE);

    const {
      data: [role],
    } = await query.graph({
      entity: "role",
      fields: ["*", "users.*"],
      filters: {
        id,
      },
    });

    if (role.users.length > 0) {
      return StepResponse.permanentFailure(
        `Cannot delete role: "${role.name}" because it has ${role.users.length} users`
      );
    }

    await roleModuleService.deleteRoles(id);

    return new StepResponse(id, role);
  },
  async function rollBack(role: any, { container }) {
    const roleModuleService: RoleModuleService = container.resolve(ROLE_MODULE);

    await roleModuleService.createRoles(role);
  }
);

export const deleteRoleWorkflow = createWorkflow("delete-role", function workflow(input: DeleteRoleDto) {
  const roleId = deleteRoleStep(input);

  return new WorkflowResponse(roleId);
});
