import { defineLink } from "@medusajs/framework/utils";
import ProductModle from "@medusajs/medusa/product";
import SupplierModule from "../modules/supplier";

export default defineLink({ linkable: ProductModle.linkable.product, isList: true }, SupplierModule.linkable.supplier);
