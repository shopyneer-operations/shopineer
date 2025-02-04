import { MedusaService } from "@medusajs/framework/utils";
import { Review } from "./models/review";
import { Response } from "./models/response";

class ReviewModuleService extends MedusaService({ Review, Response }) {}

export default ReviewModuleService;
