import { model } from "@medusajs/framework/utils";

export const Abandoned = model.define("abandoned", {
  id: model.id().primaryKey(),
  abandoned_completed_at: model.dateTime().nullable(),
  abandoned_count: model.number().nullable(),
  abandoned_last_interval: model.number().nullable(),
  abandoned_lastdate: model.dateTime().nullable(),
});
