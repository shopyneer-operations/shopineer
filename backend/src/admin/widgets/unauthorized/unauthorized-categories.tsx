import { defineWidgetConfig } from "@medusajs/admin-sdk";
import UnauthorizedMessage from "../../components/unauthorized-message";
import useIsAuthorized from "../../lib/hooks/use-is-authorized";
import { Resource } from "../../lib/data/permissions";

const UnauthorizedWidget = () => {
  const { isAuthorized } = useIsAuthorized(Resource.categories);

  if (isAuthorized) return <></>;

  return <UnauthorizedMessage resource={Resource.categories} />;
};

export const config = defineWidgetConfig({
  zone: "product_category.list.before",
});

export default UnauthorizedWidget;
