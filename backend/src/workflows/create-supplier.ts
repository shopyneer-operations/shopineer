import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { SUPPLIER_MODULE } from "src/modules/supplier";
import SupplierModuleService from "src/modules/supplier/service";

export type CreateSupplierStepInput = {
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
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
  contact_person?: string;
  email?: string;
  phone?: string;
};

export const createSupplierWorkflow = createWorkflow(
  "create-supplier",
  function workflow(input: CreateSupplierWorkflowInput) {
    const supplier = createSupplierStep(input);

    return new WorkflowResponse(supplier);
  }
);
