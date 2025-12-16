import { AdminProduct, AdminProductTag } from "@medusajs/framework/types";

export type Brand = {
  id: string;
  name: string;
  description?: string;
  image?: string;
  tag_id?: string | null;
  tag?: AdminProductTag;
  products: AdminProduct[];
};
