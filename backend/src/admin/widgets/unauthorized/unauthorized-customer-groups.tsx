import { defineWidgetConfig } from "@medusajs/admin-sdk";
import UnauthorizedMessage from "../../components/unauthorized-message";
import { Resource } from "../../lib/data/permissions";
import useIsAuthorized from "../../lib/hooks/use-is-authorized";

const UnauthorizedWidget = () => {
  const { isAuthorized } = useIsAuthorized(Resource["customer-groups"]);

  if (isAuthorized) return <></>;

  return <UnauthorizedMessage resource={Resource["customer-groups"]} />;
};

export const config = defineWidgetConfig({
  zone: "customer_group.list.before",
});

export default UnauthorizedWidget;
