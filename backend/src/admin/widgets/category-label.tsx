import { AdminProductCategory, DetailWidgetProps } from "@medusajs/framework/types";
import { Button, Container, Drawer, Heading, Label, Select, toast, Toaster } from "@medusajs/ui";
import { useState } from "react";
import { ActionMenu } from "../components/action-menu";
import { PencilSquare } from "@medusajs/icons";
import { Controller, FormProvider, useForm } from "react-hook-form";
import * as zod from "zod";
import { sdk } from "../lib/sdk";
import { defineWidgetConfig } from "@medusajs/admin-sdk";
import useSWR from "swr";

const CATEGORY_LABELS = [
  { label: "New", value: "new" },
  { label: "Sale", value: "sale" },
  { label: "Flash Sale", value: "flash-sale" },
  { label: "Hot", value: "hot" },
  { label: "Big Sale", value: "big-sale" },
  { label: "Special Offer", value: "special-offer" },
];

const schema = zod.object({
  label: zod.string(),
});

export const EditForm = ({
  open,
  onOpenChange,
  category,
  onSubmitSuccess,
}: {
  open: boolean;
  onOpenChange(oprn: boolean): void;
  category: AdminProductCategory;
  onSubmitSuccess?: () => void;
}) => {
  const form = useForm<zod.infer<typeof schema>>({
    defaultValues: {
      label: "",
    },
  });

  const handleSubmit = form.handleSubmit(async ({ label }) => {
    try {
      const result = await sdk.admin.productCategory.update(category.id, { metadata: { label } });

      // Show success toast
      toast.success("Category label updated", {
        description: `Successfully updated label for categroy: ${category.handle}`,
      });

      onOpenChange(false);
      if (onSubmitSuccess) onSubmitSuccess();
      return result;
    } catch (error: any) {
      toast.error("Category label update failed", { description: error.message });
    }
  });

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content>
        <FormProvider {...form}>
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
            <Drawer.Header>
              <Heading className="capitalize">Edit Label</Heading>
            </Drawer.Header>
            <Drawer.Body className="flex max-w-full flex-1 flex-col gap-y-8 overflow-y-auto">
              <Controller
                control={form.control}
                name="label"
                render={({ field }) => {
                  return (
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center gap-x-1">
                        <Label size="small" weight="plus">
                          Label
                        </Label>
                      </div>
                      {/* <Textarea {...field} className="min-h-40" /> */}
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <Select.Trigger>
                          <Select.Value placeholder="Select a label" />
                        </Select.Trigger>
                        <Select.Content>
                          {CATEGORY_LABELS.map((category) => (
                            <Select.Item key={category.value} value={category.value}>
                              {category.label}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    </div>
                  );
                }}
              />
            </Drawer.Body>
            <Drawer.Footer>
              <div className="flex items-center justify-end gap-x-2">
                <Drawer.Close asChild>
                  <Button size="small" variant="secondary">
                    Cancel
                  </Button>
                </Drawer.Close>
                <Button size="small" type="submit">
                  Save
                </Button>
              </div>
            </Drawer.Footer>
          </form>
        </FormProvider>
      </Drawer.Content>
    </Drawer>
  );
};

const CategoryLabelWidget = ({ data: passedCategory }: DetailWidgetProps<AdminProductCategory>) => {
  const { data: category, mutate } = useSWR(["category", passedCategory.id], () =>
    sdk.admin.productCategory.retrieve(passedCategory.id)
  );
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Container className="divide-y p-0">
      <Toaster />

      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Label</Heading>

        <ActionMenu
          groups={[
            {
              actions: [
                {
                  icon: <PencilSquare />,
                  label: "Edit",
                  onClick() {
                    setIsOpen(true);
                  },
                },
              ],
            },
          ]}
        />
      </div>

      <p className="px-6 py-4 txt-small text-ui-fg-subtle">
        {(category?.product_category?.metadata as any)?.label || "No label"}
      </p>

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

export default CategoryLabelWidget;
