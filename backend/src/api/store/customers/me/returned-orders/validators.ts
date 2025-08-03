import { createFindParams, createSelectParams } from "@medusajs/medusa/api/utils/validators";
import { z } from "zod";

export const StoreGetOrderParams = createSelectParams();

export const StoreGetOrdersParamsFields = z.object({
  id: z.union([z.string(), z.array(z.string())]).optional(),
  status: z.union([z.string(), z.array(z.string())]).optional(),
});

export const applyAndAndOrOperators = <T extends z.ZodObject<any>>(schema: T) => {
  return schema.merge(
    z.object({
      $and: z.lazy(() => schema.array()).optional(),
      $or: z.lazy(() => schema.array()).optional(),
    })
  );
};

export const StoreGetOrdersParams = createFindParams({
  offset: 0,
  limit: 50,
})
  .merge(StoreGetOrdersParamsFields as any)
  .merge(applyAndAndOrOperators(StoreGetOrdersParamsFields as any) as any);
