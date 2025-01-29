import { defineWidgetConfig } from "@medusajs/admin-sdk";
import UnauthorizedMessage from "../../components/unauthorized-message";
import { Resource } from "../../lib/data/permissions";
import useIsAuthorized from "../../lib/hooks/useIsAuthorized";

const UnauthorizedWidget = () => {
  const { isAuthorized } = useIsAuthorized(Resource.reservations);

  if (isAuthorized) return <></>;

  return <UnauthorizedMessage resource={Resource.reservations} />;
};

export const config = defineWidgetConfig({
  zone: "reservation.list.before",
});

export default UnauthorizedWidget;
