import { Module } from "@medusajs/framework/utils";
import RoleModuleService from "./service";

export const ROLE_MODULE = "role";

const RoleModule = Module(ROLE_MODULE, {
  service: RoleModuleService,
});

export default RoleModule;
