import { z } from "zod";
import { PermissionType, Role } from "../../../lib/types/role";
import { useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { sdk } from "../../../lib/sdk";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Drawer, Heading, Input, Label, toast, Toaster } from "@medusajs/ui";
import { PencilSquare } from "@medusajs/icons";
import { permissions } from "../../../lib/data/permissions";
import PermissionSwitches from "./permission-switchs";

const editRoleSchema = z.object({
  name: z.string(),
  permissions: z.array(
    z.object({
      name: z.string(),
      path: z.string(),
      method: z.nativeEnum(PermissionType),
    })
  ),
});

export const EditRoleForm = ({ role, onSubmit }: { role: Role; onSubmit: Function }) => {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof editRoleSchema>>({
    defaultValues: {
      name: role.name,
      permissions: role.permissions,
    },
    resolver: zodResolver(editRoleSchema as any),
  });
  const selectedPermissions = form.watch("permissions");

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      const result = await sdk.client.fetch<Role>(`/admin/roles/${role.id}`, {
        method: "PUT",
        body: data,
      });
      onSubmit();
      setIsOpen(false);

      // Show success toast
      toast.success("Role updated", { description: `Successfully updated role: ${data.name}` });

      return result;
    } catch (error: any) {
      toast.error("Role update failed", { description: `Failed to update role: ${error.message}` });
    }
  });

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
            <form onSubmit={handleSubmit} className="flex h-full flex-col overflow-visible">
              <Drawer.Header>
                <Heading className="capitalize">Edit Item</Heading>
              </Drawer.Header>
              <Drawer.Body className="flex max-w-full flex-1 flex-col gap-y-8 overflow-y-auto">
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
                  onChange={(permissions) => form.setValue("permissions", permissions)}
                />
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
    </>
  );
};
