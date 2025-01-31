import { defineWidgetConfig } from "@medusajs/admin-sdk";
import UnauthorizedMessage from "../../components/unauthorized-message";
import { Resource } from "../../lib/data/permissions";
import useIsAuthorized from "../../lib/hooks/use-is-authorized";

const UnauthorizedWidget = () => {
  const { isAuthorized } = useIsAuthorized(Resource.users);

  if (isAuthorized) return <></>;

  return <UnauthorizedMessage resource={Resource.users} />;
};

export const config = defineWidgetConfig({
  zone: "user.list.before",
});

export default UnauthorizedWidget;
