import { Drawer, Heading, Label, Input, Button, toast, Toaster } from "@medusajs/ui";
import { useState } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { KeyedMutator } from "swr";
import * as zod from "zod";
import { Brand } from "../../../lib/types/brand";
import { sdk } from "../../../lib/sdk";
import { PencilSquare, Trash } from "@medusajs/icons";
import { PaginatedResponse } from "@medusajs/framework/types";
import { Media, MediaSchema, UploadMediaFormItem } from "../../../components/upload-media-form-item";

const schema = zod.object({
  name: zod.string(),
  description: zod.string().optional(),
  image: MediaSchema.optional(),
});

export const EditBrandForm = ({
  mutate,
  brand,
}: {
  mutate: KeyedMutator<PaginatedResponse<{ brands: Brand[] }>>;
  brand: Brand;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<zod.infer<typeof schema>>({
    defaultValues: {
      name: brand.name,
      description: brand.description,
      image: brand.image ? { url: brand.image, file: null } : undefined,
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      const uploadedMedia = await (async function upload() {
        if (data.image && data.image.file) {
          const fileReq = await sdk.admin.upload.create({ files: [data.image.file] });
          return fileReq.files[0];
        }

        return null;
      })();

      const result = await sdk.client.fetch<Brand>(`/admin/brands/${brand.id}`, {
        method: "PUT",
        body: {
          ...data,
          image: uploadedMedia?.url || data.image?.url || null,
        },
      });
      mutate();
      setIsOpen(false);

      // Show success toast
      toast.success("تم تحديث الماركة", { description: `تم تحديث الماركة بنجاح: ${JSON.stringify(data)}` });

      return result;
    } catch (error: any) {
      toast.error("فشل تحديث الماركة", { description: `فشل تحديث الماركة: ${error.message}` });
    }
  });

  function handleAppend(media: Media) {
    form.setValue("image", media);
  }

  function handleRemoveImage() {
    form.setValue("image", undefined);
  }

  // Watch the image field to show preview
  const currentImage = form.watch("image");

  return (
    <>
      <Toaster />

      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <Drawer.Trigger asChild>
          <Button variant="secondary">
            <PencilSquare />
          </Button>
        </Drawer.Trigger>
        <Drawer.Content>
          <FormProvider {...form}>
            <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
              <Drawer.Header>
                <Heading className="capitalize">تحديث الماركة</Heading>
              </Drawer.Header>
              <Drawer.Body className="flex max-w-full flex-1 flex-col gap-y-8 overflow-y-auto">
                <Controller
                  control={form.control}
                  name="name"
                  render={({ field }) => {
                    return (
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center gap-x-1">
                          <Label size="small" weight="plus">
                            الاسم
                          </Label>
                        </div>
                        <Input {...field} />
                      </div>
                    );
                  }}
                />
                <Controller
                  control={form.control}
                  name="description"
                  render={({ field }) => {
                    return (
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center gap-x-1">
                          <Label size="small" weight="plus">
                            الوصف
                          </Label>
                        </div>
                        <Input {...field} />
                      </div>
                    );
                  }}
                />
                <div className="w-full">
                  <UploadMediaFormItem form={form} append={handleAppend} multiple={false} />
                </div>

                {/* Display current image preview */}
                {currentImage && (
                  <div className="w-full">
                    <h3 className="text-sm font-medium mb-3">الصورة المحددة:</h3>
                    <div className="relative inline-block group">
                      <img
                        src={currentImage.url}
                        alt="Brand image preview"
                        className="w-32 h-32 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
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
    </>
  );
};
