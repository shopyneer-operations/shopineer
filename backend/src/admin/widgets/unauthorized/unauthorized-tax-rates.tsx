import { defineWidgetConfig } from "@medusajs/admin-sdk";
import UnauthorizedMessage from "../../components/unauthorized-message";
import { Resource } from "../../lib/data/permissions";
import useIsAuthorized from "../../lib/hooks/use-is-authorized";

const UnauthorizedWidget = () => {
  const { isAuthorized } = useIsAuthorized(Resource["tax-rates"]);

  if (isAuthorized) return <></>;

  return <UnauthorizedMessage resource={Resource["tax-rates"]} />;
};

export const config = defineWidgetConfig({
  zone: "tax.list.before",
});

export default UnauthorizedWidget;
