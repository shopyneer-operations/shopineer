import { Module } from "@medusajs/framework/utils";
import UpdateService from "./service";

export const UPDATE = "update";

const UpdateModule = Module(UPDATE, {
  service: UpdateService,
});

export default UpdateModule;
