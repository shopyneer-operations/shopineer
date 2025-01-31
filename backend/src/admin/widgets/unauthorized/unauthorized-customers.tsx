import { defineWidgetConfig } from "@medusajs/admin-sdk";
import UnauthorizedMessage from "../../components/unauthorized-message";
import { Resource } from "../../lib/data/permissions";
import useIsAuthorized from "../../lib/hooks/use-is-authorized";

const UnauthorizedWidget = () => {
  const { isAuthorized } = useIsAuthorized(Resource.customers);

  if (isAuthorized) return <></>;

  return <UnauthorizedMessage resource={Resource.customers} />;
};

export const config = defineWidgetConfig({
  zone: "customer.list.before",
});

export default UnauthorizedWidget;
