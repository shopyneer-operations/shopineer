import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { AdminStore, DetailWidgetProps } from "@medusajs/framework/types";
import { Button, Container, Drawer, Heading, toast, Toaster, Switch, Label, Input } from "@medusajs/ui";
import { ActionMenu } from "../components/action-menu";
import { PencilSquare } from "@medusajs/icons";
import { useState, useEffect } from "react";
import { FormProvider, useForm, Controller } from "react-hook-form";
import * as zod from "zod";
import { sdk } from "../lib/sdk";
import useStore from "../lib/hooks/use-store";
import useSWR from "swr";

const schema = zod.object({
  has_flash_sale: zod.boolean().default(false),
  flash_sale_end_time: zod.string().optional(),
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
      has_flash_sale: false,
      flash_sale_end_time: "",
    },
  });

  const handleSubmit = form.handleSubmit(async ({ has_flash_sale, flash_sale_end_time }) => {
    try {
      const result = await sdk.admin.store.update(store.id, {
        metadata: {
          ...store.metadata,
          has_flash_sale,
          flash_sale_end_time: has_flash_sale ? flash_sale_end_time : undefined,
        },
      });

      // Show success toast
      toast.success("تم تحديث إعدادات العرض الخاطف بنجاح", {
        description: has_flash_sale
          ? `تم تفعيل العرض الخاطف حتى ${new Date(flash_sale_end_time || "").toLocaleString("ar-EG")}`
          : "تم إلغاء تفعيل العرض الخاطف",
      });

      onOpenChange(false);
      if (onSubmitSuccess) onSubmitSuccess();
      return result;
    } catch (error: any) {
      toast.error("فشل تحديث إعدادات العرض الخاطف", { description: error.message });
    }
  });

  // Initialize form with existing values
  useEffect(() => {
    const existingHasFlashSale = (store.metadata?.has_flash_sale as boolean) || false;
    const existingEndTime = (store.metadata?.flash_sale_end_time as string) || "";

    form.setValue("has_flash_sale", existingHasFlashSale);
    form.setValue("flash_sale_end_time", existingEndTime);
  }, [store.metadata, form]);

  const hasFlashSale = form.watch("has_flash_sale");

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content>
        <FormProvider {...form}>
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
            <Drawer.Header>
              <Heading className="capitalize">إعدادات العرض الخاطف</Heading>
            </Drawer.Header>
            <Drawer.Body className="flex max-w-full flex-1 flex-col gap-y-8 overflow-y-auto">
              <div className="w-full space-y-6">
                {/* Flash Sale Toggle */}
                <div className="flex items-center gap-x-3">
                  <Controller
                    control={form.control}
                    name="has_flash_sale"
                    render={({ field }) => (
                      <Switch id="flash-sale-toggle" checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                  <Label htmlFor="flash-sale-toggle" className="text-ui-fg-subtle">
                    تفعيل العرض الخاطف
                  </Label>
                </div>

                {/* End Time Picker - Only show when flash sale is enabled */}
                {hasFlashSale && (
                  <div className="space-y-2">
                    <Label size="small" weight="plus">
                      وقت انتهاء العرض الخاطف
                    </Label>
                    <Controller
                      control={form.control}
                      name="flash_sale_end_time"
                      render={({ field }) => (
                        <Input
                          type="datetime-local"
                          value={field.value || ""}
                          onChange={field.onChange}
                          className="w-full"
                        />
                      )}
                    />
                    <p className="text-xs text-ui-fg-subtle">اختر الوقت الذي سينتهي فيه العرض الخاطف</p>
                  </div>
                )}
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

const StoreFlashSaleWidget = ({ data: passedStore }: DetailWidgetProps<AdminStore>) => {
  const { store, isLoading, error } = useStore();
  const { mutate } = useSWR(["store"]);

  const [isOpen, setIsOpen] = useState(false);

  const hasFlashSale = (store?.metadata?.has_flash_sale as boolean) || false;
  const flashSaleEndTime = store?.metadata?.flash_sale_end_time as string | undefined;

  const formatEndTime = (endTime: string) => {
    try {
      return new Date(endTime).toLocaleString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return endTime;
    }
  };

  const isExpired = flashSaleEndTime ? new Date(flashSaleEndTime) < new Date() : false;

  return (
    <Container className="divide-y p-0">
      <Toaster />

      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">العرض الخاطف</Heading>

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

      <div className="px-6 py-4">
        {hasFlashSale ? (
          <div className="space-y-3">
            <div className="flex items-center gap-x-2">
              <div className={`w-3 h-3 rounded-full ${isExpired ? "bg-red-500" : "bg-green-500"}`}></div>
              <span className={`text-sm font-medium ${isExpired ? "text-red-600" : "text-green-600"}`}>
                {isExpired ? "منتهي الصلاحية" : "نشط"}
              </span>
            </div>

            {flashSaleEndTime && (
              <div className="space-y-1">
                <p className="text-sm text-ui-fg-subtle">وقت الانتهاء:</p>
                <p className="text-sm font-medium">{formatEndTime(flashSaleEndTime)}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-ui-fg-subtle">لا يوجد عرض خاطف مفعل. اضغط على "تعديل" لتفعيل العرض الخاطف.</p>
        )}
      </div>

      <EditForm open={isOpen} onOpenChange={setIsOpen} store={store || passedStore} onSubmitSuccess={mutate} />
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "store.details.after",
});

export default StoreFlashSaleWidget;
