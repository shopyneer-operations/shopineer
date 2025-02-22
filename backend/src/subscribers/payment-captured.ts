import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";

export default async function paymentCapturedHandler({ event: { data }, container }: SubscriberArgs<any>) {
  const logger = container.resolve("logger");
  logger.info(`⚡🟢 Payment captured: ${JSON.stringify(data)}`);
}

export const config: SubscriberConfig = {
  event: "payment.captured",
};
