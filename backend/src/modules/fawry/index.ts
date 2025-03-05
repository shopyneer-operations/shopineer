import { ModuleProvider, Modules } from "@medusajs/framework/utils";
import FawryProviderService from "./service";

export default ModuleProvider(Modules.PAYMENT, {
  services: [FawryProviderService],
});
