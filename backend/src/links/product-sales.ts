import { defineLink } from "@medusajs/framework/utils";
import ProductModule from "@medusajs/medusa/product";
import SalesModule from "../modules/sales";

export default defineLink(ProductModule.linkable.product, {
  linkable: SalesModule.linkable.sales,
  deleteCascade: true,
});
