import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { deleteWishlistItemStep } from "./steps/delete-wishlist-item";
import { useQueryGraphStep } from "@medusajs/medusa/core-flows";
import { validateItemInWishlistStep } from "./steps/validate-item-in-wishlist";
import { validateWishlistExistsStep } from "./steps/validate-wishlist-exists";

type DeleteWishlistItemWorkflowInput = {
  wishlist_item_id: string;
  customer_id: string;
};

export const deleteWishlistItemWorkflow = createWorkflow(
  "delete-wishlist-item",
  (input: DeleteWishlistItemWorkflowInput) => {
    const wishlistsResult = (useQueryGraphStep as any)({
      entity: "wishlist",
      fields: ["*", "items.*"],
      filters: {
        customer_id: input.customer_id,
      },
    }) as { data: any[] };
    const { data: wishlists } = wishlistsResult;

    validateWishlistExistsStep({
      wishlists,
    });

    validateItemInWishlistStep({
      wishlist: wishlists[0],
      wishlist_item_id: input.wishlist_item_id,
    });

    deleteWishlistItemStep(input);

    // refetch wishlist
    const updatedWishlistsResult = (useQueryGraphStep as any)({
      entity: "wishlist",
      fields: ["*", "items.*", "items.product_variant.*"],
      filters: {
        id: wishlists[0].id,
      },
    }).config({ name: "refetch-wishlist" }) as { data: any[] };
    const { data: updatedWishlists } = updatedWishlistsResult;

    return new WorkflowResponse({
      wishlist: updatedWishlists[0],
    });
  }
);
