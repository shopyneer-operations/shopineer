import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { AdminCollection, DetailWidgetProps } from "@medusajs/framework/types";
import { Button, Container, Drawer, Heading, toast, Toaster, Badge, Input } from "@medusajs/ui";
import { ActionMenu } from "../components/action-menu";
import { PencilSquare, X } from "@medusajs/icons";
import { useState, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as zod from "zod";
import { sdk } from "../lib/sdk";
import useSWR from "swr";

const schema = zod.object({
  tags: zod.array(zod.string()).optional(),
  newTag: zod.string().optional(),
});

export const EditForm = ({
  open,
  onOpenChange,
  collection,
  onSubmitSuccess,
}: {
  open: boolean;
  onOpenChange(open: boolean): void;
  collection: AdminCollection;
  onSubmitSuccess?: () => void;
}) => {
  const form = useForm<zod.infer<typeof schema>>({
    defaultValues: {
      tags: [],
      newTag: "",
    },
  });

  const handleSubmit = form.handleSubmit(async ({ tags }) => {
    try {
      const result = await sdk.admin.productCollection.update(collection.id, {
        metadata: {
          ...collection.metadata,
          tags: tags || [],
        },
      } as any);

      // Show success toast
      toast.success("تم تحديث المجموعة بنجاح", {
        description: `تم تحديث ${tags?.length || 0} علامة`,
      });

      onOpenChange(false);
      if (onSubmitSuccess) onSubmitSuccess();
      return result;
    } catch (error: any) {
      toast.error("فشل تحديث علامات المجموعة", { description: error.message });
    }
  });

  const addTag = () => {
    const newTag = form.getValues("newTag")?.trim();
    if (newTag && newTag.length > 0) {
      const currentTags = form.getValues("tags") || [];
      if (!currentTags.includes(newTag)) {
        form.setValue("tags", [...currentTags, newTag]);
        form.setValue("newTag", "");
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags") || [];
    const updatedTags = currentTags.filter((tag) => tag !== tagToRemove);
    form.setValue("tags", updatedTags);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  // Initialize form with existing tags
  useEffect(() => {
    const existingTags = (collection.metadata?.tags as string[]) || [];
    if (existingTags.length > 0) {
      form.setValue("tags", existingTags);
    }
  }, [collection.metadata?.tags, form]);

  const currentTags = form.watch("tags") || [];
  const newTag = form.watch("newTag");

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content>
        <FormProvider {...form}>
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
            <Drawer.Header>
              <Heading className="capitalize">تعديل علامات المجموعة</Heading>
            </Drawer.Header>
            <Drawer.Body className="flex max-w-full flex-1 flex-col gap-y-8 overflow-y-auto">
              <div className="w-full">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center gap-x-2">
                    <Input
                      placeholder="أضف علامة جديدة..."
                      value={newTag || ""}
                      onChange={(e) => form.setValue("newTag", e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                    />
                    <Button type="button" size="small" onClick={addTag} disabled={!newTag?.trim()}>
                      إضافة
                    </Button>
                  </div>

                  {/* Display current tags */}
                  {currentTags.length > 0 && (
                    <div className="w-full">
                      <h3 className="text-sm font-medium mb-3">العلامات المحددة:</h3>
                      <div className="flex flex-wrap gap-2">
                        {currentTags.map((tag, index) => (
                          <Badge key={index} className="flex items-center gap-x-1">
                            {tag}
                            <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-red-500">
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
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

const CollectionTagsWidget = ({ data: passedCollection }: DetailWidgetProps<AdminCollection>) => {
  const { data: collectionResponse, mutate } = useSWR(["collection", passedCollection.id], () =>
    sdk.admin.productCollection.retrieve(passedCollection.id)
  );

  const [isOpen, setIsOpen] = useState(false);

  const tags = collectionResponse?.collection.metadata?.tags as string[] | undefined;
  const tagCount = tags?.length || 0;

  return (
    <Container className="divide-y p-0">
      <Toaster />

      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">علامات المجموعة</Heading>

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
        {tagCount > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-ui-fg-subtle">عدد العلامات: {tagCount}</p>
            <div className="flex flex-wrap gap-2">
              {tags?.map((tag, index) => (
                <Badge key={index} className="flex items-center gap-x-1">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-ui-fg-subtle">لا توجد علامات للمجموعة. اضغط على "تعديل" لإضافة علامات.</p>
        )}
      </div>

      <EditForm
        open={isOpen}
        onOpenChange={setIsOpen}
        collection={collectionResponse?.collection || passedCollection}
        onSubmitSuccess={mutate}
      />
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "product_collection.details.after",
});

export default CollectionTagsWidget;
