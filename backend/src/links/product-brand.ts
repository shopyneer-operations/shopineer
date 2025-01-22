import { defineLink } from "@medusajs/framework/utils";
import ProductModle from "@medusajs/medusa/product";
import BrandModule from "../modules/brand";

export default defineLink({ linkable: ProductModle.linkable.product, isList: true }, BrandModule.linkable.brand);
