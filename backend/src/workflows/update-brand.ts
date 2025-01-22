import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { BRAND_MODULE } from "src/modules/brand";
import BrandModuleService from "src/modules/brand/service";
import { Brand } from "src/types/Brand";

export const updateBrandStep = createStep(
  "update-brand-step",
  async function step(input: Brand, { container }) {
    const logger = container.resolve("logger");
    const activityId = logger.activity(`🔵 updateBrandStep: Updating brand: ${JSON.stringify(input)}`);

    const brandModuleService: BrandModuleService = container.resolve(BRAND_MODULE);
    const oldBrand = await brandModuleService.retrieveBrand(input.id);

    const newBrand = await brandModuleService.updateBrands(input);

    logger.success(activityId, `🟢 updateBrandStep: Brand updated: ${newBrand.name}`);

    return new StepResponse(newBrand, oldBrand);
  },
  async function rollBack(oldBrand: Brand, { container }) {
    const brandModuleService: BrandModuleService = container.resolve(BRAND_MODULE);

    await brandModuleService.updateBrands(oldBrand);
  }
);

export const updateBrandWorkflow = createWorkflow("update-brand", function workflow(input: Brand) {
  const brand = updateBrandStep(input);

  return new WorkflowResponse(brand);
});
