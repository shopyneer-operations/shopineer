import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import fp from "lodash/fp";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve("query");

  const { data } = await query.graph({
    entity: "shipping_option",
    fields: ["prices.price_rules.*"],
  });

  const threshold = fp.flow(
    fp.flatMap("prices"),
    fp.flatMap("price_rules"),
    fp.find({ attribute: "item_total" }),
    fp.property("value")
  )(data);

  res.json({ threshold: threshold || null });
};
