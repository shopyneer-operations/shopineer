import z from "zod";

export const PostReview = z.object({
  product_id: z.string(),
  customer_id: z.string().optional(),
  rating: z.number().max(5).min(1),
  title: z.string(),
  description: z.string().optional(),
  image: z.string().optional(),
});
