import { model } from "@medusajs/framework/utils";
import { Review } from "./review";

export const Response = model.define("response", {
  id: model.id().primaryKey(),
  text: model.text(),

  review: model.belongsTo(() => Review, {
    mappedBy: "response",
  }),
});
