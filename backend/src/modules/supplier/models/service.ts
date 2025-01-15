import { MedusaService } from "@medusajs/framework/utils";
import { Supplier } from "./supplier";

class SupplierModuleService extends MedusaService({
  Supplier,
}) {}

export default SupplierModuleService;
