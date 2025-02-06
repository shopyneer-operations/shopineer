import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { AdminProductCategory, DetailWidgetProps } from "@medusajs/framework/types";
import { Button, Container, Drawer, Heading, toast, Toaster } from "@medusajs/ui";
import { ActionMenu } from "../components/action-menu";
import { PencilSquare } from "@medusajs/icons";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as zod from "zod";
import { Media, MediaSchema, UploadMediaFormItem } from "../components/upload-media-form-item";
import { sdk } from "../lib/sdk";
import useSWR from "swr";

const schema = zod.object({
  thumbnail: MediaSchema.optional(),
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
  const form = useForm<zod.infer<typeof schema>>();

  const handleSubmit = form.handleSubmit(async ({ thumbnail }) => {
    try {
      const uploadedMedia = await (async function upload() {
        if (thumbnail) {
          const fileReq = await sdk.admin.upload.create({ files: [thumbnail.file] });
          return fileReq.files[0];
        }

        return null;
      })();

      const result = await sdk.admin.productCategory.update(category.id, {
        metadata: { thumbnail: thumbnail?.url },
      } as any);

      // Show success toast
      toast.success("Category updated successfully", {
        description: `Successfully updated category's image`,
      });

      onOpenChange(false);
      if (onSubmitSuccess) onSubmitSuccess();
      return result;
    } catch (error: any) {
      toast.error("Category image update failed", { description: error.message });
    }
  });

  function handleAppend(media: Media) {
    form.setValue("thumbnail", media);
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content>
        <FormProvider {...form}>
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
            <Drawer.Header>
              <Heading className="capitalize">Edit How-to-use</Heading>
            </Drawer.Header>
            <Drawer.Body className="flex max-w-full flex-1 flex-col gap-y-8 overflow-y-auto">
              <div className="w-full">
                <UploadMediaFormItem form={form} append={handleAppend} multiple={false} />
              </div>
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

const CategoryImage = ({ data: passedCategory }: DetailWidgetProps<AdminProductCategory>) => {
  const { data: categoryResponse, mutate } = useSWR(["category", passedCategory.id], () =>
    sdk.admin.productCategory.retrieve(passedCategory.id)
  );

  const [isOpen, setIsOpen] = useState(false);

  const thumbnail = categoryResponse?.product_category.metadata?.thumbnail as string | undefined;

  return (
    <Container className="divide-y p-0">
      <Toaster />

      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Thumbnail</Heading>

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

      {thumbnail ? (
        <div className="px-6 py-4">
          <img className="object-cover bg-clip-border rounded-md aspect-square w-40" src={thumbnail} alt="" />
        </div>
      ) : (
        <></>
      )}

      <EditForm
        open={isOpen}
        onOpenChange={setIsOpen}
        category={categoryResponse?.product_category || passedCategory}
        onSubmitSuccess={mutate}
      />
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "product_category.details.side.after",
});

export default CategoryImage;
