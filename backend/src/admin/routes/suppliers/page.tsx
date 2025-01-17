import { Container, Heading } from "@medusajs/ui";
import { TruckFast } from "@medusajs/icons";
import { defineRouteConfig } from "@medusajs/admin-sdk";
import { sdk } from "../../lib/sdk";
import constants from "../../lib/constants";
import { useState } from "react";
import useSWR from "swr";
import { Table } from "../../components/table";

type SuppliersResponse = {
  suppliers: { id: string; name: string }[];
  count: number;
  offset: number;
  limit: number;
};

export default function SuppliersPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const offset = currentPage * constants.SUPPLIERS_LIMIT;

  const { data } = useSWR(["suppliers", offset], async () =>
    sdk.client.fetch<SuppliersResponse>(`/admin/suppliers`, {
      query: {
        limit: constants.SUPPLIERS_LIMIT,
        offset,
      },
    })
  );

  console.log("🫡", { data });

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Suppliers</Heading>
        </div>
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

export const config = defineRouteConfig({
  label: "Suppliers",
  icon: TruckFast,
});
