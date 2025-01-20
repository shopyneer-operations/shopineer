import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { Container, Heading, Select, toast } from "@medusajs/ui";
import { sdk } from "../lib/sdk";
import { AdminProduct, DetailWidgetProps } from "@medusajs/types";
// import useSWR from "swr";
// import React from "react";
// import { Supplier } from "../types/Supplier";

type AdminroductSupplier = AdminProduct & {
  supplier?: any;
};

type SuppliersResponse = {
  suppliers: any[];
  count: number;
  offset: number;
  limit: number;
};

const ProductSupplierWidget = ({ data: product }: DetailWidgetProps<AdminProduct>) => {
  //   const { data: suppliers } = useSWR(["suppliers"], () => sdk.client.fetch<SuppliersResponse>("/admin/suppliers"));

  //   useSWR(["product", product.id], async () => {
  //     const result = await sdk.admin.product.retrieve(product.id, {
  //       fields: "+supplier.*",
  //     });

  //     setSupplierId((result?.product as AdminroductSupplier)?.supplier?.id);

  //     return result;
  //   });

  //   const [supplierId, setSupplierId] = React.useState<string>();

  //   async function updateProductSupplier(supplierId: string) {
  //     const result = await sdk.admin.product.update(product.id, { additional_data: { supplier_id: supplierId } } as any);

  //     // Update UI
  //     setSupplierId(supplierId);

  //     toast.success("Supplier updated", { description: `Successfully, updated supplier for product: ${product.handle}` });

  //     return result;
  //   }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Supplier</Heading>
        </div>
      </div>

      {/* <div className="px-6 py-4">
        <Select onValueChange={updateProductSupplier} value={supplierId}>
          <Select.Trigger>
            <Select.Value placeholder="Select a supplier" />
          </Select.Trigger>
          <Select.Content>
            {suppliers?.suppliers.map((item) => (
              <Select.Item key={item.id} value={item.id}>
                {item.name}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </div> */}
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "product.details.side.after",
});

export default ProductSupplierWidget;
