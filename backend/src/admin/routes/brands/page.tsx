import { Container, Heading, Toaster, toast, Button } from "@medusajs/ui";
import { Trash, Sparkles } from "@medusajs/icons";
import { defineRouteConfig } from "@medusajs/admin-sdk";
import { sdk } from "../../lib/sdk";
import { useState } from "react";
import useSWR from "swr";
import { Table } from "../../components/table";
import { CreateBrandForm } from "./components/create-brand-form";
import { EditBrandForm } from "./components/edit-brand-form";
import { constants } from "../../lib/constants";
import { Brand } from "../../lib/types/brand";
import useIsAuthorized from "../../lib/hooks/use-is-authorized";
import { Resource } from "../../lib/data/permissions";
import UnauthorizedMessage from "../../components/unauthorized-message";
import { PaginatedResponse } from "@medusajs/framework/types";

export default function BrandsPage() {
  const { isAuthorized, isLoading } = useIsAuthorized(Resource.brands);
  const [currentPage, setCurrentPage] = useState(0);
  const offset = currentPage * constants.BRANDS_LIMIT;

  const { data, mutate } = useSWR(["brands", offset, isAuthorized, isLoading], async () => {
    if (isLoading || !isAuthorized) {
      return { brands: [], count: 0, offset: 0, limit: 0 };
    }

    return sdk.client.fetch<PaginatedResponse<{ brands: Brand[] }>>(`/admin/brands`, {
      query: {
        limit: constants.BRANDS_LIMIT,
        offset,
      },
    });
  });

  async function deleteBrand(id: string) {
    const { brandId } = await sdk.client.fetch<{ brandId: string }>(`/admin/brands/${id}`, {
      method: "DELETE",
    });
    mutate();

    // Show success toast
    toast.success("تم حذف الماركة", { description: `تم حذف الماركة بنجاح` });

    return brandId;
  }

  // const actions: Action[] = [
  //   {
  //     label: "Delete",
  //     Icon: Trash,
  //     onClick: deleteBrand,
  //   },
  // ];

  return (
    <Container className="divide-y p-0">
      <Toaster />

      {!isAuthorized && <UnauthorizedMessage resource={Resource.brands} />}

      <div className="flex items-center justify-between px-6 py-4">
        {/* <div> */}
        <Heading level="h2">الماركات</Heading>
        {/* </div> */}

        <CreateBrandForm mutate={mutate} />
      </div>

      <Table
        columns={[
          {
            key: "",
            render(brand: Brand) {
              return <img src={brand.image} alt={brand.name} className="h-8 w-8 rounded-full object-cover" />;
            },
          },
          {
            key: "name",
            label: "الاسم",
          },
          {
            key: "description",
            label: "الوصف",
          },
          {
            key: "products.length",
            label: "المنتجات",
          },
          {
            key: "actions",
            label: "الإجراءات",
            render(brand: Brand) {
              return (
                <div className="flex items-center gap-x-2">
                  {/* Edit */}
                  <EditBrandForm mutate={mutate} brand={brand} />

                  {/* Delete */}
                  <Button type="button" onClick={() => deleteBrand(brand.id)} variant="danger">
                    <Trash />
                  </Button>
                </div>
              );
            },
          },
        ]}
        data={data?.brands || []}
        pageSize={data?.limit || constants.BRANDS_LIMIT}
        count={data?.count || 0}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </Container>
  );
}

export const config = defineRouteConfig({
  label: "الماركات",
  icon: Sparkles,
});
