import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { ROLE_MODULE } from "src/modules/role";
import RoleModuleService from "src/modules/role/service";

export const updateRoleStep = createStep(
  "update-role-step",
  async function updateRoleStep(input: any, { container }) {
    const logger = container.resolve("logger");
    const activityId = logger.activity(`🔵 updateRoleStep: Updating role: ${JSON.stringify(input)}`);

    const roleModuleService: RoleModuleService = container.resolve(ROLE_MODULE);

    const oldRole = await roleModuleService.retrieveRole(input.id);

    const newRole = await roleModuleService.updateRoles(input);

    logger.success(activityId, `🟢 updateRoleStep: Role updated: ${newRole.name}`);

    return new StepResponse(newRole, oldRole);
  },
  async function rollBack(oldRole: any, { container }) {
    const roleModuleService: RoleModuleService = container.resolve(ROLE_MODULE);

    await roleModuleService.updateRoles(oldRole);
  }
);

export const updateRoleWorkflow = createWorkflow("update-role", function workflow(input: any) {
  const role = updateRoleStep(input);

  return new WorkflowResponse(role);
});
