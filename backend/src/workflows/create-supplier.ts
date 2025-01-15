import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { SUPPLIER_MODULE } from "modules/supplier";
import SupplierModuleService from "modules/supplier/models/service";

export type CreateSupplierStepInput = {
  name: string;
};

export const createSupplierStep = createStep(
  "create-supplier-step",
  async function step(input: CreateSupplierStepInput, { container }) {
    const supplierModuleService: SupplierModuleService = container.resolve(SUPPLIER_MODULE);

    const supplier = await supplierModuleService.createSuppliers(input);

    return new StepResponse(supplier, supplier.id);
  },
  async function rollBack(id: string, { container }) {
    const supplierModuleService: SupplierModuleService = container.resolve(SUPPLIER_MODULE);

    await supplierModuleService.deleteSuppliers(id);
  }
);

export type CreateSupplierWorkflowInput = {
  name: string;
};

export const createSupplierWorkflow = createWorkflow(
  "create-supplier",
  function workflow(input: CreateSupplierWorkflowInput) {
    const supplier = createSupplierStep(input);

    return new WorkflowResponse(supplier);
  }
);
