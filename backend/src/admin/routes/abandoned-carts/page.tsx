import { useState } from "react";
import { Resource } from "../../lib/data/permissions";
import useIsAuthorized from "../../lib/hooks/use-is-authorized";
import { constants } from "../../lib/constants";
import useSWR from "swr";
import { CartDTO, PaginatedResponse } from "@medusajs/framework/types";
import { sdk } from "../../lib/sdk";
import { Container, Heading } from "@medusajs/ui";
import UnauthorizedMessage from "../../components/unauthorized-message";
import { Table } from "../../components/table";
import { sumBy } from "lodash";
import { defineRouteConfig } from "@medusajs/admin-sdk";
import { HandTruck } from "@medusajs/icons";
import { format } from "date-fns/format";

export default function AbandonedCartsPage() {
  const { isAuthorized, isLoading } = useIsAuthorized(Resource["abandoned-carts"]);
  const [currentPage, setCurrentPage] = useState(0);
  const offset = currentPage * constants.ABANDONED_CARTS_LIMIT;

  const { data } = useSWR(["abandoned-carts", offset, isAuthorized], async () => {
    if (isLoading || !isAuthorized) {
      return { abandonedCarts: [], count: 0, offset: 0, limit: 0 };
    }

    return sdk.client.fetch<PaginatedResponse<{ abandonedCarts: CartDTO[] }>>(`/admin/abandoned-carts`, {
      query: {
        limit: constants.ABANDONED_CARTS_LIMIT,
        offset,
      },
    });
  });

  return (
    <Container className="divide-y p-0">
      {!isAuthorized && <UnauthorizedMessage resource={Resource["abandoned-carts"]} />}

      <div className="flex items-center justify-between px-6 py-4">
        {/* <div> */}
        <Heading level="h2">العربات المتروكة</Heading>
        {/* </div> */}

        {/* <CreateBrandForm mutate={mutate} /> */}
      </div>

      <Table
        columns={[
          {
            key: "id",
            label: "#",
          },
          {
            key: "",
            label: "الاسم",
            render(cart: CartDTO) {
              if (!cart.shipping_address?.first_name || !cart.shipping_address?.last_name) {
                return "_";
              }

              return `${cart.shipping_address.first_name} ${cart.shipping_address.last_name}`;
            },
          },
          {
            key: "email",
            label: "البريد الإلكتروني",
          },
          {
            key: "shipping_address.phone",
            label: "الهاتف",
          },
          {
            key: "",
            label: "الكمية",
            render(cart: CartDTO) {
              return sumBy(cart.items, "quantity");
            },
          },
          {
            key: "",
            label: "تاريخ الإنشاء",
            render(cart: CartDTO) {
              if (!cart.created_at) return "_";

              return format(cart.created_at, "MMMM dd, yyyy hh:mm a");
            },
          },
          {
            key: "total",
            label: "المبلغ",
          },
          //   {
          //     key: "actions",
          //     label: "Actions",
          //     render(brand: Brand) {
          //       return (
          //         <div className="flex items-center gap-x-2">
          //           {/* Edit */}
          //           <EditBrandForm mutate={mutate} brand={brand} />

          //           {/* Delete */}
          //           <Button type="button" onClick={() => deleteBrand(brand.id)} variant="danger">
          //             <Trash />
          //           </Button>
          //         </div>
          //       );
          //     },
          //   },
        ]}
        data={data?.abandonedCarts || []}
        pageSize={data?.limit || constants.BRANDS_LIMIT}
        count={data?.count || 0}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </Container>
  );
}

export const config = defineRouteConfig({
  label: "العربات المتروكة",
  icon: HandTruck,
});
