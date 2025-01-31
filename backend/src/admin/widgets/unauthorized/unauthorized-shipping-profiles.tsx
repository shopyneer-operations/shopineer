import { defineWidgetConfig } from "@medusajs/admin-sdk";
import UnauthorizedMessage from "../../components/unauthorized-message";
import { Resource } from "../../lib/data/permissions";
import useIsAuthorized from "../../lib/hooks/use-is-authorized";

const UnauthorizedWidget = () => {
  const { isAuthorized } = useIsAuthorized(Resource["shipping-profiles"]);

  if (isAuthorized) return <></>;

  return <UnauthorizedMessage resource={Resource["shipping-profiles"]} />;
};

export const config = defineWidgetConfig({
  zone: "shipping_profile.list.before",
});

export default UnauthorizedWidget;
