import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { BRAND_MODULE } from "src/modules/brand";
import BrandModuleService from "src/modules/brand/service";

type DeleteBrandStepInput = {
  id: string;
};

export const deleteBrandStep = createStep(
  "delete-brand-step",
  async function step({ id }: DeleteBrandStepInput, { container }) {
    const brandModuleService: BrandModuleService = container.resolve(BRAND_MODULE);

    const brand = await brandModuleService.retrieveBrand(id);

    await brandModuleService.deleteBrands(id);

    return new StepResponse(id, brand);
  },
  async function rollBack(brand: any, { container }) {
    const brandModuleService: BrandModuleService = container.resolve(BRAND_MODULE);

    await brandModuleService.createBrands(brand);
  }
);

type DeleteBrandWorkflowInput = {
  id: string;
};

export const deleteBrandWorkflow = createWorkflow("delete-brand", function workflow(input: DeleteBrandWorkflowInput) {
  const brandId = deleteBrandStep(input);

  return new WorkflowResponse(brandId);
});
