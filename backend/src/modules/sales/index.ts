import { Module } from "@medusajs/framework/utils";
import SalesModuleService from "./service";

export const SALES = "sales";

const SalesModule = Module(SALES, {
  service: SalesModuleService,
});

export default SalesModule;
