import { z } from "zod";

export const PostAdminCreateSupplier = z.object({
  name: z.string(),
  contact_person: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});
