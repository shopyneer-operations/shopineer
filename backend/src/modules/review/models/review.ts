import { model } from "@medusajs/framework/utils";
import { Response } from "./response";

export const Review = model.define("review", {
  id: model.id({ prefix: "review" }).primaryKey(),
  rating: model.number(),
  title: model.text(),
  description: model.text().nullable(),
  approved_at: model.dateTime().nullable(),

  response: model.hasOne(() => Response, {
    mappedBy: "review",
  }),
});
