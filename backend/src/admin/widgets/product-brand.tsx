import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { Container, Heading, Select, toast } from "@medusajs/ui";
import { sdk } from "../lib/sdk";
import { AdminProduct } from "@medusajs/framework/types";
import useSWR from "swr";
import React from "react";
import { Brand } from "../lib/types/brand";

type AdminroductBrand = AdminProduct & {
  brand?: Brand;
};

type BrandsResponse = {
  brands: Brand[];
  count: number;
  offset: number;
  limit: number;
};

const ProductBrandWidget = ({ data: product }: any) => {
  const { data: brands } = useSWR(["brands"], async () => {
    const result = await sdk.client.fetch<BrandsResponse>("/admin/brands");

    return result;
  });

  useSWR(["product", product.id], async () => {
    const result = await sdk.admin.product.retrieve(product.id, {
      fields: "+brand.*",
    });

    setBrandId((result?.product as AdminroductBrand)?.brand?.id);

    return result;
  });

  const [brandId, setBrandId] = React.useState<string>();

  async function updateProductBrand(brandId: string) {
    const result = await sdk.admin.product.update(product.id, { additional_data: { brand_id: brandId } } as any);

    // Update UI
    setBrandId(brandId);

    toast.success("Brand updated", { description: `Successfully, updated brand for product: ${product.handle}` });

    return result;
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Brand</Heading>
        </div>
      </div>

      <div className="px-6 py-4">
        <Select onValueChange={updateProductBrand} value={brandId}>
          <Select.Trigger>
            <Select.Value placeholder="Select a brand" />
          </Select.Trigger>
          <Select.Content>
            {brands?.brands.map((item) => (
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

export default ProductBrandWidget;
