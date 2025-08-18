/**
 * Store API endpoint to cancel an order by ID
 *
 * This endpoint uses the cancelOrderWorkflow from Medusa core-flows to:
 * - Cancel an order if it doesn't have any fulfillments, or if all fulfillments are canceled
 * - Cancel any uncaptured payments and refund any captured payments
 * - Optionally notify the customer about the cancellation
 *
 * @route POST /store/orders/[orderId]/cancel
 * @auth Required - Customer must be authenticated
 * @body {boolean} no_notification - Optional. Whether to notify the customer of the cancelation (default: false)
 * @returns {object} Success message and order details
 *
 * @example
 * POST /store/orders/order_123/cancel
 * Authorization: Bearer <customer_token>
 * Content-Type: application/json
 *
 * {
 *   "no_notification": false
 * }
 */

import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { cancelOrderWorkflow } from "@medusajs/medusa/core-flows";
import { PostOrderCancelReqType } from "./validators";

export const POST = async (req: AuthenticatedMedusaRequest<PostOrderCancelReqType>, res: MedusaResponse) => {
  const { orderId } = req.params;
  const { no_notification = false } = req.validatedBody || {};

  try {
    // Validate that the user is authenticated
    if (!req.auth_context?.actor_id) {
      return res.status(401).json({
        message: "Authentication required to cancel order",
      });
    }

    // Validate that orderId is provided
    if (!orderId) {
      return res.status(400).json({
        message: "Order ID is required",
      });
    }

    const { result } = await cancelOrderWorkflow(req.scope).run({
      input: {
        order_id: orderId,
        no_notification,
        canceled_by: req.auth_context.actor_id, // User who is canceling the order
      },
    });

    res.json({
      message: "Order canceled successfully",
      order: result,
    });
  } catch (error) {
    // Handle specific workflow errors
    if (error.message.includes("not found")) {
      return res.status(404).json({
        message: "Order not found",
        error: error.message,
      });
    }

    if (error.message.includes("cannot be canceled")) {
      return res.status(400).json({
        message: "Order cannot be canceled",
        error: error.message,
      });
    }

    // Generic error handling
    res.status(400).json({
      message: "Failed to cancel order",
      error: error.message,
    });
  }
};
