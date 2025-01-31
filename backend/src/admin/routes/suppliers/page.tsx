import { Container, Heading, Toaster, toast, Button } from "@medusajs/ui";
import { TruckFast, Trash } from "@medusajs/icons";
import { defineRouteConfig } from "@medusajs/admin-sdk";
import { sdk } from "../../lib/sdk";
import { useState } from "react";
import useSWR from "swr";
import { Table } from "../../components/table";
import { IconProps } from "@medusajs/icons/dist/types";
import { CreateSupplierForm } from "./components/create-supplier-form";
import { Supplier } from "../../lib/types/supplier";
import { EditSupplierForm } from "./components/edit-supplier-form";
import { constants } from "../../lib/constants";
import useIsAuthorized from "../../lib/hooks/use-is-authorized";
import { Resource } from "../../lib/data/permissions";
import UnauthorizedMessage from "../../components/unauthorized-message";
import { PaginatedResponse } from "@medusajs/framework/types";

type Action = {
  label: string;
  Icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<SVGSVGElement>>;
  onClick(supplierId: string): Promise<any>;
};

export default function SuppliersPage() {
  const { isAuthorized, isLoading } = useIsAuthorized(Resource.suppliers);
  const [currentPage, setCurrentPage] = useState(0);
  const offset = currentPage * constants.SUPPLIERS_LIMIT;

  const { data, mutate } = useSWR(["suppliers", offset], async () => {
    if (isLoading || !isAuthorized) {
      return { suppliers: [], count: 0, offset: 0, limit: 0 };
    }

    return sdk.client.fetch<PaginatedResponse<{ suppliers: Supplier[] }>>(`/admin/suppliers`, {
      query: {
        limit: constants.SUPPLIERS_LIMIT,
        offset,
      },
    });
  });

  async function deleteSupplier(id: string) {
    const { supplierId } = await sdk.client.fetch<{ supplierId: string }>(`/admin/suppliers/${id}`, {
      method: "DELETE",
    });
    mutate();

    // Show success toast
    toast.success("Supplier deleted", { description: `Supplier with ID: ${supplierId} deleted successfully` });

    return supplierId;
  }

  // const actions: Action[] = [
  //   {
  //     label: "Delete",
  //     Icon: Trash,
  //     onClick: deleteSupplier,
  //   },
  // ];

  return (
    <Container className="divide-y p-0">
      <Toaster />

      {!isAuthorized && <UnauthorizedMessage resource={Resource.suppliers} />}

      <div className="flex items-center justify-between px-6 py-4">
        {/* <div> */}
        <Heading level="h2">Suppliers</Heading>
        {/* </div> */}

        <CreateSupplierForm mutate={mutate} />
      </div>

      <Table
        columns={[
          {
            key: "id",
            label: "#",
          },
          {
            key: "name",
            label: "Name",
          },
          {
            key: "contact_person",
            label: "Contact Person",
          },
          {
            key: "email",
            label: "Email",
          },
          {
            key: "phone",
            label: "Phone",
          },

          {
            key: "products.length",
            label: "Products",
          },
          {
            key: "actions",
            label: "Actions",
            render(supplier: Supplier) {
              return (
                <div className="flex items-center gap-x-2">
                  {/* Edit */}
                  <EditSupplierForm mutate={mutate} supplier={supplier} />

                  {/* Delete */}
                  <Button type="button" onClick={() => deleteSupplier(supplier.id)} variant="danger">
                    <Trash />
                  </Button>
                </div>
              );
            },
          },
        ]}
        data={data?.suppliers || []}
        pageSize={data?.limit || constants.SUPPLIERS_LIMIT}
        count={data?.count || 0}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </Container>
  );
}

// function ActionsMenu({ supplier, actions }: { supplier: Supplier; actions: Action[] }) {
//   return (
//     <DropdownMenu>
//       <DropdownMenu.Trigger asChild>
//         <IconButton>
//           <EllipsisHorizontal />
//         </IconButton>
//       </DropdownMenu.Trigger>
//       <DropdownMenu.Content>
//         {actions.map(({ label, onClick, Icon }) => (
//           <DropdownMenu.Item key={label} className="gap-x-2" onClick={() => onClick(supplier.id)}>
//             <Icon className="text-ui-fg-subtle" />
//             {label}
//           </DropdownMenu.Item>
//         ))}
//       </DropdownMenu.Content>
//     </DropdownMenu>
//   );
// }

export const config = defineRouteConfig({
  label: "Suppliers",
  icon: TruckFast,
});
