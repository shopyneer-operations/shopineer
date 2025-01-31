import { defineWidgetConfig } from "@medusajs/admin-sdk";
import UnauthorizedMessage from "../../components/unauthorized-message";
import { Resource } from "../../lib/data/permissions";
import useIsAuthorized from "../../lib/hooks/use-is-authorized";

const UnauthorizedWidget = () => {
  const { isAuthorized } = useIsAuthorized(Resource.campaigns);

  if (isAuthorized) return <></>;

  return <UnauthorizedMessage resource={Resource.campaigns} />;
};

export const config = defineWidgetConfig({
  zone: "campaign.list.before",
});

export default UnauthorizedWidget;
