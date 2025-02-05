import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import TogetherModuleService from "../modules/together/service";
import { TOGETHER_MODULE } from "../modules/together";
import { Modules } from "@medusajs/framework/utils";

export const getTogetherProductsListStep = createStep(
  "get-together-products-list-step",
  async function step({ productId, count = 3 }: { productId: string; count: number }, { container }) {
    const logger = container.resolve("logger");
    const togetherService: TogetherModuleService = container.resolve(TOGETHER_MODULE);
    const productsService = container.resolve(Modules.PRODUCT);

    const activityId = logger.activity(`🔵 getTogetherProductsListStep: Getting together products list`);

    try {
      const allPairs = [
        ...(await togetherService.listTogethers({ product_id_1: [productId] })),
        ...(await togetherService.listTogethers({ product_id_2: [productId] })),
      ];

      logger.progress(activityId, `🔵 getTogetherProductsListStep: Found ${allPairs.length} together pairs`);

      const relatedProducts = allPairs
        .map((pair) => ({
          productId: pair.product_id_1 === productId ? pair.product_id_2 : pair.product_id_1,
          frequency: pair.frequency,
        }))
        .sort((a, b) => b.frequency - a.frequency) // Sort by frequency (desc)
        .slice(0, count) // Get top 'count' products
        .map((item) => item.productId); // Extract only product IDs

      logger.progress(
        activityId,
        `🔵 getTogetherProductsListStep: Found ${relatedProducts.length} most frequent products: ${relatedProducts}`
      );

      const products = await productsService.listProducts({ id: relatedProducts });

      return new StepResponse(products, products);
    } catch (error) {
      console.log(error);
      logger.failure(activityId, `🔴 getTogetherProductsListStep: Failed to get together products list`);
      return StepResponse.permanentFailure("Failed to get together products list");
    }
  }
);

export const getTogetherProductsListWorkflow = createWorkflow(
  "get-together-products-list-workflow",
  function workflow({ productId, count = 3 }: { productId: string; count: number }) {
    const products = getTogetherProductsListStep({ productId, count });

    return new WorkflowResponse(products);
  }
);
