import { defineWidgetConfig } from "@medusajs/admin-sdk";
import UnauthorizedMessage from "../../components/unauthorized-message";
import { Resource } from "../../lib/data/permissions";
import useIsAuthorized from "../../lib/hooks/use-is-authorized";

const UnauthorizedWidget = () => {
  const { isAuthorized } = useIsAuthorized(Resource.collections);

  if (isAuthorized) return <></>;

  return <UnauthorizedMessage resource={Resource.collections} />;
};

export const config = defineWidgetConfig({
  zone: "product_collection.list.before",
});

export default UnauthorizedWidget;
