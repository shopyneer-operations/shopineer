import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Container, Heading, Select, toast, Toaster } from "@medusajs/ui";
import { useState } from "react";
import useIsAuthorized from "../../../lib/hooks/use-is-authorized";
import { Resource } from "../../../lib/data/permissions";
import UnauthorizedMessage from "../../../components/unauthorized-message";
import useSWR from "swr";
import { constants } from "../../../lib/constants";
import { sdk } from "../../../lib/sdk";
import { AdminUser, PaginatedResponse } from "@medusajs/framework/types";
import { Table } from "../../../components/table";
import { Role } from "../../../lib/types/role";
import { curry, filter, matchesProperty, negate } from "lodash";

type Props = {};

export default function UserRolePage({}: Props) {
  const { isAuthorized, isLoading } = useIsAuthorized(Resource.roles);
  const [currentPage, setCurrentPage] = useState(0);
  const offset = currentPage * constants.USERS_LIMIT;

  const { data: usersData, mutate: mutateUsers } = useSWR(["roles-users", isLoading, isAuthorized], async () => {
    if (isLoading || !isAuthorized) {
      return { users: [], count: 0, offset: 0, limit: 0 };
    }

    const result = await sdk.admin.user.list(
      //   { fields: "+roles", limit: constants.USERS_LIMIT, offset },
      { fields: "*role", limit: constants.USERS_LIMIT, offset },
      { next: { tags: ["users"] } }
    );

    // Filter out super admins (they don't have role property)
    result.users = filter(result.users, negate(matchesProperty("metadata.is_super_admin", true)));

    return result;
  });

  const { data: rolesData } = useSWR(["roles", offset, isLoading, isAuthorized], () => {
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

  const assignRole = curry(async function assignRole(userId: string, roleId: string) {
    try {
      const result = await sdk.client.fetch(`/admin/roles/${roleId}/users/${userId}`, { method: "POST" });

      // Update UI
      mutateUsers();

      // Show success toast
      toast.success("Role assigned", { description: `Assigned role: ${roleId} to user: ${userId} successfully` });

      return result;
    } catch (error: any) {
      toast.error("Role assign failed", { description: error.message });
    }
  });

  return (
    <Container className="divide-y p-0">
      <Toaster />

      {!isAuthorized && <UnauthorizedMessage resource={Resource.roles} />}

      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Users</Heading>
      </div>

      <Table
        columns={[
          {
            key: "",
            label: "Name",
            render(user: AdminUser) {
              if (!user.first_name || !user.last_name) {
                return "_";
              }

              return user.first_name + " " + user.last_name;
            },
          },
          {
            key: "email",
            label: "Email",
          },
          {
            key: "role.name",
            label: "Role",
            render(user: AdminUser & { role: Role }) {
              return (
                <div className="w-44">
                  <Select value={user.role?.id} onValueChange={assignRole(user.id)}>
                    <Select.Trigger>
                      <Select.Value placeholder="Select a role" />
                    </Select.Trigger>
                    <Select.Content>
                      {rolesData?.roles.map((item) => (
                        <Select.Item key={item.id} value={item.id}>
                          {item.name}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </div>
              );
            },
          },
        ]}
        data={usersData?.users || []}
        pageSize={usersData?.limit || constants.USERS_LIMIT}
        count={usersData?.count || 0}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </Container>
  );
}

export const config = defineRouteConfig({
  label: "Users",
});
