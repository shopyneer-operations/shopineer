import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { Container, Heading, Select, toast } from "@medusajs/ui";
import { sdk } from "../lib/sdk";
import { AdminProduct, AdminProductTag } from "@medusajs/framework/types";
import useSWR from "swr";
import React from "react";
import { Brand } from "../lib/types/brand";

type BrandsResponse = {
  brands: Brand[];
  count: number;
  offset: number;
  limit: number;
};

const ProductBrandWidget = ({ data: product }: any) => {
  // Fetch brands that have tag_id set
  const { data: brands } = useSWR(["brands"], async () => {
    const result = await sdk.client.fetch<BrandsResponse>("/admin/brands");
    return result;
  });

  // Fetch current product tags
  const { data: productData, mutate: mutateProduct } = useSWR(["product", product.id], async () => {
    const result = await sdk.admin.product.retrieve(product.id, {
      fields: "+tags.*",
    });
    return result;
  });

  // Get brands that have a tag_id assigned (filter brands with tags)
  const brandsWithTags = React.useMemo(() => {
    return brands?.brands.filter((brand) => brand.tag_id) || [];
  }, [brands]);

  // Get the current product's tag that matches a brand's tag
  const currentBrandTagId = React.useMemo(() => {
    const productTags = (productData?.product as AdminProduct & { tags?: AdminProductTag[] })?.tags || [];
    const brandTagIds = brandsWithTags.map((b) => b.tag_id);
    const matchingTag = productTags.find((tag) => brandTagIds.includes(tag.id));
    return matchingTag?.id;
  }, [productData, brandsWithTags]);

  const [selectedTagId, setSelectedTagId] = React.useState<string | undefined>();

  // Sync selectedTagId with currentBrandTagId
  React.useEffect(() => {
    if (currentBrandTagId) {
      setSelectedTagId(currentBrandTagId);
    }
  }, [currentBrandTagId]);

  async function updateProductTag(tagId: string) {
    try {
      // Get current product tags
      const productTags = (productData?.product as AdminProduct & { tags?: AdminProductTag[] })?.tags || [];
      const brandTagIds = brandsWithTags.map((b) => b.tag_id);

      // Remove any existing brand tags and add the new one
      const filteredTagIds = productTags.filter((tag) => !brandTagIds.includes(tag.id)).map((tag) => tag.id);

      const newTagIds = [...filteredTagIds, tagId];

      await sdk.admin.product.update(product.id, {
        tags: newTagIds.map((tagId) => ({ id: tagId })),
      });

      // Update UI
      setSelectedTagId(tagId);
      mutateProduct();

      // Find the brand name for the toast message
      const brand = brandsWithTags.find((b) => b.tag_id === tagId);
      toast.success("تم تحديث العلامة التجارية", {
        description: `تم تحديث العلامة التجارية للمنتج: ${brand?.name || tagId}`,
      });
    } catch (error: any) {
      toast.error("فشل تحديث العلامة التجارية", { description: error.message });
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">العلامة التجارية</Heading>
        </div>
      </div>

      <div className="px-6 py-4">
        <Select onValueChange={updateProductTag} value={selectedTagId}>
          <Select.Trigger>
            <Select.Value placeholder="اختر علامة تجارية" />
          </Select.Trigger>
          <Select.Content>
            {brandsWithTags.map((brand) => (
              <Select.Item key={brand.tag_id!} value={brand.tag_id!}>
                {brand.name}
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
