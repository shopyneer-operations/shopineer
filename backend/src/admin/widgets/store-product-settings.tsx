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
    form.setValue("local_tag_id", metadata.local_tag_id || "");
    form.setValue("best_seller_tag_id", metadata.best_seller_tag_id || "");
    form.setValue("high_rated_tag_id", metadata.high_rated_tag_id || "");
    form.setValue("new_arrival_tag_id", metadata.new_arrival_tag_id || "");
    form.setValue("winter_tag_id", metadata.winter_tag_id || "");
    form.setValue("sheglam_tag_id", metadata.sheglam_tag_id || "");
    form.setValue("powder_tag_id", metadata.powder_tag_id || "");
    form.setValue("new_year_offers_tag_id", metadata.new_year_offers_tag_id || "");
    form.setValue("beauty_essentials_tag_id", metadata.beauty_essentials_tag_id || "");
    form.setValue("all_you_want_tag_id", metadata.all_you_want_tag_id || "");
    form.setValue("recommended_tag_id", metadata.recommended_tag_id || "");
    form.setValue("flash_sale_tag_id", metadata.flash_sale_tag_id || "");
    form.setValue("make_up_category_id", metadata.make_up_category_id || "");
    form.setValue("sheglam_brand_id", metadata.sheglam_brand_id || "");
  }, [store.metadata, form]);

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
                    <div className="space-y-2">
                      <Label size="small" weight="plus">
                        محلي
                      </Label>
                      <Controller
                        control={form.control}
                        name="local_tag_id"
                        render={({ field }) => (
                          <Input
                            placeholder="أدخل معرف العلامة"
                            value={field.value || ""}
                            onChange={field.onChange}
                            className="w-full"
                          />
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label size="small" weight="plus">
                        الأكثر مبيعاً
                      </Label>
                      <Controller
                        control={form.control}
                        name="best_seller_tag_id"
                        render={({ field }) => (
                          <Input
                            placeholder="أدخل معرف العلامة"
                            value={field.value || ""}
                            onChange={field.onChange}
                            className="w-full"
                          />
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label size="small" weight="plus">
                        الأعلى تقييماً
                      </Label>
                      <Controller
                        control={form.control}
                        name="high_rated_tag_id"
                        render={({ field }) => (
                          <Input
                            placeholder="أدخل معرف العلامة"
                            value={field.value || ""}
                            onChange={field.onChange}
                            className="w-full"
                          />
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label size="small" weight="plus">
                        وصل حديثاً
                      </Label>
                      <Controller
                        control={form.control}
                        name="new_arrival_tag_id"
                        render={({ field }) => (
                          <Input
                            placeholder="أدخل معرف العلامة"
                            value={field.value || ""}
                            onChange={field.onChange}
                            className="w-full"
                          />
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label size="small" weight="plus">
                        شتوي
                      </Label>
                      <Controller
                        control={form.control}
                        name="winter_tag_id"
                        render={({ field }) => (
                          <Input
                            placeholder="أدخل معرف العلامة"
                            value={field.value || ""}
                            onChange={field.onChange}
                            className="w-full"
                          />
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label size="small" weight="plus">
                        شيجلام
                      </Label>
                      <Controller
                        control={form.control}
                        name="sheglam_tag_id"
                        render={({ field }) => (
                          <Input
                            placeholder="أدخل معرف العلامة"
                            value={field.value || ""}
                            onChange={field.onChange}
                            className="w-full"
                          />
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label size="small" weight="plus">
                        بودرة
                      </Label>
                      <Controller
                        control={form.control}
                        name="powder_tag_id"
                        render={({ field }) => (
                          <Input
                            placeholder="أدخل معرف العلامة"
                            value={field.value || ""}
                            onChange={field.onChange}
                            className="w-full"
                          />
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label size="small" weight="plus">
                        عروض رأس السنة
                      </Label>
                      <Controller
                        control={form.control}
                        name="new_year_offers_tag_id"
                        render={({ field }) => (
                          <Input
                            placeholder="أدخل معرف العلامة"
                            value={field.value || ""}
                            onChange={field.onChange}
                            className="w-full"
                          />
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label size="small" weight="plus">
                        أساسيات الجمال
                      </Label>
                      <Controller
                        control={form.control}
                        name="beauty_essentials_tag_id"
                        render={({ field }) => (
                          <Input
                            placeholder="أدخل معرف العلامة"
                            value={field.value || ""}
                            onChange={field.onChange}
                            className="w-full"
                          />
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label size="small" weight="plus">
                        كل ما تريد
                      </Label>
                      <Controller
                        control={form.control}
                        name="all_you_want_tag_id"
                        render={({ field }) => (
                          <Input
                            placeholder="أدخل معرف العلامة"
                            value={field.value || ""}
                            onChange={field.onChange}
                            className="w-full"
                          />
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label size="small" weight="plus">
                        موصى به
                      </Label>
                      <Controller
                        control={form.control}
                        name="recommended_tag_id"
                        render={({ field }) => (
                          <Input
                            placeholder="أدخل معرف العلامة"
                            value={field.value || ""}
                            onChange={field.onChange}
                            className="w-full"
                          />
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label size="small" weight="plus">
                        عرض خاطف
                      </Label>
                      <Controller
                        control={form.control}
                        name="flash_sale_tag_id"
                        render={({ field }) => (
                          <Input
                            placeholder="أدخل معرف العلامة"
                            value={field.value || ""}
                            onChange={field.onChange}
                            className="w-full"
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Categories Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-ui-fg-base">التصنيفات</h3>

                  <div className="space-y-2">
                    <Label size="small" weight="plus">
                      مكياج
                    </Label>
                    <Controller
                      control={form.control}
                      name="make_up_category_id"
                      render={({ field }) => (
                        <Input
                          placeholder="أدخل معرف التصنيف"
                          value={field.value || ""}
                          onChange={field.onChange}
                          className="w-full"
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Brands Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-ui-fg-base">العلامات التجارية</h3>

                  <div className="space-y-2">
                    <Label size="small" weight="plus">
                      شيجلام
                    </Label>
                    <Controller
                      control={form.control}
                      name="sheglam_brand_id"
                      render={({ field }) => (
                        <Input
                          placeholder="أدخل معرف العلامة التجارية"
                          value={field.value || ""}
                          onChange={field.onChange}
                          className="w-full"
                        />
                      )}
                    />
                  </div>
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
  const tagFields = [
    "local_tag_id",
    "best_seller_tag_id",
    "high_rated_tag_id",
    "new_arrival_tag_id",
    "winter_tag_id",
    "sheglam_tag_id",
    "powder_tag_id",
    "new_year_offers_tag_id",
    "beauty_essentials_tag_id",
    "all_you_want_tag_id",
    "recommended_tag_id",
    "flash_sale_tag_id",
  ];

  const categoryFields = ["make_up_category_id"];
  const brandFields = ["sheglam_brand_id"];

  const filledTags = tagFields.filter((field) => metadata[field]).length;
  const filledCategories = categoryFields.filter((field) => metadata[field]).length;
  const filledBrands = brandFields.filter((field) => metadata[field]).length;

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
              {tagFields.map((field) => {
                const value = metadata[field];
                if (value) {
                  return (
                    <div key={field} className="flex justify-between">
                      <span className="text-ui-fg-subtle">{field.replace("_tag_id", "")}:</span>
                      <span className="font-mono text-ui-fg-base">{value}</span>
                    </div>
                  );
                }
                return null;
              })}
              {categoryFields.map((field) => {
                const value = metadata[field];
                if (value) {
                  return (
                    <div key={field} className="flex justify-between">
                      <span className="text-ui-fg-subtle">{field.replace("_category_id", "")}:</span>
                      <span className="font-mono text-ui-fg-base">{value}</span>
                    </div>
                  );
                }
                return null;
              })}
              {brandFields.map((field) => {
                const value = metadata[field];
                if (value) {
                  return (
                    <div key={field} className="flex justify-between">
                      <span className="text-ui-fg-subtle">{field.replace("_brand_id", "")}:</span>
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
