import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { AdminStore, DetailWidgetProps } from "@medusajs/framework/types";
import { Button, Container, Drawer, Heading, toast, Toaster } from "@medusajs/ui";
import { ActionMenu } from "../components/action-menu";
import { PencilSquare, Trash } from "@medusajs/icons";
import { useState, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as zod from "zod";
import { Media, MediaSchema, UploadMediaFormItem } from "../components/upload-media-form-item";
import { sdk } from "../lib/sdk";
import useSWR from "swr";

const schema = zod.object({
  sliderImages: zod.array(MediaSchema).optional(),
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
  const form = useForm<zod.infer<typeof schema>>();

  const handleSubmit = form.handleSubmit(async ({ sliderImages }) => {
    try {
      const uploadedImages = await (async function upload() {
        if (sliderImages && sliderImages.length > 0) {
          const filesToUpload = sliderImages.filter((image) => image.file).map((image) => image.file);

          if (filesToUpload.length > 0) {
            const fileReq = await sdk.admin.upload.create({ files: filesToUpload });
            return fileReq.files;
          }
        }

        return [];
      })();

      // Combine existing URLs with newly uploaded files
      const existingImages = sliderImages?.filter((image) => !image.file) || [];
      const newImages = uploadedImages.map((file) => ({ url: file.url }));
      const allImages = [...existingImages, ...newImages];

      const result = await sdk.admin.store.update(store.id, {
        metadata: {
          ...store.metadata,
          slider_images: allImages.map((image) => image.url),
          slider_images_count: allImages.length,
        },
      });

      // Show success toast
      toast.success("تم تحديث صور السلايدر بنجاح", {
        description: `تم تحديث ${allImages.length} صورة`,
      });

      onOpenChange(false);
      if (onSubmitSuccess) onSubmitSuccess();
      return result;
    } catch (error: any) {
      toast.error("فشل تحديث صور السلايدر", { description: error.message });
    }
  });

  function handleAppend(media: Media) {
    const currentImages = form.getValues("sliderImages") || [];
    form.setValue("sliderImages", [...currentImages, media]);
  }

  function handleRemoveImage(index: number) {
    const currentImages = form.getValues("sliderImages") || [];
    const updatedImages = currentImages.filter((_, i) => i !== index);
    form.setValue("sliderImages", updatedImages);
  }

  // Initialize form with existing images
  useEffect(() => {
    const existingImages = store.metadata?.slider_images || [];
    if (existingImages.length > 0) {
      const mediaImages = existingImages.map((url: string) => ({ url, file: null }));
      form.setValue("sliderImages", mediaImages);
    }
  }, [store.metadata?.slider_images, form]);

  const currentImages = form.watch("sliderImages") || [];

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content>
        <FormProvider {...form}>
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
            <Drawer.Header>
              <Heading className="capitalize">تعديل صور السلايدر</Heading>
            </Drawer.Header>
            <Drawer.Body className="flex max-w-full flex-1 flex-col gap-y-8 overflow-y-auto">
              <div className="w-full">
                <UploadMediaFormItem form={form} append={handleAppend} multiple={true} />
              </div>

              {/* Display current images */}
              {currentImages.length > 0 && (
                <div className="w-full">
                  <h3 className="text-sm font-medium mb-3">الصور المحددة:</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {currentImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.url}
                          alt={`Slider image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
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

const SliderUploadWidget = ({ data }: DetailWidgetProps<AdminStore>) => {
  const { data: store, mutate } = useSWR(["store", data.id], async () => {
    const result = await sdk.admin.store.retrieve(data.id);
    return result.store;
  });

  const [isOpen, setIsOpen] = useState(false);

  const sliderImages = store?.metadata?.slider_images as string[] | undefined;
  const imageCount = sliderImages?.length || 0;

  return (
    <Container className="divide-y p-0">
      <Toaster />

      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">صور السلايدر للصفحة الرئيسية</Heading>

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
        {imageCount > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-ui-fg-subtle">عدد الصور: {imageCount}</p>
            <div className="grid grid-cols-3 gap-3">
              {sliderImages?.slice(0, 6).map((imageUrl, index) => (
                <img
                  key={index}
                  src={imageUrl}
                  alt={`Slider preview ${index + 1}`}
                  className="w-full h-20 object-cover rounded-md"
                />
              ))}
              {imageCount > 6 && (
                <div className="w-full h-20 bg-ui-bg-component rounded-md flex items-center justify-center text-sm text-ui-fg-subtle">
                  +{imageCount - 6} أكثر
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-ui-fg-subtle">لا توجد صور للسلايدر. اضغط على "تعديل" لإضافة صور.</p>
        )}
      </div>

      <EditForm open={isOpen} onOpenChange={setIsOpen} store={store || data} onSubmitSuccess={mutate} />
    </Container>
  );
};

// The widget's configurations
export const config = defineWidgetConfig({
  zone: "store.details.after",
});

export default SliderUploadWidget;
