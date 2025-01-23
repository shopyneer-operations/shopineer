import { MedusaService } from "@medusajs/framework/utils";
import { Update } from "./models/update";

class UpdateService extends MedusaService({
  Update,
}) {}

export default UpdateService;
