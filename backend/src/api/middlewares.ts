import {
  AuthenticatedMedusaRequest,
  defineMiddlewares,
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework/http";
import { PostAdminCreateSupplier } from "./admin/suppliers/validators";
import z from "zod";
import { createFindParams } from "@medusajs/medusa/api/utils/validators";
import { PostAdminCreateBrand } from "./admin/brands/validators";
import brand from "src/modules/brand";
import fp from "lodash/fp";

import { Modules } from "@medusajs/framework/utils";
import { Permission } from ".medusa/types/remote-query-entry-points";
import { HttpStatusCode } from "axios";

const GetSuppliersSchema = createFindParams();

export const permissions = async (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
  // if (!req.user || !req.user.userId) {
  //   next();
  //   return;
  // }
  // retrieve currently logged-in user
  // const loggedInUser = await userService.retrieveUser(req.user.userId, {
  //   select: ["id"],
  //   relations: ["roles"],
  // });
  const userService = req.scope.resolve(Modules.USER);
  const query = req.scope.resolve("query");

  const userId = req.session?.auth_context?.actor_id;
  const {
    data: [user],
  } = await query.graph({
    entity: "user",
    fields: ["*", "role.*", "role.permissions.*"],
    filters: {
      id: [userId],
    },
  });

  console.log("🍉", user, req.path);

  const isSuperAdmin = !user.role;
  if (isSuperAdmin) {
    next();
    return;
  }

  const isAllowed = user.role.permissions.some(fp.property(`metadata.${req.path}`));

  // const isAllowedOld = user.role?.permissions.some((permission) => {
  //   const metadataKey = Object.keys(permission.metadata).find((key) => key === req.path);
  //   if (!metadataKey) {
  //     return false;
  //   }

  //   // boolean value
  //   return permission.metadata[metadataKey];
  // });

  if (isAllowed) {
    next();
    return;
  }

  // deny access
  res.sendStatus(HttpStatusCode.Unauthorized);
};

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/*",
      middlewares: [permissions],
    },
    {
      matcher: "/admin/products",
      method: "POST",
      additionalDataValidator: {
        supplier_id: z.string().optional() as any,
        brand_id: z.string().optional() as any,
      },
    },
    {
      matcher: "/admin/suppliers",
      method: "POST",
      middlewares: [validateAndTransformBody(PostAdminCreateSupplier as any)],
    },
    {
      matcher: "/admin/suppliers/:id",
      method: "PUT",
      middlewares: [validateAndTransformBody(PostAdminCreateSupplier as any)],
    },
    {
      matcher: "/admin/suppliers",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(GetSuppliersSchema, {
          defaults: ["id", "name", "contact_person", "email", "phone", "products.*"],
          isList: true,
        }),
      ],
    },
    {
      matcher: "/admin/brands",
      method: "POST",
      middlewares: [validateAndTransformBody(PostAdminCreateBrand as any)],
    },
    {
      matcher: "/admin/brands/:id",
      method: "PUT",
      middlewares: [validateAndTransformBody(PostAdminCreateBrand as any)],
    },
    {
      matcher: "/admin/brands",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(GetSuppliersSchema, {
          defaults: ["id", "name", "description", "image", "products.*"],
          isList: true,
        }),
      ],
    },
  ],
});
