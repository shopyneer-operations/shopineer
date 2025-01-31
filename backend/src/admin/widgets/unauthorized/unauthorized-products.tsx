import { defineWidgetConfig } from "@medusajs/admin-sdk";
import UnauthorizedMessage from "../../components/unauthorized-message";
import { Resource } from "../../lib/data/permissions";
import useIsAuthorized from "../../lib/hooks/use-is-authorized";

const UnauthorizedWidget = () => {
  const { isAuthorized } = useIsAuthorized(Resource.products);

  if (isAuthorized) return <></>;

  return <UnauthorizedMessage resource={Resource.products} />;
};

export const config = defineWidgetConfig({
  zone: "product.list.before",
});

export default UnauthorizedWidget;
