import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { AdminProduct, DetailWidgetProps } from "@medusajs/framework/types";
import { PencilSquare } from "@medusajs/icons";
import { Container, Textarea, toast, Toaster } from "@medusajs/ui";
import { Drawer, Heading, Label, Button } from "@medusajs/ui";
import { FormProvider, Controller } from "react-hook-form";
import * as zod from "zod";
import { useForm } from "react-hook-form";
import { ActionMenu } from "../components/action-menu";
import { useState } from "react";
import { sdk } from "../lib/sdk";
import useSWR from "swr";

const schema = zod.object({
  how_to_use: zod.string(),
});

export const EditForm = ({
  open,
  onOpenChange,
  product,
  onSubmitSuccess,
}: {
  open: boolean;
  onOpenChange(oprn: boolean): void;
  product: AdminProduct;
  onSubmitSuccess?: () => void;
}) => {
  const form = useForm<zod.infer<typeof schema>>({
    defaultValues: {
      how_to_use: "",
    },
  });

  const handleSubmit = form.handleSubmit(async ({ how_to_use }) => {
    try {
      const steps = how_to_use
        .split("\n") // Split by new lines
        .map((step) => step.trim()) // Remove extra spaces
        .filter((step) => step.length > 0); // Remove empty lines

      const result = await sdk.admin.product.update(product.id, { metadata: { how_to_use: steps } } as any);

      // Show success toast
      toast.success("تم تحديث طريقة الاستخدام", {
        description: `تم تحديث طريقة الاستخدام للمنتج: ${product.handle}`,
      });

      onOpenChange(false);
      if (onSubmitSuccess) onSubmitSuccess();
      return result;
    } catch (error: any) {
      toast.error("فشل تحديث طريقة الاستخدام", { description: error.message });
    }
  });

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content>
        <FormProvider {...form}>
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
            <Drawer.Header>
              <Heading className="capitalize">تعديل طريقة الاستخدام</Heading>
            </Drawer.Header>
            <Drawer.Body className="flex max-w-full flex-1 flex-col gap-y-8 overflow-y-auto">
              <Controller
                control={form.control}
                name="how_to_use"
                render={({ field }) => {
                  return (
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center gap-x-1">
                        <Label size="small" weight="plus">
                          الخطوات
                        </Label>
                      </div>
                      <Textarea {...field} className="min-h-40" />
                    </div>
                  );
                }}
              />
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

const HowToUse = ({ data: passedProduct }: DetailWidgetProps<AdminProduct>) => {
  //   const steps = (product.metadata?.how_to_use as string[]) || [];
  const { data: product, mutate } = useSWR(["how-to-use", passedProduct.id], async () => {
    const { product } = await sdk.admin.product.retrieve(passedProduct.id);

    return product;
  });

  const steps = (product?.metadata?.how_to_use as string[]) || [];

  const [isOpen, setIsOpen] = useState(false);

  return (
    <Container className="divide-y p-0">
      <Toaster />
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">طريقة الاستخدام</Heading>

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

      <ul className="px-6 py-4 list-decimal ps-10">
        {steps.map((step, index) => (
          <li className="font-normal font-sans txt-compact-small whitespace-pre-line text-pretty" key={index}>
            {step}
          </li>
        ))}
      </ul>

      <EditForm open={isOpen} onOpenChange={setIsOpen} product={passedProduct} onSubmitSuccess={mutate} />
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "product.details.side.before",
});

export default HowToUse;
