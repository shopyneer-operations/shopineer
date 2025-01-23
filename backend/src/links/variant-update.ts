import { defineLink } from "@medusajs/framework/utils";
import ProductModle from "@medusajs/medusa/product";
import SupplierModule from "../modules/supplier";
import UpdateModule from "src/modules/update";

export default defineLink(
  { linkable: ProductModle.linkable.productVariant },
  { linkable: UpdateModule.linkable.update, isList: true }
);
