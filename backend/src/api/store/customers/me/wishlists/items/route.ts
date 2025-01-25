import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Logger } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import WishlistModuleService from "../../../../../../modules/wishlist/service";
import { WISHLIST_MODULE } from "../../../../../../modules/wishlist";
import assignWishlistToCustomerWorkflow from "../../../../../../workflows/assign-wishlist-to-customer";
import { HttpStatusCode } from "axios";

type RequestType = {
  quantity: number;
  productVariantId: string;
  productId: string;
};

export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const logger: Logger = req.scope.resolve("logger");
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const activityId = logger.activity(
    `🔵 wishlist-add: Adding item to wishlist for customer ID: ${req.auth_context.actor_id}`
  );

  // 1. Get customer with wishlist data
  const { data: customerWithWishlist } = await query.graph({
    entity: "customer",
    fields: ["wishlist.*"],
    filters: {
      id: [req.auth_context.actor_id],
    },
  });
  if (customerWithWishlist.length == 0) {
    logger.failure(activityId, `🔴 wishlist-add: Customer with ID: ${req.auth_context.actor_id} not found`);
    return res.status(HttpStatusCode.NotFound).json({ message: "Customer not found" });
  }

  const wishlistModuleService: WishlistModuleService = req.scope.resolve(WISHLIST_MODULE);

  // 2. Get wishlist ID
  const wishlistId = await (async function getWishlistId() {
    if (customerWithWishlist[0].wishlist) {
      return customerWithWishlist[0].wishlist.id;
    }

    logger.progress(activityId, `🔵 wishlist-add: Customer with ID: ${req.auth_context.actor_id} has no wishlist`);

    const wishlistId = await wishlistModuleService.create();

    await assignWishlistToCustomerWorkflow(req.scope).run({
      input: {
        customerId: customerWithWishlist[0].id,
        wishlistId,
      },
    });

    logger.progress(
      activityId,
      `🔵 wishlist-add: Customer with ID: ${req.auth_context.actor_id} has been assigned wishlist with ID: ${wishlistId}`
    );
  })();

  // 3. Add item to wishlist
  logger.progress(activityId, `🔵 wishlist-add: Adding item to wishlist with ID: ${wishlistId}`);
  const rawRequest = req as unknown as any;
  await wishlistModuleService.addOrUpdateItem(
    wishlistId,
    (rawRequest.body as RequestType).productId,
    (rawRequest.body as RequestType).productVariantId,
    (rawRequest.body as RequestType).quantity
  );
  const updatedWishlist = await wishlistModuleService.retrieveWishlist(wishlistId, {
    relations: ["items"],
  });

  logger.success(activityId, `🟢 wishlist-add: Item added to wishlist with ID: ${wishlistId}`);
  return res.json(updatedWishlist);
};

export const DELETE = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const rawRequest = req as unknown as any;
  const productId = rawRequest.query.productId;
  const productVariantId = rawRequest.query.productVariantId;

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const logger: Logger = req.scope.resolve("logger");

  const activityId = logger.activity(
    `🔵 wishlist-remove: Removing item from wishlist for customer ID: ${req.auth_context.actor_id}`
  );

  // 1. Get customer with wishlist data
  const { data: customerWithWishlist } = await query.graph({
    entity: "customer",
    fields: ["wishlist.*"],
    filters: {
      id: [req.auth_context.actor_id],
    },
  });

  if (customerWithWishlist.length == 0) {
    logger.failure(activityId, `🔴 wishlist-remove: Customer with ID: ${req.auth_context.actor_id} not found`);
    return res.status(HttpStatusCode.NotFound).json({ message: "Customer not found" });
  }

  if (!customerWithWishlist[0].wishlist) {
    logger.failure(activityId, `🔴 wishlist-remove: Customer with ID: ${req.auth_context.actor_id} has no wishlist`);
    return res.status(HttpStatusCode.NotFound).json({ message: "Customer has no wishlist" });
  }

  const wishlistModuleService: WishlistModuleService = req.scope.resolve(WISHLIST_MODULE);

  // 2. Remove item from wishlist
  await wishlistModuleService.deleteItem(customerWithWishlist[0].wishlist.id, productId, productVariantId);
  const updatedWishlist = await wishlistModuleService.retrieveWishlist(customerWithWishlist[0].wishlist.id, {
    relations: ["items"],
  });
  logger.success(
    activityId,
    `🟢 wishlist-remove: Item removed from wishlist with ID: ${customerWithWishlist[0].wishlist.id}`
  );
  return res.json(updatedWishlist);
};
