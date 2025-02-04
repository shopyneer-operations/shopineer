import { Module } from "@medusajs/framework/utils";
import ReviewModuleService from "./service";

export const REVIEW_MODULE = "review";

const ReviewModule = Module(REVIEW_MODULE, {
  service: ReviewModuleService,
});

export default ReviewModule;
