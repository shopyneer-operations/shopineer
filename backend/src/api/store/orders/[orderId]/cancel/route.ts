/**
 * Store API endpoint to cancel an order by ID
 *
 * This endpoint automatically handles the complete order cancellation process:
 * 1. Retrieves order with all fulfillments
 * 2. Cancels all active fulfillments using cancelOrderFulfillmentWorkflow
 * 3. Cancels the order using cancelOrderWorkflow
 * 4. Cancels any uncaptured payments and refunds any captured payments
 * 5. Optionally notifies the customer about the cancellation
 *
 * @route POST /store/orders/[orderId]/cancel
 * @auth Required - Customer must be authenticated
 * @body {boolean} no_notification - Optional. Whether to notify the customer of the cancelation (default: false)
 * @returns {object} Success message, order details, and count of canceled fulfillments
 *
 * @example
 * POST /store/orders/order_123/cancel
 * Authorization: Bearer <customer_token>
 * Content-Type: application/json
 *
 * {
 *   "no_notification": false
 * }
 *
 * Response:
 * {
 *   "message": "Order and fulfillments canceled successfully",
 *   "order": {...},
 *   "canceledFulfillments": 2
 * }
 */

import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { cancelOrderWorkflow, cancelOrderFulfillmentWorkflow } from "@medusajs/medusa/core-flows";
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

    // First, get the order with its fulfillments
    const query = req.scope.resolve("query");
    const { data: orders } = await query.graph({
      entity: "order",
      fields: ["id", "fulfillments.*"],
      filters: { id: orderId },
    });

    const order = orders[0];
    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Cancel all fulfillments first
    const activeFulfillments = order.fulfillments?.filter((f: any) => f.canceled_at === null) || [];

    for (const fulfillment of activeFulfillments) {
      await cancelOrderFulfillmentWorkflow(req.scope).run({
        input: {
          order_id: orderId,
          fulfillment_id: fulfillment.id,
          no_notification,
          canceled_by: req.auth_context.actor_id,
        },
      });
    }

    // Now cancel the order
    const { result } = await cancelOrderWorkflow(req.scope).run({
      input: {
        order_id: orderId,
        no_notification,
        canceled_by: req.auth_context.actor_id,
      },
    });

    res.json({
      message: "Order and fulfillments canceled successfully",
      order: result,
      canceledFulfillments: activeFulfillments.length,
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
