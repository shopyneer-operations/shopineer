import { defineWidgetConfig } from "@medusajs/admin-sdk";
import UnauthorizedMessage from "../../components/unauthorized-message";
import { Resource } from "../../lib/data/permissions";
import useIsAuthorized from "../../lib/hooks/use-is-authorized";

const UnauthorizedWidget = () => {
  const { isAuthorized } = useIsAuthorized(Resource["price-lists"]);

  if (isAuthorized) return <></>;

  return <UnauthorizedMessage resource={Resource["price-lists"]} />;
};

export const config = defineWidgetConfig({
  zone: "price_list.list.before",
});

export default UnauthorizedWidget;
