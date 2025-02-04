import z from "zod";

export const PostReviewResponse = z.object({
  text: z.string(),
});
