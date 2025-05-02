import { Module } from "@medusajs/framework/utils";
import FacebookModuleService from "./service";

export const FACEBOOK_MODULE = "facebook";

const FacebookModule = Module(FACEBOOK_MODULE, {
  service: FacebookModuleService,
});

export default FacebookModule;
