import { FocusModal, Heading, Label, Input, Button, toast, Toaster } from "@medusajs/ui";
import { useForm, FormProvider, Controller } from "react-hook-form";
import * as zod from "zod";
import { Plus } from "@medusajs/icons";
import { sdk } from "../../../lib/sdk";
import { Supplier } from "../../../lib/types/supplier";
import { KeyedMutator } from "swr";
import { useState } from "react";
import { PaginatedResponse } from "@medusajs/framework/types";

const schema = zod.object({
  name: zod.string(),
  contact_person: zod.string().optional(),
  email: zod.string().email().optional(),
  phone: zod.string().optional(),
});

export const CreateSupplierForm = ({
  mutate,
}: {
  mutate: KeyedMutator<PaginatedResponse<{ suppliers: Supplier[] }>>;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<zod.infer<typeof schema>>({
    defaultValues: {
      name: "",
      contact_person: "",
      email: "",
      phone: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      const result = await sdk.client.fetch<Supplier>(`/admin/suppliers`, {
        method: "POST",
        body: data,
      });
      mutate();
      setIsOpen(false);

      // Show success toast
      toast.success("تم إنشاء المورد", { description: `تم إنشاء المورد بنجاح: ${JSON.stringify(data)}` });

      return result;
    } catch (error: any) {
      toast.error("فشل إنشاء المورد", { description: `فشل إنشاء المورد: ${error.message}` });
    }
  });

  return (
    <>
      <Toaster />

      <FocusModal open={isOpen} onOpenChange={setIsOpen}>
        <FocusModal.Trigger asChild>
          <Button variant="secondary">
            <Plus /> إضافة مورد
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
                      <Heading className="capitalize">إضافة مورد</Heading>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
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
                        name="contact_person"
                        render={({ field }) => {
                          return (
                            <div className="flex flex-col space-y-2">
                              <div className="flex items-center gap-x-1">
                                <Label size="small" weight="plus">
                                  المستخدم المرافق
                                </Label>
                              </div>
                              <Input {...field} />
                            </div>
                          );
                        }}
                      />
                      <Controller
                        control={form.control}
                        name="email"
                        render={({ field }) => {
                          return (
                            <div className="flex flex-col space-y-2">
                              <div className="flex items-center gap-x-1">
                                <Label size="small" weight="plus">
                                  البريد الإلكتروني
                                </Label>
                              </div>
                              <Input {...field} />
                            </div>
                          );
                        }}
                      />
                      <Controller
                        control={form.control}
                        name="phone"
                        render={({ field }) => {
                          return (
                            <div className="flex flex-col space-y-2">
                              <div className="flex items-center gap-x-1">
                                <Label size="small" weight="plus">
                                  الهاتف
                                </Label>
                              </div>
                              <Input {...field} />
                            </div>
                          );
                        }}
                      />
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
