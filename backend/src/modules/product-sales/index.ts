import { Module } from "@medusajs/framework/utils";
import ProductSalesModuleService from "./service";

export const PRODUCT_SALES_MODULE = "product_sales";

const ProductSalesModule = Module(PRODUCT_SALES_MODULE, {
  service: ProductSalesModuleService,
});

export default ProductSalesModule;
