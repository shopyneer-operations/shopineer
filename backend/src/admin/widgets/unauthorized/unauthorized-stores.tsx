import { defineWidgetConfig } from "@medusajs/admin-sdk";
import UnauthorizedMessage from "../../components/unauthorized-message";
import { Resource } from "../../lib/data/permissions";
import useIsAuthorized from "../../lib/hooks/use-is-authorized";

const UnauthorizedWidget = () => {
  const { isAuthorized } = useIsAuthorized(Resource.stores);

  if (isAuthorized) return <></>;

  return <UnauthorizedMessage resource={Resource.stores} />;
};

export const config = defineWidgetConfig({
  zone: "store.details.before",
});

export default UnauthorizedWidget;
