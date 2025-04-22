import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { DetailWidgetProps, AdminCustomer } from "@medusajs/framework/types";
import { Container, Heading, Text, Button, toast } from "@medusajs/ui";
import useSWR from "swr";
import { sdk } from "../lib/sdk";

type AdminCustomerWithBan = AdminCustomer & {
  metadata?: {
    is_banned?: boolean;
  };
};

const CustomerBanWidget = ({ data: customer }: DetailWidgetProps<AdminCustomer>) => {
  const { data: customerData, mutate } = useSWR(["customer", customer.id], async () => {
    const result = await sdk.admin.customer.retrieve(customer.id);
    return result.customer as AdminCustomerWithBan;
  });

  const isBanned = customerData?.metadata?.is_banned || false;

  async function updateCustomerBanStatus(isBanned: boolean) {
    try {
      await sdk.admin.customer.update(customer.id, {
        metadata: {
          ...customerData?.metadata,
          is_banned: isBanned,
        },
      });

      // Update UI
      mutate();

      toast.success("Status updated", {
        description: `Customer has been ${isBanned ? "banned" : "unbanned"}`,
      });
    } catch (error) {
      toast.error("Error", {
        description: "Failed to update customer status",
      });
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Customer Ban Status</Heading>
        </div>
      </div>
      <div className="flex items-center justify-between px-6 py-4">
        <Text size="small" weight="plus" leading="compact">
          Status: {isBanned ? "Banned" : "Active"}
        </Text>
        <Button variant={isBanned ? "primary" : "danger"} onClick={() => updateCustomerBanStatus(!isBanned)}>
          {isBanned ? "Unban Customer" : "Ban Customer"}
        </Button>
      </div>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "customer.details.side.after",
});

export default CustomerBanWidget;
