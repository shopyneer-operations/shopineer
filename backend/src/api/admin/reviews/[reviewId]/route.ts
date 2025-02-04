import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { deleteReviewWorkflow } from "../../../../workflows/delete-review";

export const DELETE = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const { result: reviewId } = await deleteReviewWorkflow(req.scope).run({ input: { id: req.params.reviewId } });

  res.json({ reviewId });
};
