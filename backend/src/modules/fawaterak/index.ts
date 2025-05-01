import { ModuleProvider, Modules } from "@medusajs/framework/utils";
import FawaterakProviderService from "./service";

export default ModuleProvider(Modules.PAYMENT, {
  services: [FawaterakProviderService],
});
