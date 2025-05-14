import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { Container, Heading } from "@medusajs/ui";
import { AdminProductVariant, DetailWidgetProps } from "@medusajs/framework/types";
import useSWR from "swr";
import { sdk } from "../lib/sdk";
import { PriceHistoryType } from "../lib/types/price-history";
import { getLocaleAmount } from "../lib/money-amount-helpers";
import DateCell from "../components/date";

// The widget
const VariantWidget = ({ data }: DetailWidgetProps<AdminProductVariant>) => {
  const { data: variant } = useSWR(["variant", data.id], async () => {
    const result = await sdk.client.fetch<{ variant: AdminProductVariant & { price_histories: PriceHistoryType[] } }>(
      `/admin/variants/${data.id}/price-history`
    );

    return result.variant;
  });

  return (
    <Container className="flex flex-col divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">تاريخ السعر</Heading>
      </div>

      {variant?.price_histories?.map((price) => {
        return (
          <div key={price.id} className="txt-small text-ui-fg-subtle flex justify-between px-6 py-4">
            <DateCell className="font-medium" date={price.created_at} />
            <span>{getLocaleAmount(price.amount, price.currency_code)}</span>
          </div>
        );
      })}
    </Container>
  );
};

// The widget's configurations
export const config = defineWidgetConfig({
  zone: "product_variant.details.side.after",
});

export default VariantWidget;
