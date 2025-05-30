import { Drawer, Heading, Label, Input, Button, toast } from "@medusajs/ui";
import { useState } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { KeyedMutator } from "swr";
import * as zod from "zod";
import { Supplier } from "../../../lib/types/supplier";
import { sdk } from "../../../lib/sdk";
import { PencilSquare } from "@medusajs/icons";
import { PaginatedResponse } from "@medusajs/framework/types";

const schema = zod.object({
  name: zod.string(),
  contact_person: zod.string().optional(),
  email: zod.string().email().optional(),
  phone: zod.string().optional(),
});

export const EditSupplierForm = ({
  mutate,
  supplier,
}: {
  mutate: KeyedMutator<PaginatedResponse<{ suppliers: Supplier[] }>>;
  supplier: Supplier;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<zod.infer<typeof schema>>({
    defaultValues: {
      name: supplier.name,
      contact_person: supplier.contact_person,
      email: supplier.email,
      phone: supplier.phone,
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      const result = await sdk.client.fetch<Supplier>(`/admin/suppliers/${supplier.id}`, {
        method: "PUT",
        body: data,
      });
      mutate();
      setIsOpen(false);

      // Show success toast
      toast.success("تم تحديث المورد", { description: `تم تحديث المورد بنجاح: ${JSON.stringify(data)}` });

      return result;
    } catch (error: any) {
      toast.error("فشل تحديث المورد", { description: `فشل تحديث المورد: ${error.message}` });
    }
  });

  return (
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
              <Heading className="capitalize">تحديث المورد</Heading>
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
