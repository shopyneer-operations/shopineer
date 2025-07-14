import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { AdminProductCategory, DetailWidgetProps } from "@medusajs/framework/types";
import { Button, Container, Drawer, Heading, toast, Toaster, Input, Label } from "@medusajs/ui";
import { ActionMenu } from "../components/action-menu";
import { PencilSquare } from "@medusajs/icons";
import { useState, useEffect } from "react";
import { FormProvider, useForm, Controller } from "react-hook-form";
import * as zod from "zod";
import { sdk } from "../lib/sdk";
import useSWR from "swr";

const schema = zod.object({
  best_sellers: zod.string().optional(),
  best_offers: zod.string().optional(),
});

// Field configurations for better maintainability
const categoryFields = [
  { name: "best_sellers", label: "أفضل المبيعات" },
  { name: "best_offers", label: "أفضل العروض" },
];

export const EditForm = ({
  open,
  onOpenChange,
  category,
  onSubmitSuccess,
}: {
  open: boolean;
  onOpenChange(open: boolean): void;
  category: AdminProductCategory;
  onSubmitSuccess?: () => void;
}) => {
  const form = useForm<zod.infer<typeof schema>>({
    defaultValues: {
      best_sellers: "",
      best_offers: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      const result = await sdk.admin.productCategory.update(category.id, {
        metadata: {
          ...category.metadata,
          ...data,
        },
      });

      // Show success toast
      toast.success("تم تحديث إعدادات الفئة بنجاح", {
        description: "تم حفظ جميع المعرفات بنجاح",
      });

      onOpenChange(false);
      if (onSubmitSuccess) onSubmitSuccess();
      return result;
    } catch (error: any) {
      toast.error("فشل تحديث إعدادات الفئة", { description: error.message });
    }
  });

  // Initialize form with existing values
  useEffect(() => {
    const metadata = category.metadata || {};
    categoryFields.forEach(({ name }) => {
      form.setValue(name as keyof zod.infer<typeof schema>, (metadata[name] as string) || "");
    });
  }, [category.metadata, form]);

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
              <Heading className="capitalize">إعدادات الفئة</Heading>
            </Drawer.Header>
            <Drawer.Body className="flex max-w-full flex-1 flex-col gap-y-8 overflow-y-auto">
              <div className="w-full space-y-8">
                {/* Category Settings Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-ui-fg-base">إعدادات المنتجات للفئة</h3>

                  <div className="space-y-4">
                    {categoryFields.map((field) => renderField(field, "أدخل معرف العلامة"))}
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

const CategoryProductIdentifiersWidget = ({ data: passedCategory }: DetailWidgetProps<AdminProductCategory>) => {
  const { data: category, mutate } = useSWR(["category", passedCategory.id], () =>
    sdk.admin.productCategory.retrieve(passedCategory.id)
  );
  const [isOpen, setIsOpen] = useState(false);

  const metadata = category?.product_category?.metadata || {};

  // Count filled fields
  const filledFields = categoryFields.filter((field) => metadata[field.name]).length;

  return (
    <Container className="divide-y p-0">
      <Toaster />

      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">إعدادات المنتجات للفئة</Heading>

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
        {/* Settings Summary */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-ui-fg-base">إعدادات الفئة</h3>
          <p className="text-sm text-ui-fg-subtle">
            {filledFields > 0
              ? `تم تعيين ${filledFields} من أصل ${categoryFields.length} إعداد`
              : "لم يتم تعيين أي إعدادات للفئة"}
          </p>
        </div>

        {/* Quick Preview of Set Values */}
        {filledFields > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <h3 className="text-sm font-medium text-ui-fg-base">القيم المعينة:</h3>
            <div className="space-y-2 text-xs">
              {categoryFields.map((field) => {
                const value = metadata[field.name] as string;
                if (value) {
                  return (
                    <div key={field.name} className="flex justify-between">
                      <span className="text-ui-fg-subtle">{field.label}:</span>
                      <span className="font-mono text-ui-fg-base max-w-[200px] truncate" title={value}>
                        {value}
                      </span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="space-y-2 pt-4 border-t">
          <h3 className="text-sm font-medium text-ui-fg-base">تعليمات:</h3>
          <div className="text-xs text-ui-fg-subtle space-y-1">
            <p>
              • <strong>أفضل المبيعات:</strong> أدخل معرف العلامة للمنتجات الأكثر مبيعاً
            </p>
            <p>
              • <strong>أفضل العروض:</strong> أدخل معرف العلامة للمنتجات ذات العروض المميزة
            </p>
            <p>
              • مثال: <code className="bg-ui-bg-component px-1 rounded">tag_123</code>
            </p>
          </div>
        </div>
      </div>

      <EditForm
        open={isOpen}
        onOpenChange={setIsOpen}
        category={category?.product_category || passedCategory}
        onSubmitSuccess={mutate}
      />
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "product_category.details.side.after",
});

export default CategoryProductIdentifiersWidget;
