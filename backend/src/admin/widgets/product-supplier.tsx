import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { Container, Heading, Select, toast } from "@medusajs/ui";
import { sdk } from "../lib/sdk";
import { AdminProduct, DetailWidgetProps } from "@medusajs/framework/types";
import useSWR from "swr";
import React from "react";
import { Supplier } from "../lib/types/supplier";

type AdminroductSupplier = AdminProduct & {
  supplier?: Supplier;
};

type SuppliersResponse = {
  suppliers: Supplier[];
  count: number;
  offset: number;
  limit: number;
};

const ProductSupplierWidget = ({ data: product }: DetailWidgetProps<AdminProduct>) => {
  const { data: suppliers } = useSWR(["suppliers"], () => sdk.client.fetch<SuppliersResponse>("/admin/suppliers"));

  useSWR(["product", product.id], async () => {
    const result = await sdk.admin.product.retrieve(product.id, {
      fields: "+supplier.*",
    });

    setSupplierId((result?.product as AdminroductSupplier)?.supplier?.id);

    return result;
  });

  const [supplierId, setSupplierId] = React.useState<string>();

  async function updateProductSupplier(supplierId: string) {
    const result = await sdk.admin.product.update(product.id, { additional_data: { supplier_id: supplierId } } as any);

    // Update UI
    setSupplierId(supplierId);

    toast.success("تم تحديث المورد", { description: `تم تحديث المورد للمنتج: ${product.handle}` });

    return result;
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">المورد</Heading>
      </div>

      <div className="px-6 py-4">
        <Select onValueChange={updateProductSupplier} value={supplierId}>
          <Select.Trigger>
            <Select.Value placeholder="اختر مورد" />
          </Select.Trigger>
          <Select.Content>
            {suppliers?.suppliers.map((item) => (
              <Select.Item key={item.id} value={item.id}>
                {item.name}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </div>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "product.details.side.after",
});

export default ProductSupplierWidget;
