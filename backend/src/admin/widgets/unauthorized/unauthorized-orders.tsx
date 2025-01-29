import { defineWidgetConfig } from "@medusajs/admin-sdk";
import UnauthorizedMessage from "../../components/unauthorized-message";
import { Resource } from "../../lib/data/permissions";
import useIsAuthorized from "../../lib/hooks/useIsAuthorized";

const UnauthorizedWidget = () => {
  const { isAuthorized } = useIsAuthorized(Resource.orders);

  if (isAuthorized) return <></>;

  return <UnauthorizedMessage resource={Resource.orders} />;
};

export const config = defineWidgetConfig({
  zone: "order.list.before",
});

export default UnauthorizedWidget;
