import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { AdminStore, DetailWidgetProps } from "@medusajs/framework/types";
import { Button, Container, Drawer, Heading, toast, Toaster, Input, Label } from "@medusajs/ui";
import { ActionMenu } from "../components/action-menu";
import { PencilSquare } from "@medusajs/icons";
import { useState, useEffect } from "react";
import { FormProvider, useForm, Controller } from "react-hook-form";
import * as zod from "zod";
import { sdk } from "../lib/sdk";
import useSWR from "swr";

const schema = zod.object({
  // Product Tags
  local_tag_id: zod.string().optional(),
  best_seller_tag_id: zod.string().optional(),
  high_rated_tag_id: zod.string().optional(),
  new_arrival_tag_id: zod.string().optional(),
  winter_tag_id: zod.string().optional(),
  sheglam_tag_id: zod.string().optional(),
  powder_tag_id: zod.string().optional(),
  new_year_offers_tag_id: zod.string().optional(),
  beauty_essentials_tag_id: zod.string().optional(),
  all_you_want_tag_id: zod.string().optional(),
  recommended_tag_id: zod.string().optional(),
  flash_sale_tag_id: zod.string().optional(),

  // Categories
  make_up_category_id: zod.string().optional(),

  // Brands
  sheglam_brand_id: zod.string().optional(),
});

// Field configurations for better maintainability
const tagFields = [
  { name: "local_tag_id", label: "Local" },
  { name: "best_seller_tag_id", label: "Best Seller" },
  { name: "high_rated_tag_id", label: "High Rated" },
  { name: "new_arrival_tag_id", label: "New Arrival" },
  { name: "winter_tag_id", label: "Winter" },
  { name: "powder_tag_id", label: "Powder" },
  { name: "new_year_offers_tag_id", label: "New Year Offers" },
  { name: "beauty_essentials_tag_id", label: "Beauty Essentials" },
  { name: "all_you_want_tag_id", label: "All You Want" },
  { name: "recommended_tag_id", label: "Recommended" },
  { name: "flash_sale_tag_id", label: "Flash Sale" },
];

const categoryFields = [{ name: "make_up_category_id", label: "Make Up" }];

const brandFields = [{ name: "sheglam_brand_id", label: "Sheglam" }];

export const EditForm = ({
  open,
  onOpenChange,
  store,
  onSubmitSuccess,
}: {
  open: boolean;
  onOpenChange(open: boolean): void;
  store: AdminStore;
  onSubmitSuccess?: () => void;
}) => {
  const form = useForm<zod.infer<typeof schema>>({
    defaultValues: {
      local_tag_id: "",
      best_seller_tag_id: "",
      high_rated_tag_id: "",
      new_arrival_tag_id: "",
      winter_tag_id: "",
      sheglam_tag_id: "",
      powder_tag_id: "",
      new_year_offers_tag_id: "",
      beauty_essentials_tag_id: "",
      all_you_want_tag_id: "",
      recommended_tag_id: "",
      flash_sale_tag_id: "",
      make_up_category_id: "",
      sheglam_brand_id: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      const result = await sdk.admin.store.update(store.id, {
        metadata: {
          ...store.metadata,
          ...data,
        },
      });

      // Show success toast
      toast.success("تم تحديث إعدادات المنتجات بنجاح", {
        description: "تم حفظ جميع المعرفات بنجاح",
      });

      onOpenChange(false);
      if (onSubmitSuccess) onSubmitSuccess();
      return result;
    } catch (error: any) {
      toast.error("فشل تحديث إعدادات المنتجات", { description: error.message });
    }
  });

  // Initialize form with existing values
  useEffect(() => {
    const metadata = store.metadata || {};
    [...tagFields, ...categoryFields, ...brandFields].forEach(({ name }) => {
      form.setValue(name as keyof zod.infer<typeof schema>, metadata[name] || "");
    });
  }, [store.metadata, form]);

  const renderField = (field: { name: string; label: string }, placeholder: string) => (
    <div key={field.name} className="space-y-2">
      <Label size="small" weight="plus">
        {field.label}
      </Label>
      <Controller
        control={form.control}
        name={field.name as keyof zod.infer<typeof schema>}
        render={({ field: controllerField }) => (
          <Input
            placeholder={placeholder}
            value={controllerField.value || ""}
            onChange={controllerField.onChange}
            className="w-full"
          />
        )}
      />
    </div>
  );

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content>
        <FormProvider {...form}>
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
            <Drawer.Header>
              <Heading className="capitalize">إعدادات المنتجات</Heading>
            </Drawer.Header>
            <Drawer.Body className="flex max-w-full flex-1 flex-col gap-y-8 overflow-y-auto">
              <div className="w-full space-y-8">
                {/* Product Tags Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-ui-fg-base">علامات المنتجات</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tagFields.map((field) => renderField(field, "Enter tag ID"))}
                  </div>
                </div>

                {/* Categories Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-ui-fg-base">التصنيفات</h3>

                  <div className="space-y-2">
                    {categoryFields.map((field) => renderField(field, "Enter category ID"))}
                  </div>
                </div>

                {/* Brands Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-ui-fg-base">العلامات التجارية</h3>

                  <div className="space-y-2">{brandFields.map((field) => renderField(field, "Enter brand ID"))}</div>
                </div>
              </div>
            </Drawer.Body>
            <Drawer.Footer>
              <div className="flex items-center justify-end gap-x-2">
                <Drawer.Close asChild>
                  <Button size="small" variant="secondary">
                    إلغاء
                  </Button>
                </Drawer.Close>
                <Button size="small" type="submit">
                  حفظ
                </Button>
              </div>
            </Drawer.Footer>
          </form>
        </FormProvider>
      </Drawer.Content>
    </Drawer>
  );
};

const StoreProductSettingsWidget = ({ data }: DetailWidgetProps<AdminStore>) => {
  const { data: store, mutate } = useSWR(["store", data.id], async () => {
    const result = await sdk.admin.store.retrieve(data.id);
    return result.store;
  });

  const [isOpen, setIsOpen] = useState(false);

  const metadata = store?.metadata || {};

  // Count filled fields
  const filledTags = tagFields.filter((field) => metadata[field.name]).length;
  const filledCategories = categoryFields.filter((field) => metadata[field.name]).length;
  const filledBrands = brandFields.filter((field) => metadata[field.name]).length;

  return (
    <Container className="divide-y p-0">
      <Toaster />

      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">إعدادات المنتجات</Heading>

        <ActionMenu
          groups={[
            {
              actions: [
                {
                  icon: <PencilSquare />,
                  label: "تعديل",
                  onClick() {
                    setIsOpen(true);
                  },
                },
              ],
            },
          ]}
        />
      </div>

      <div className="px-6 py-4 space-y-4">
        {/* Tags Summary */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-ui-fg-base">علامات المنتجات</h3>
          <p className="text-sm text-ui-fg-subtle">
            {filledTags > 0
              ? `تم تعيين ${filledTags} من أصل ${tagFields.length} علامة`
              : "لم يتم تعيين أي علامات للمنتجات"}
          </p>
        </div>

        {/* Categories Summary */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-ui-fg-base">التصنيفات</h3>
          <p className="text-sm text-ui-fg-subtle">
            {filledCategories > 0
              ? `تم تعيين ${filledCategories} من أصل ${categoryFields.length} تصنيف`
              : "لم يتم تعيين أي تصنيفات"}
          </p>
        </div>

        {/* Brands Summary */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-ui-fg-base">العلامات التجارية</h3>
          <p className="text-sm text-ui-fg-subtle">
            {filledBrands > 0
              ? `تم تعيين ${filledBrands} من أصل ${brandFields.length} علامة تجارية`
              : "لم يتم تعيين أي علامات تجارية"}
          </p>
        </div>

        {/* Quick Preview of Set Values */}
        {(filledTags > 0 || filledCategories > 0 || filledBrands > 0) && (
          <div className="space-y-3 pt-4 border-t">
            <h3 className="text-sm font-medium text-ui-fg-base">القيم المعينة:</h3>
            <div className="space-y-2 text-xs">
              {[...tagFields, ...categoryFields, ...brandFields].map((field) => {
                const value = metadata[field.name];
                if (value) {
                  return (
                    <div key={field.name} className="flex justify-between">
                      <span className="text-ui-fg-subtle">{field.label}:</span>
                      <span className="font-mono text-ui-fg-base">{value}</span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}
      </div>

      <EditForm open={isOpen} onOpenChange={setIsOpen} store={store || data} onSubmitSuccess={mutate} />
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "store.details.after",
});

export default StoreProductSettingsWidget;
