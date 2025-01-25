import { MedusaService } from "@medusajs/framework/utils";
import { Role } from "./models/role";

class RoleModuleService extends MedusaService({ Role }) {}

export default RoleModuleService;
