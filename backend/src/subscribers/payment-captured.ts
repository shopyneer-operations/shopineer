import { completeCartWorkflow } from "@medusajs/core-flows";
import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";

export default async function paymentCapturedHandler({ event: { data }, container }: SubscriberArgs<any>) {
  const logger = container.resolve("logger");

  // 1. Get cart

  // 2. Complete cart
  //   const { result } = await completeCartWorkflow(container).run({
  //     input: {
  //       id: "cart_123",
  //     },
  //   });

  //   console.log(result);

  logger.info(`⚡🟢 Payment captured: ${JSON.stringify(data)}`);
}

export const config: SubscriberConfig = {
  event: "payment.captured",
};
