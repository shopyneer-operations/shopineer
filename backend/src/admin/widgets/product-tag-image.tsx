import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { DetailWidgetProps } from "@medusajs/framework/types";
import { Button, Container, Drawer, Heading, toast, Toaster } from "@medusajs/ui";
import { ActionMenu } from "../components/action-menu";
import { PencilSquare } from "@medusajs/icons";
import { useState, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as zod from "zod";
import { Media, MediaSchema, UploadMediaFormItem } from "../components/upload-media-form-item";
import { sdk } from "../lib/sdk";
import useSWR from "swr";

// Define the product tag type with metadata
type AdminProductTag = {
  id: string;
  value: string;
  metadata?: Record<string, unknown> | null;
};

const schema = zod.object({
  thumbnail: MediaSchema.optional(),
});

export const EditForm = ({
  open,
  onOpenChange,
  productTag,
  onSubmitSuccess,
}: {
  open: boolean;
  onOpenChange(open: boolean): void;
  productTag: AdminProductTag;
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

      // Update the product tag with the new image
      const result = await sdk.admin.productTag.update(productTag.id, {
        metadata: {
          ...((productTag.metadata as Record<string, unknown>) || {}),
          thumbnail: uploadedMedia?.url || thumbnail?.url,
        },
      });

      // Show success toast
      toast.success("تم تحديث علامة المنتج بنجاح", {
        description: `تم تحديث صورة علامة المنتج`,
      });

      onOpenChange(false);
      if (onSubmitSuccess) onSubmitSuccess();
      return result;
    } catch (error: any) {
      toast.error("فشل تحديث صورة علامة المنتج", { description: error.message });
    }
  });

  function handleAppend(media: Media) {
    form.setValue("thumbnail", media);
  }

  // Initialize form with existing image
  useEffect(() => {
    const existingThumbnail = (productTag.metadata as Record<string, unknown>)?.thumbnail;
    if (existingThumbnail) {
      const mediaImage: Media = { url: existingThumbnail as string, file: null };
      form.setValue("thumbnail", mediaImage);
    }
  }, [productTag.metadata, form]);

  const currentThumbnail = form.watch("thumbnail");

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content>
        <FormProvider {...form}>
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
            <Drawer.Header>
              <Heading className="capitalize">تعديل صورة علامة المنتج</Heading>
            </Drawer.Header>
            <Drawer.Body className="flex max-w-full flex-1 flex-col gap-y-8 overflow-y-auto">
              <div className="w-full">
                <UploadMediaFormItem form={form} append={handleAppend} multiple={false} />
              </div>

              {/* Display current image preview */}
              {currentThumbnail && (
                <div className="w-full">
                  <h3 className="text-sm font-medium mb-3">الصورة المحددة:</h3>
                  <div className="relative group">
                    <img
                      src={currentThumbnail.url}
                      alt="Product tag thumbnail preview"
                      className="w-full object-cover rounded-md"
                    />
                  </div>
                </div>
              )}
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

const ProductTagImage = ({ data: passedProductTag }: DetailWidgetProps<AdminProductTag>) => {
  const { data: productTagResponse, mutate } = useSWR(["product-tag", passedProductTag.id], () =>
    sdk.admin.productTag.retrieve(passedProductTag.id)
  );

  const [isOpen, setIsOpen] = useState(false);

  const thumbnail = (productTagResponse?.product_tag.metadata as Record<string, unknown>)?.thumbnail as
    | string
    | undefined;

  return (
    <Container className="divide-y p-0">
      <Toaster />

      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">صورة علامة المنتج</Heading>

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

      {thumbnail ? (
        <div className="px-6 py-4">
          <img className="object-cover bg-clip-border rounded-md aspect-square w-40" src={thumbnail} alt="" />
        </div>
      ) : (
        <p className="px-6 py-4 text-sm text-ui-fg-subtle">لا توجد صورة لعلامة المنتج. اضغط على "تعديل" لإضافة صورة.</p>
      )}

      <EditForm
        open={isOpen}
        onOpenChange={setIsOpen}
        productTag={productTagResponse?.product_tag || passedProductTag}
        onSubmitSuccess={mutate}
      />
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "product_tag.details.after",
});

export default ProductTagImage;
