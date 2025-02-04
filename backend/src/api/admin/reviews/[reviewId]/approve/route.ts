import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { approveReviewWorkflow } from "../../../../../workflows/approve-review";

export const PUT = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const { result: review } = await approveReviewWorkflow(req.scope).run({
    input: { review_id: req.params.reviewId, user_id: req.auth_context.actor_id },
  });

  res.json({ review });
};
