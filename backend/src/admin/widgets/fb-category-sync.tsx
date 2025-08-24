import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { Container, Heading, Switch, Label } from "@medusajs/ui";
import { AdminStore, DetailWidgetProps } from "@medusajs/framework/types";
import useSWR from "swr";
import { sdk } from "../lib/sdk";

// The widget
const FBCatalogSyncWidget = ({ data }: DetailWidgetProps<AdminStore>) => {
  const { data: store, mutate } = useSWR(["store", data.id], async () => {
    const result = await sdk.admin.store.retrieve(data.id);
    return result.store;
  });

  const handleSyncToggle = async (checked: boolean) => {
    try {
      await sdk.admin.store.update(data.id, {
        metadata: {
          ...store?.metadata,
          sync_fb_catalog: checked,
        },
      });
      mutate();
    } catch (error) {
      console.error("فشل تحديث حالة الاتصال بمنتجات الفيسبوك:", error);
    }
  };

  return (
    <Container className="flex flex-col divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">الاتصال بمنتجات الفيسبوك</Heading>
      </div>

      <div className="flex items-center gap-x-3 px-6 py-4">
        <Switch id="fb-sync" checked={store?.metadata?.sync_fb_catalog || false} onCheckedChange={handleSyncToggle} />
        <Label htmlFor="fb-sync" className="text-ui-fg-subtle">
          تمكين الاتصال بمنتجات الفيسبوك
        </Label>
      </div>
    </Container>
  );
};

// The widget's configurations
export const config = defineWidgetConfig({
  zone: "store.details.after",
});

export default FBCatalogSyncWidget;
