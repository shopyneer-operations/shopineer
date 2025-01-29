import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Users } from "@medusajs/icons";
import { Container, Heading } from "@medusajs/ui";

type Props = {};

export default function RolesPage({}: Props) {
  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        {/* <div> */}
        <Heading level="h2">Roles</Heading>
        {/* </div> */}

        {/* <CreateBrandForm mutate={mutate} /> */}
      </div>
    </Container>
  );
}

export const config = defineRouteConfig({
  label: "Roles",
  icon: Users,
});
