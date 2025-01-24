import { MedusaService } from "@medusajs/framework/utils";
import { Role } from "./models/role";
import { Permission } from "./models/permission";

class RbacModuleService extends MedusaService({ Role, Permission }) {}

export default RbacModuleService;
