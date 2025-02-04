import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ReviewDto } from "../../../types/review";
import { createReviewWorkflow } from "../../../workflows/create-review";

export const POST = async (req: AuthenticatedMedusaRequest<ReviewDto>, res: MedusaResponse) => {
  const { result } = await createReviewWorkflow(req.scope).run({ input: req.validatedBody });

  res.json(result);
};
