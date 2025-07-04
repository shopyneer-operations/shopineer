import {
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
import { MedusaError } from "@medusajs/framework/utils";
import { Permission } from "../modules/role/models/role";
import { PutAdminRole } from "./admin/roles/validators";
import { PostReview } from "./store/reviews/validators";
import { PostReviewResponse } from "./admin/reviews/validators";
import { authenticate } from "@medusajs/medusa";
import { retrieveCartTransformQueryConfig } from "./admin/abandoned-carts/query-config";
import { HttpStatusCode } from "axios";

const GetSuppliersSchema = createFindParams();

const permissions = async (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
  const query = req.scope.resolve("query");

  const userId = (req as any)?.auth_context?.actor_id;
  const {
    data: [user],
  } = await query.graph({
    entity: "user",
    fields: ["*", "role.*"],
    filters: {
      id: [userId],
    },
  });

  const isSuperAdmin = user?.metadata?.is_super_admin;

  console.log("1️⃣", { userId, user, isSuperAdmin });

  if (!user || isSuperAdmin) {
    next();
    return;
  }

  const rolePermissions = (user.role?.permissions || []) as unknown as Permission[];
  const isAllowed = rolePermissions.some(matchPathAndMethod(req));

  console.log("2️⃣", { 'req.baseUrl.replace(//admin/, "")': req.baseUrl.replace(/\/admin/, ""), isAllowed });
  if (isAllowed) {
    next();
    return;
  }

  // Allow access to the route that assigns a super admin role to a user
  if (req.method === "POST" && req.baseUrl.includes("/users")) {
    next();
    return;
  }

  // deny access
  next(new MedusaError(MedusaError.Types.UNAUTHORIZED, `You are not authorized to access ${req.baseUrl}.`));

  function matchPathAndMethod(req: MedusaRequest) {
    const path = req.baseUrl.replace(/\/admin/, "");

    return function match(permission: Permission) {
      const result = new RegExp(permission.path).test(path) && permission.method === req.method;

      return result;
    };
  }
};

export default defineMiddlewares({
  routes: [
    // Store
    {
      matcher: "/store/reviews",
      method: "POST",
      middlewares: [validateAndTransformBody(PostReview as any)],
    },
    {
      matcher: "/store/brands",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(GetSuppliersSchema, {
          defaults: ["id", "name", "description", "image", "products.*"],
          isList: true,
        }),
      ],
    },
    {
      matcher: "/store/promotions",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(GetSuppliersSchema, {
          defaults: [
            "id",
            "code",
            "is_automatic",
            "type",
            "status",
            "created_at",
            "updated_at",
            "deleted_at",
            "*campaign",
            "*campaign.budget",
            "*application_method",
            "*application_method.buy_rules",
            "application_method.buy_rules.values.value",
            "*application_method.target_rules",
            "application_method.target_rules.values.value",
            "rules.id",
            "rules.attribute",
            "rules.operator",
            "rules.values.value",
          ],
          isList: true,
        }),
      ],
    },
    {
      matcher: "/store/customers/me/wishlists",
      method: "GET",
      // middlewares: [authenticate("cusotmer", ["session", "bearer"])],
    },
    {
      matcher: "/store/products-by-brand",
      method: "GET",
    },

    // // Admin
    // {
    //   matcher: "/admin/*",
    //   middlewares: [permissions],
    // },
    {
      matcher: "/admin/reviews/:reviewId/respond",
      method: "POST",
      middlewares: [validateAndTransformBody(PostReviewResponse as any)],
    },
    {
      matcher: "/admin/reviews",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(GetSuppliersSchema, {
          defaults: [
            "id",
            "title",
            "rating",
            "description",
            "created_at",
            "updated_at",
            "approved_at",
            "product.*",
            "customer.*",
            "user.*",
            "response.*",
          ],
          isList: true,
        }),
      ],
    },
    {
      matcher: "/admin/products",
      method: "GET",
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
    {
      matcher: "/admin/abandoned-carts",
      method: "GET",
      middlewares: [validateAndTransformQuery(GetSuppliersSchema, retrieveCartTransformQueryConfig)],
    },
    {
      matcher: "/admin/roles",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(GetSuppliersSchema, {
          defaults: ["id", "name", "permissions", "users.*"],
          isList: true,
        }),
      ],
    },
    {
      matcher: "/admin/roles/:roleId",
      method: "PUT",
      middlewares: [validateAndTransformBody(PutAdminRole as any)],
    },
  ],
  errorHandler(error: MedusaError | any, req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) {
    console.log("4️⃣", error.type === MedusaError.Types.UNAUTHORIZED);

    if (error.type === MedusaError.Types.UNAUTHORIZED) {
      res.status(HttpStatusCode.Ok).json({
        error: error.message,
        timestamp: new Date().toISOString(),
        path: req.baseUrl,
      });
    } else {
      next(error);
    }
  },
});
