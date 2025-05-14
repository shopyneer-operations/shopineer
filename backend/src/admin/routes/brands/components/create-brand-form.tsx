import { FocusModal, Heading, Label, Input, Button, toast, Toaster } from "@medusajs/ui";
import { useForm, FormProvider, Controller } from "react-hook-form";
import * as z from "zod";
import { Plus } from "@medusajs/icons";
import { sdk } from "../../../lib/sdk";
import { Brand } from "../../../lib/types/brand";
import { KeyedMutator } from "swr";
import { useState } from "react";
import { Media, MediaSchema, UploadMediaFormItem } from "../../../components/upload-media-form-item";
import { PaginatedResponse } from "@medusajs/framework/types";

const schema = z.object({
  name: z.string(),
  description: z.string().optional(),
  image: MediaSchema.optional(),
});

export const CreateBrandForm = ({ mutate }: { mutate: KeyedMutator<PaginatedResponse<{ brands: Brand[] }>> }) => {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      const uploadedMedia = await (async function upload() {
        if (data.image) {
          const fileReq = await sdk.admin.upload.create({ files: [data.image.file] });
          return fileReq.files[0];
        }

        return null;
      })();

      const result = await sdk.client.fetch<Brand>(`/admin/brands`, {
        method: "POST",
        body: { ...data, image: uploadedMedia?.url || null },
      });
      mutate();
      setIsOpen(false);

      // Show success toast
      toast.success("تم إنشاء الماركة", { description: `تم إنشاء الماركة بنجاح: ${JSON.stringify(data)}` });

      return result;
    } catch (error: any) {
      toast.error("فشل إنشاء الماركة", { description: `فشل إنشاء الماركة: ${error.message}` });
    }
  });

  function handleAppend(media: Media) {
    form.setValue("image", media);
  }

  return (
    <>
      <Toaster />

      <FocusModal open={isOpen} onOpenChange={setIsOpen}>
        <FocusModal.Trigger asChild>
          <Button variant="secondary">
            <Plus /> إضافة ماركة
          </Button>
        </FocusModal.Trigger>
        <FocusModal.Content>
          <FormProvider {...form}>
            <form onSubmit={handleSubmit} className="flex h-full flex-col overflow-hidden">
              <FocusModal.Header>
                <div className="flex items-center justify-end gap-x-2">
                  <FocusModal.Close asChild>
                    <Button size="small" variant="secondary">
                      إلغاء
                    </Button>
                  </FocusModal.Close>
                  <Button type="submit" size="small">
                    حفظ
                  </Button>
                </div>
              </FocusModal.Header>
              <FocusModal.Body>
                <div className="flex flex-1 flex-col items-center overflow-y-auto">
                  <div className="mx-auto flex w-full max-w-[720px] flex-col gap-y-8 px-2 py-16">
                    <div>
                      <Heading className="capitalize">إضافة ماركة</Heading>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
                      <Controller
                        control={form.control}
                        name="name"
                        render={({ field }) => {
                          return (
                            <div className="flex-1 flex flex-col space-y-2">
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
                            <div className="flex-1 flex flex-col space-y-2">
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
                    </div>
                  </div>
                </div>
              </FocusModal.Body>
            </form>
          </FormProvider>
        </FocusModal.Content>
      </FocusModal>
    </>
  );
};
