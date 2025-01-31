import { defineWidgetConfig } from "@medusajs/admin-sdk";
import UnauthorizedMessage from "../../components/unauthorized-message";
import { Resource } from "../../lib/data/permissions";
import useIsAuthorized from "../../lib/hooks/use-is-authorized";

const UnauthorizedWidget = () => {
  const { isAuthorized } = useIsAuthorized(Resource["api-keys"]);

  if (isAuthorized) return <></>;

  return <UnauthorizedMessage resource={Resource["api-keys"]} />;
};

export const config = defineWidgetConfig({
  zone: "product_category.list.before",
});

export default UnauthorizedWidget;
