import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { AdminStore, DetailWidgetProps } from "@medusajs/framework/types";
import { Button, Container, Drawer, Heading, toast, Toaster, Input, Label, Badge, Select } from "@medusajs/ui";
import { ActionMenu } from "../components/action-menu";
import { PencilSquare } from "@medusajs/icons";
import { useState, useEffect } from "react";
import { FormProvider, useForm, Controller } from "react-hook-form";
import * as zod from "zod";
import { sdk } from "../lib/sdk";
import useSWR from "swr";

// Define the product tag type
type AdminProductTag = {
  id: string;
  value: string;
};

// Define the box structure
type TagBox = {
  title: string;
  tagIds: string[];
};

const schema = zod.object({
  box1: zod.object({
    title: zod.string().min(1, "Title is required"),
    tagIds: zod.array(zod.string()).min(2, "Select at least 2 tags").max(4, "Select maximum 4 tags"),
  }),
  box2: zod.object({
    title: zod.string().min(1, "Title is required"),
    tagIds: zod.array(zod.string()).min(2, "Select at least 2 tags").max(4, "Select maximum 4 tags"),
  }),
  box3: zod.object({
    title: zod.string().min(1, "Title is required"),
    tagIds: zod.array(zod.string()).min(2, "Select at least 2 tags").max(4, "Select maximum 4 tags"),
  }),
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
      box1: { title: "", tagIds: [] },
      box2: { title: "", tagIds: [] },
      box3: { title: "", tagIds: [] },
    },
  });

  // Fetch all product tags
  const { data: productTagsResponse } = useSWR(["product-tags"], () => sdk.admin.productTag.list({ limit: 100 }));

  const productTags = productTagsResponse?.product_tags || [];

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      const result = await sdk.admin.store.update(store.id, {
        metadata: {
          ...store.metadata,
          tags_boxes: data,
        },
      });

      // Show success toast
      toast.success("تم تحديث صناديق العلامات بنجاح", {
        description: "تم حفظ جميع الصناديق والعلامات",
      });

      onOpenChange(false);
      if (onSubmitSuccess) onSubmitSuccess();
      return result;
    } catch (error: any) {
      toast.error("فشل تحديث صناديق العلامات", { description: error.message });
    }
  });

  // Initialize form with existing values
  useEffect(() => {
    const existingBoxes = (store.metadata?.tags_boxes as any) || {};
    if (existingBoxes.box1) {
      form.setValue("box1", existingBoxes.box1);
    }
    if (existingBoxes.box2) {
      form.setValue("box2", existingBoxes.box2);
    }
    if (existingBoxes.box3) {
      form.setValue("box3", existingBoxes.box3);
    }
  }, [store.metadata?.tags_boxes, form]);

  const renderBoxForm = (boxKey: "box1" | "box2" | "box3", boxNumber: number) => {
    const boxData = form.watch(boxKey);
    const selectedTags = productTags.filter((tag) => (boxData.tagIds || []).includes(tag.id));

    return (
      <div key={boxKey} className="space-y-4 p-4 border rounded-lg">
        <h3 className="text-lg font-medium text-ui-fg-base">الصندوق {boxNumber}</h3>

        {/* Title Input */}
        <div className="space-y-2">
          <Label size="small" weight="plus">
            عنوان الصندوق
          </Label>
          <Controller
            control={form.control}
            name={`${boxKey}.title`}
            render={({ field }) => (
              <Input
                placeholder="أدخل عنوان الصندوق"
                value={field.value || ""}
                onChange={field.onChange}
                className="w-full"
              />
            )}
          />
        </div>

        {/* Tags Selection */}
        <div className="space-y-2">
          <Label size="small" weight="plus">
            العلامات ({selectedTags.length}/4)
          </Label>
          <Controller
            control={form.control}
            name={`${boxKey}.tagIds`}
            render={({ field }) => (
              <Select
                value=""
                onValueChange={(value) => {
                  const currentIds = field.value || [];
                  if (!currentIds.includes(value)) {
                    // Add tag (if under limit)
                    if (currentIds.length < 4) {
                      field.onChange([...currentIds, value]);
                    }
                  }
                }}
              >
                <Select.Trigger>
                  <Select.Value placeholder="اختر العلامات (2-4 علامات)" />
                </Select.Trigger>
                <Select.Content>
                  {productTags
                    .filter((tag) => !field.value?.includes(tag.id))
                    .map((tag) => (
                      <Select.Item key={tag.id} value={tag.id}>
                        {tag.value}
                      </Select.Item>
                    ))}
                </Select.Content>
              </Select>
            )}
          />

          {/* Selected Tags Display */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedTags.map((tag) => (
                <Badge key={tag.id} className="flex items-center gap-x-1">
                  {tag.value}
                  <button
                    type="button"
                    onClick={() => {
                      const currentIds = form.getValues(`${boxKey}.tagIds`) || [];
                      form.setValue(
                        `${boxKey}.tagIds`,
                        currentIds.filter((id) => id !== tag.id)
                      );
                    }}
                    className="ml-1 text-xs hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content>
        <FormProvider {...form}>
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
            <Drawer.Header>
              <Heading className="capitalize">تعديل صناديق العلامات</Heading>
            </Drawer.Header>
            <Drawer.Body className="flex max-w-full flex-1 flex-col gap-y-8 overflow-y-auto">
              <div className="w-full space-y-6">
                {renderBoxForm("box1", 1)}
                {renderBoxForm("box2", 2)}
                {renderBoxForm("box3", 3)}
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

const TagsBoxesWidget = ({ data }: DetailWidgetProps<AdminStore>) => {
  const { data: store, mutate } = useSWR(["store", data.id], async () => {
    const result = await sdk.admin.store.retrieve(data.id);
    return result.store;
  });

  const [isOpen, setIsOpen] = useState(false);

  // Fetch all product tags for display
  const { data: productTagsResponse } = useSWR(["product-tags"], () => sdk.admin.productTag.list({ limit: 100 }));

  const productTags = productTagsResponse?.product_tags || [];
  const tagsBoxes = (store?.metadata?.tags_boxes as any) || {};

  // Count configured boxes
  const configuredBoxes = Object.values(tagsBoxes).filter(
    (box: any) => box && box.title && box.tagIds && box.tagIds.length >= 2
  ).length;

  const getTagById = (id: string) => productTags.find((tag) => tag.id === id);

  return (
    <Container className="divide-y p-0">
      <Toaster />

      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">صناديق العلامات</Heading>

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
        {configuredBoxes > 0 ? (
          <div className="space-y-6">
            <p className="text-sm text-ui-fg-subtle">عدد الصناديق المُعدة: {configuredBoxes} من 3</p>

            {/* Display configured boxes */}
            {Object.entries(tagsBoxes).map(([boxKey, boxData]: [string, any]) => {
              if (!boxData || !boxData.title || !boxData.tagIds || boxData.tagIds.length < 2) {
                return null;
              }

              const selectedTags = boxData.tagIds.map((id: string) => getTagById(id)).filter(Boolean);

              return (
                <div key={boxKey} className="p-4 border rounded-lg">
                  <h3 className="text-lg font-medium text-ui-fg-base mb-3">{boxData.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag: AdminProductTag) => (
                      <Badge key={tag.id} className="flex items-center gap-x-1">
                        {tag.value}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-ui-fg-subtle">
            لم يتم إعداد أي صناديق للعلامات. اضغط على "تعديل" لإضافة صناديق العلامات.
          </p>
        )}
      </div>

      <EditForm open={isOpen} onOpenChange={setIsOpen} store={store || data} onSubmitSuccess={mutate} />
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "store.details.after",
});

export default TagsBoxesWidget;
