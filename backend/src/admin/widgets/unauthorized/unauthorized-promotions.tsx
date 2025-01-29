import { defineWidgetConfig } from "@medusajs/admin-sdk";
import UnauthorizedMessage from "../../components/unauthorized-message";
import { Resource } from "../../lib/data/permissions";
import useIsAuthorized from "../../lib/hooks/useIsAuthorized";

const UnauthorizedWidget = () => {
  const { isAuthorized } = useIsAuthorized(Resource.promotions);

  if (isAuthorized) return <></>;

  return <UnauthorizedMessage resource={Resource.promotions} />;
};

export const config = defineWidgetConfig({
  zone: "promotion.list.before",
});

export default UnauthorizedWidget;
