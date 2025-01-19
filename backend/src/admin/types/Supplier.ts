import { AdminProduct } from "@medusajs/types";

export type Supplier = {
  id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  products: AdminProduct[];
};
