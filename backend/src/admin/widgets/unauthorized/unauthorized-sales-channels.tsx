import { defineWidgetConfig } from "@medusajs/admin-sdk";
import UnauthorizedMessage from "../../components/unauthorized-message";
import { Resource } from "../../lib/data/permissions";
import useIsAuthorized from "../../lib/hooks/use-is-authorized";

const UnauthorizedWidget = () => {
  const { isAuthorized } = useIsAuthorized(Resource["sales-channels"]);

  if (isAuthorized) return <></>;

  return <UnauthorizedMessage resource={Resource["sales-channels"]} />;
};

export const config = defineWidgetConfig({
  zone: "sales_channel.list.before",
});

export default UnauthorizedWidget;
