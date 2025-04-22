import { MedusaError } from "@medusajs/framework/utils";
import { completeCartWorkflow } from "@medusajs/medusa/core-flows";

completeCartWorkflow.hooks.validate(async ({ input, cart }, { container }) => {
  const logger = container.resolve("logger");

  const customerModuleService = container.resolve("customer");

  const customer = cart.customer_id ? await customerModuleService.retrieveCustomer(cart.customer_id) : undefined;

  logger.info(`🔵 Validating customer ${customer?.email}`);

  // Check if customer is banned
  if (customer && customer.metadata?.is_banned === true) {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, `Customer ${customer.email} is banned from making purchases`);
  }
});
