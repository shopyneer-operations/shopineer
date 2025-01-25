import { Module } from "@medusajs/framework/utils";
import RbacModuleService from "./service";

export const RBAC_MODULE = "rbac";

const RbacModule = Module(RBAC_MODULE, {
  service: RbacModuleService,
});

export default RbacModule;
