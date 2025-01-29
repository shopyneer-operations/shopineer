import { defineWidgetConfig } from "@medusajs/admin-sdk";
import UnauthorizedMessage from "../../components/unauthorized-message";
import { Resource } from "../../lib/data/permissions";
import useIsAuthorized from "../../lib/hooks/useIsAuthorized";

const UnauthorizedWidget = () => {
  const { isAuthorized } = useIsAuthorized(Resource.inventory);

  if (isAuthorized) return <></>;

  return <UnauthorizedMessage resource={Resource.inventory} />;
};

export const config = defineWidgetConfig({
  zone: "inventory_item.list.before",
});

export default UnauthorizedWidget;
