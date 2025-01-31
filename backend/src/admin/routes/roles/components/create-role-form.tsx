import { z } from "zod";
import { PermissionType, Role } from "../../../lib/types/role";
import { useEffect, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { sdk } from "../../../lib/sdk";
import useStore from "../../../lib/hooks/use-store";
import { Button, FocusModal, Heading, Input, Label, toast, Toaster } from "@medusajs/ui";
import { Plus } from "@medusajs/icons";
import { permissions, REQUIRED_PERMISSIONS } from "../../../lib/data/permissions";
import PermissionSwitches from "./permission-switchs";

const roleSchema = z.object({
  name: z.string(),
  store_id: z.string(),
  permissions: z.array(
    z.object({
      name: z.string(),
      path: z.string(),
      method: z.nativeEnum(PermissionType),
    })
  ),
});

export const CreateRoleForm = ({ onSubmit }: { onSubmit: Function }) => {
  const { store } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof roleSchema>>({
    defaultValues: {
      name: "",
      store_id: "",
      permissions: [],
    },
  });
  const selectedPermissions = form.watch("permissions");

  useEffect(
    function setStoreId() {
      if (store) form.setValue("store_id", store.id);
    },
    [store]
  );

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      const result = await sdk.client.fetch<Role>(`/admin/roles`, {
        method: "POST",
        body: data,
      });
      onSubmit();
      setIsOpen(false);

      // Show success toast
      toast.success("Role created", { description: `Successfully created role: ${data.name}` });

      return result;
    } catch (error: any) {
      toast.error("Role creation failed", { description: `Failed to create role: ${error.message}` });
    }
  });

  return (
    <>
      <Toaster />

      <FocusModal open={isOpen} onOpenChange={setIsOpen}>
        <FocusModal.Trigger asChild>
          <Button variant="secondary">
            <Plus /> Add
          </Button>
        </FocusModal.Trigger>
        <FocusModal.Content className="overflow-auto">
          <FormProvider {...form}>
            <form onSubmit={handleSubmit} className="flex h-full flex-col overflow-visible">
              <FocusModal.Header>
                <div className="flex items-center justify-end gap-x-2">
                  <FocusModal.Close asChild>
                    <Button size="small" variant="secondary">
                      Cancel
                    </Button>
                  </FocusModal.Close>
                  <Button type="submit" size="small">
                    Save
                  </Button>
                </div>
              </FocusModal.Header>
              <FocusModal.Body>
                <div className="flex flex-1 flex-col items-center overflow-y-auto">
                  <div className="mx-auto flex w-full max-w-[720px] flex-col gap-y-8 px-2 py-16">
                    <div>
                      <Heading className="capitalize">Add Role</Heading>
                    </div>
                    <div>
                      <Controller
                        control={form.control}
                        name="name"
                        render={({ field }) => {
                          return (
                            <div className="flex-1 flex flex-col space-y-2">
                              <div className="flex items-center gap-x-1">
                                <Label size="small" weight="plus">
                                  Name
                                </Label>
                              </div>
                              <Input {...field} />
                            </div>
                          );
                        }}
                      />
                    </div>

                    <PermissionSwitches
                      permissions={permissions}
                      selectedPermissions={selectedPermissions}
                      onChange={(newPermissions) => form.setValue("permissions", newPermissions)}
                    />
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
