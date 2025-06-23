import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { AdminCollection, DetailWidgetProps } from "@medusajs/framework/types";
import { Button, Container, Drawer, Heading, toast, Toaster } from "@medusajs/ui";
import { ActionMenu } from "../components/action-menu";
import { PencilSquare } from "@medusajs/icons";
import { useState, useEffect } from "react";
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
  collection,
  onSubmitSuccess,
}: {
  open: boolean;
  onOpenChange(open: boolean): void;
  collection: AdminCollection;
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

      const result = await sdk.admin.productCollection.update(collection.id, {
        metadata: {
          ...collection.metadata,
          thumbnail: thumbnail?.url,
        },
      } as any);

      // Show success toast
      toast.success("تم تحديث المجموعة بنجاح", {
        description: `تم تحديث صورة المجموعة`,
      });

      onOpenChange(false);
      if (onSubmitSuccess) onSubmitSuccess();
      return result;
    } catch (error: any) {
      toast.error("فشل تحديث صورة المجموعة", { description: error.message });
    }
  });

  function handleAppend(media: Media) {
    form.setValue("thumbnail", media);
  }

  // Initialize form with existing image
  useEffect(() => {
    const existingThumbnail = collection.metadata?.thumbnail;
    if (existingThumbnail) {
      const mediaImage: Media = { url: existingThumbnail as string, file: null };
      form.setValue("thumbnail", mediaImage);
    }
  }, [collection.metadata?.thumbnail, form]);

  const currentThumbnail = form.watch("thumbnail");

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content>
        <FormProvider {...form}>
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
            <Drawer.Header>
              <Heading className="capitalize">تعديل صورة المجموعة</Heading>
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
                      alt="Collection thumbnail preview"
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

const CollectionImage = ({ data: passedCollection }: DetailWidgetProps<AdminCollection>) => {
  const { data: collectionResponse, mutate } = useSWR(["collection", passedCollection.id], () =>
    sdk.admin.productCollection.retrieve(passedCollection.id)
  );

  const [isOpen, setIsOpen] = useState(false);

  const thumbnail = collectionResponse?.collection.metadata?.thumbnail as string | undefined;

  return (
    <Container className="divide-y p-0">
      <Toaster />

      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">صورة المجموعة</Heading>

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
        <p className="px-6 py-4 text-sm text-ui-fg-subtle">لا توجد صورة للمجموعة. اضغط على "تعديل" لإضافة صورة.</p>
      )}

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

export default CollectionImage;
