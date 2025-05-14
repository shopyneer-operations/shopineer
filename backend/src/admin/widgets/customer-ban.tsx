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

      toast.success("تم تحديث الحالة", {
        description: `تم حظر العميل ${isBanned ? "حظر" : "إلغاء الحظر"}`,
      });
    } catch (error) {
      toast.error("فشل تحديث الحالة", {
        description: "فشل تحديث حالة العميل",
      });
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">حالة الحظر</Heading>
        </div>
      </div>
      <div className="flex items-center justify-between px-6 py-4">
        <Text size="small" weight="plus" leading="compact">
          الحالة: {isBanned ? "حظر" : "فعال"}
        </Text>
        <Button variant={isBanned ? "primary" : "danger"} onClick={() => updateCustomerBanStatus(!isBanned)}>
          {isBanned ? "إلغاء الحظر" : "حظر العميل"}
        </Button>
      </div>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "customer.details.side.after",
});

export default CustomerBanWidget;
