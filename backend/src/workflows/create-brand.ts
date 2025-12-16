import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { createProductTagsWorkflow } from "@medusajs/medusa/core-flows";
import { BRAND_MODULE } from "../modules/brand";
import BrandModuleService from "../modules/brand/service";
import { randomUUID } from "crypto";

export type CreateBrandStepInput = {
  name: string;
  description?: string;
  image?: string;
};

export const createBrandStep = createStep(
  "create-brand-step",
  async function step(input: CreateBrandStepInput & { tag_id?: string }, { container }) {
    const logger = container.resolve("logger");
    const activityId = logger.activity(`🔵 createBrandStep: Creating brand: ${input.name}`);

    const shortUuid = randomUUID().substring(0, 8);
    const tagName = `${input.name}-${shortUuid}`;

    const { result } = await createProductTagsWorkflow(container).run({
      input: {
        product_tags: [{ value: tagName }],
      },
    });

    console.log("🔵🔵🔵", { result });

    logger.progress(activityId, `🔵 createBrandStep: Product tag created: ${result[0].id}`);

    const brandModuleService: BrandModuleService = container.resolve(BRAND_MODULE);
    const brand = await brandModuleService.createBrands({ ...input, tag_id: result[0].id });

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
  description?: string;
  image?: string;
};

export const createBrandWorkflow = createWorkflow("create-brand", function workflow(input: CreateBrandWorkflowInput) {
  // Create the brand with the tag_id
  const brand = createBrandStep(input);

  return new WorkflowResponse(brand);
});
