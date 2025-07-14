import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { AdminStore, DetailWidgetProps } from "@medusajs/framework/types";
import { Button, Container, Drawer, Heading, toast, Toaster } from "@medusajs/ui";
import { ActionMenu } from "./action-menu";
import { PencilSquare } from "@medusajs/icons";
import { useState, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as zod from "zod";
import { SliderItem, SliderItemSchema, SliderItemForm, SliderItemDisplay } from "./slider-item-form";
import { sdk } from "../lib/sdk";
import useSWR from "swr";

const schema = zod.object({
  sliderImages: zod.array(SliderItemSchema).optional(),
});

export interface SliderWidgetConfig {
  title: string;
  metadataKey: string;
  countKey: string;
  successMessage: string;
  errorMessage: string;
}

export const EditForm = ({
  open,
  onOpenChange,
  store,
  onSubmitSuccess,
  config,
}: {
  open: boolean;
  onOpenChange(open: boolean): void;
  store: AdminStore;
  onSubmitSuccess?: () => void;
  config: SliderWidgetConfig;
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
      const newImages = uploadedImages.map((file) => ({ url: file.url, link: "" }));
      const allImages = [...existingImages, ...newImages];

      const result = await sdk.admin.store.update(store.id, {
        metadata: {
          ...store.metadata,
          [config.metadataKey]: allImages.map((image) => ({
            url: image.url,
            link: image.link || "",
          })),
          [config.countKey]: allImages.length,
        },
      });

      // Show success toast
      toast.success(config.successMessage, {
        description: `تم تحديث ${allImages.length} صورة`,
      });

      onOpenChange(false);
      if (onSubmitSuccess) onSubmitSuccess();
      return result;
    } catch (error: any) {
      toast.error(config.errorMessage, { description: error.message });
    }
  });

  function handleAppend(media: SliderItem) {
    const currentImages = form.getValues("sliderImages") || [];
    form.setValue("sliderImages", [...currentImages, media]);
  }

  function handleRemoveImage(index: number) {
    const currentImages = form.getValues("sliderImages") || [];
    const updatedImages = currentImages.filter((_, i) => i !== index);
    form.setValue("sliderImages", updatedImages);
  }

  function handleUpdateLink(index: number, link: string) {
    const currentImages = form.getValues("sliderImages") || [];
    const updatedImages = [...currentImages];
    updatedImages[index] = { ...updatedImages[index], link };
    form.setValue("sliderImages", updatedImages);
  }

  // Initialize form with existing images
  useEffect(() => {
    const existingImages = store.metadata?.[config.metadataKey] || [];
    if (existingImages.length > 0) {
      const mediaImages = existingImages.map((item: any) => ({
        url: typeof item === "string" ? item : item.url,
        file: null,
        link: typeof item === "string" ? "" : item.link || "",
      }));
      form.setValue("sliderImages", mediaImages);
    }
  }, [store.metadata?.[config.metadataKey], form, config.metadataKey]);

  const currentImages = form.watch("sliderImages") || [];

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content>
        <FormProvider {...form}>
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
            <Drawer.Header>
              <Heading className="capitalize">{config.title}</Heading>
            </Drawer.Header>
            <Drawer.Body className="flex max-w-full flex-1 flex-col gap-y-8 overflow-y-auto">
              <div className="w-full">
                <SliderItemForm form={form} append={handleAppend} multiple={true} />
              </div>

              {/* Display current images */}
              {currentImages.length > 0 && (
                <div className="w-full">
                  <h3 className="text-sm font-medium mb-3">الصور المحددة:</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {currentImages.map((image, index) => (
                      <SliderItemDisplay
                        key={index}
                        item={image}
                        index={index}
                        onRemove={() => handleRemoveImage(index)}
                        onUpdateLink={(link) => handleUpdateLink(index, link)}
                      />
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

export const createSliderWidget = (config: SliderWidgetConfig) => {
  const SliderWidget = ({ data }: DetailWidgetProps<AdminStore>) => {
    const { data: store, mutate } = useSWR(["store", data.id], async () => {
      const result = await sdk.admin.store.retrieve(data.id);
      return result.store;
    });

    const [isOpen, setIsOpen] = useState(false);

    const sliderImages = store?.metadata?.[config.metadataKey] as any[] | undefined;
    const imageCount = sliderImages?.length || 0;

    return (
      <Container className="divide-y p-0">
        <Toaster />

        <div className="flex items-center justify-between px-6 py-4">
          <Heading level="h2">{config.title}</Heading>

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
                {sliderImages?.slice(0, 6).map((item, index) => {
                  const imageUrl = typeof item === "string" ? item : item.url;
                  return (
                    <div key={index} className="relative">
                      <img
                        src={imageUrl}
                        alt={`Slider preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded-md"
                      />
                      {typeof item !== "string" && item.link && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                          رابط: {item.link}
                        </div>
                      )}
                    </div>
                  );
                })}
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

        <EditForm
          open={isOpen}
          onOpenChange={setIsOpen}
          store={store || data}
          onSubmitSuccess={mutate}
          config={config}
        />
      </Container>
    );
  };

  return SliderWidget;
};
