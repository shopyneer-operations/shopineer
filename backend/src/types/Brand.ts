import { AdminProduct } from "@medusajs/framework/types";

export type Brand = {
  id: string;
  name: string;
  description?: string;
  image?: string;
  products?: AdminProduct[];
};
