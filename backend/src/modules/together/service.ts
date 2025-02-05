import { MedusaService } from "@medusajs/framework/utils";
import { Together } from "./models/together";

class TogetherModuleService extends MedusaService({ Together }) {}

export default TogetherModuleService;
