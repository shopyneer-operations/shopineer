import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { BRAND_MODULE } from "../modules/brand";
import BrandModuleService from "../modules/brand/service";

export type CreateBrandStepInput = {
  name: string;
  description?: string;
  image?: string;
};

export const createBrandStep = createStep(
  "create-brand-step",
  async function step(input: CreateBrandStepInput, { container }) {
    const logger = container.resolve("logger");
    const activityId = logger.activity(`🔵 createBrandStep: Creating brand: ${input.name}`);

    const brandModuleService: BrandModuleService = container.resolve(BRAND_MODULE);
    const brand = await brandModuleService.createBrands(input);

    logger.success(activityId, `🟢 createBrandStep: Brand created: ${input.name}`);

    return new StepResponse(brand, brand.id);
  },
  async function rollBack(id: string, { container }) {
    const brandModuleService: BrandModuleService = container.resolve(BRAND_MODULE);

    await brandModuleService.deleteBrands(id);
  }
);

export type CreateBrandWorkflowInput = {
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
};

export const createBrandWorkflow = createWorkflow("create-brand", function workflow(input: CreateBrandWorkflowInput) {
  const brand = createBrandStep(input);

  return new WorkflowResponse(brand);
});
