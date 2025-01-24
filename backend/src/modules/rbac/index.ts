import { Module } from "@medusajs/framework/utils";
import RbacModuleService from "./service";

export const RBAC = "rbac";

const RbacModule = Module(RBAC, {
  service: RbacModuleService,
});

export default RbacModule;
