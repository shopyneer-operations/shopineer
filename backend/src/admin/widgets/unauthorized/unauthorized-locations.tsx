import { defineWidgetConfig } from "@medusajs/admin-sdk";
import UnauthorizedMessage from "../../components/unauthorized-message";
import { Resource } from "../../lib/data/permissions";
import useIsAuthorized from "../../lib/hooks/useIsAuthorized";

const UnauthorizedWidget = () => {
  const { isAuthorized } = useIsAuthorized(Resource.locations);

  if (isAuthorized) return <></>;

  return <UnauthorizedMessage resource={Resource.locations} />;
};

export const config = defineWidgetConfig({
  zone: "location.list.before",
});

export default UnauthorizedWidget;
