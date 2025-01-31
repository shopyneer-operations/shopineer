import { defineWidgetConfig } from "@medusajs/admin-sdk";
import UnauthorizedMessage from "../../components/unauthorized-message";
import { Resource } from "../../lib/data/permissions";
import useIsAuthorized from "../../lib/hooks/use-is-authorized";

const UnauthorizedWidget = () => {
  const { isAuthorized } = useIsAuthorized(Resource.regions);

  if (isAuthorized) return <></>;

  return <UnauthorizedMessage resource={Resource.regions} />;
};

export const config = defineWidgetConfig({
  zone: "region.list.before",
});

export default UnauthorizedWidget;
