import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { SUPPLIER_MODULE } from "src/modules/supplier";
import SupplierModuleService from "src/modules/supplier/service";

type DeleteSupplierStepInput = {
  id: string;
};

export const deleteSupplierStep = createStep(
  "delete-supplier-step",
  async function step({ id }: DeleteSupplierStepInput, { container }) {
    const supplierModuleService: SupplierModuleService = container.resolve(SUPPLIER_MODULE);

    const supplier = await supplierModuleService.retrieveSupplier(id);

    await supplierModuleService.deleteSuppliers(id);

    return new StepResponse(id, supplier);
  },
  async function rollBack(supplier: any, { container }) {
    const supplierModuleService: SupplierModuleService = container.resolve(SUPPLIER_MODULE);

    await supplierModuleService.createSuppliers(supplier);
  }
);

type DeleteSupplierWorkflowInput = {
  id: string;
};

export const deleteSupplierWorkflow = createWorkflow(
  "delete-supplier",
  function workflow(input: DeleteSupplierWorkflowInput) {
    const supplierId = deleteSupplierStep(input);

    return new WorkflowResponse(supplierId);
  }
);
