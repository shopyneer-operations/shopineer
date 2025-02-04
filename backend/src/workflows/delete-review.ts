import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import ReviewModuleService from "../modules/review/service";
import { REVIEW_MODULE } from "../modules/review";
import { Review } from "../types/review";

export const deleteReviewStep = createStep(
  "delete-review-step",
  async function step({ id }: { id: string }, { container }) {
    const logger = container.resolve("logger");
    const ReviewModuleService: ReviewModuleService = container.resolve(REVIEW_MODULE);

    const activityId = logger.activity(`🔵 createReviewStep: Creating review`);

    const review = await ReviewModuleService.retrieveReview(id);

    await ReviewModuleService.deleteReviews(id);
    logger.success(activityId, `🔵 deleteReviewStep: Review deleted: ${id}`);

    return new StepResponse(id, review);
  },
  async function rollBack(review: Review, { container }) {
    const ReviewModuleService: ReviewModuleService = container.resolve(REVIEW_MODULE);

    await ReviewModuleService.createReviews(review);
  }
);

export const deleteReviewWorkflow = createWorkflow("delete-review", function workflow({ id }: { id: string }) {
  const review = deleteReviewStep({ id });

  return new WorkflowResponse(review);
});
