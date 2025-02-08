import { Module } from "@medusajs/framework/utils";
import SalesModuleService from "./service";

export const SALES_MODULE = "sales";

const SalesModule = Module(SALES_MODULE, {
  service: SalesModuleService,
});

export default SalesModule;
