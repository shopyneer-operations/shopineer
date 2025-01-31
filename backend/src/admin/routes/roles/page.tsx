import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Trash, UsersSolid } from "@medusajs/icons";
import { Button, Container, Heading, toast, Toaster } from "@medusajs/ui";
import { CreateRoleForm } from "./components/create-role-form";
import useSWR from "swr";
import { sdk } from "../../lib/sdk";
import { useState } from "react";
import { constants } from "../../lib/constants";
import useIsAuthorized from "../../lib/hooks/use-is-authorized";
import { Resource } from "../../lib/data/permissions";
import UnauthorizedMessage from "../../components/unauthorized-message";
import { PaginatedResponse } from "@medusajs/framework/types";
import { Role } from "../../lib/types/role";
import { Table } from "../../components/table";
import { EditRoleForm } from "./components/edit-role-form";

type Props = {};

export default function RolesPage({}: Props) {
  const { isAuthorized, isLoading } = useIsAuthorized(Resource.roles);
  const [currentPage, setCurrentPage] = useState(0);
  const offset = currentPage * constants.ROLES_LIMIT;

  const { data, mutate } = useSWR(["roles", offset, isLoading, isAuthorized], () => {
    if (isLoading || !isAuthorized) {
      return { roles: [], count: 0, offset: 0, limit: 0 };
    }

    return sdk.client.fetch<PaginatedResponse<{ roles: Role[] }>>(`/admin/roles`, {
      query: {
        limit: constants.ROLES_LIMIT,
        offset,
      },
    });
  });

  async function deleteRole(id: string) {
    try {
      const { roleId } = await sdk.client.fetch<{ roleId: string }>(`/admin/roles/${id}`, {
        method: "DELETE",
      });
      mutate();

      // Show success toast
      toast.success("Role deleted", { description: `Role with ID: ${roleId} deleted successfully` });

      return roleId;
    } catch (error: any) {
      toast.error("Role delete failed", { description: error.message });
    }
  }

  return (
    <Container className="divide-y p-0">
      <Toaster />

      {!isAuthorized && <UnauthorizedMessage resource={Resource.roles} />}

      <div className="flex items-center justify-between px-6 py-4">
        {/* <div> */}
        <Heading level="h2">Roles</Heading>
        {/* </div> */}

        <CreateRoleForm onSubmit={mutate} />
      </div>

      <Table
        columns={[
          // {
          //   key: "id",
          //   label: "#",
          // },
          {
            key: "name",
            label: "Name",
          },
          {
            key: "permissions.length",
            label: "Permissions",
          },
          {
            key: "users.length",
            label: "Assigned Users",
          },
          {
            key: "actions",
            label: "Actions",
            render(role: Role) {
              return (
                <div className="flex items-center gap-x-2">
                  {/* Edit */}
                  <EditRoleForm onSubmit={mutate} role={role} />

                  {/* Delete */}
                  <Button type="button" onClick={() => deleteRole(role.id)} variant="danger">
                    <Trash />
                  </Button>
                </div>
              );
            },
          },
        ]}
        data={data?.roles || []}
        pageSize={data?.limit || constants.ROLES_LIMIT}
        count={data?.count || 0}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </Container>
  );
}

export const config = defineRouteConfig({
  label: "Roles",
  icon: UsersSolid,
});
