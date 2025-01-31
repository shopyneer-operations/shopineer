import { PermissionType } from "../../../types/Role";
import z from "zod";

export const PutAdminRole = z.object({
  name: z.string(),
  permissions: z.array(
    z.object({
      name: z.string(),
      path: z.string(),
      method: z.nativeEnum(PermissionType),
    })
  ),
});
