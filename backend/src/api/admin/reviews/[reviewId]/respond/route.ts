import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { createResponseWorkflow } from "../../../../../workflows/create-response";

export const POST = async (req: AuthenticatedMedusaRequest<{ text: string }>, res: MedusaResponse) => {
  const { result } = await createResponseWorkflow(req.scope).run({
    input: { review_id: req.params.reviewId, user_id: req.auth_context.actor_id, text: req.validatedBody.text },
  });

  return res.json({ response: result });
};
