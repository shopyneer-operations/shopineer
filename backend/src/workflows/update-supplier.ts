import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { SUPPLIER_MODULE } from "src/modules/supplier";
import SupplierModuleService from "src/modules/supplier/service";
import { Supplier } from "src/types/Supplier";

export const updateSupplierStep = createStep(
  "update-supplier-step",
  async function step(input: Supplier, { container }) {
    const logger = container.resolve("logger");
    const activityId = logger.activity(`🔵 updateSupplierStep: Updating supplier: ${JSON.stringify(input)}`);

    const supplierModuleService: SupplierModuleService = container.resolve(SUPPLIER_MODULE);
    const oldSupplier = await supplierModuleService.retrieveSupplier(input.id);

    const newSupplier = await supplierModuleService.updateSuppliers(input);

    logger.success(activityId, `🟢 updateSupplierStep: Supplier updated: ${newSupplier.name}`);

    return new StepResponse(newSupplier, oldSupplier);
  },
  async function rollBack(oldSupplier: Supplier, { container }) {
    const supplierModuleService: SupplierModuleService = container.resolve(SUPPLIER_MODULE);

    await supplierModuleService.updateSuppliers(oldSupplier);
  }
);

export const updateSupplierWorkflow = createWorkflow("update-supplier", function workflow(input: Supplier) {
  const supplier = updateSupplierStep(input);

  return new WorkflowResponse(supplier);
});
