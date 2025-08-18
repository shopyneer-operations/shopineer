import { z } from "zod";

export const PostOrderCancelReq = z
  .object({
    no_notification: z.boolean().optional().default(false),
  })
  .strict();

export type PostOrderCancelReqType = z.infer<typeof PostOrderCancelReq>;
