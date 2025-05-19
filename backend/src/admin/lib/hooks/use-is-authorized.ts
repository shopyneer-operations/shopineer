import { some } from "lodash";
import { Resource } from "../data/permissions";
import useUser from "./use-user";

const useIsAuthorized = (resource: Resource) => {
  const { user, isLoading } = useUser();

  /**
   * isLoading: we want the default status to be authorized while we are still loading the user data
   * !user.role: If user has no role, he's considered a superadmin
   */
  const isAuthorized =
    isLoading || user?.metadata?.is_super_admin || some((user as any)?.role?.permissions, { name: resource });

  return { isAuthorized: true, isLoading };
};

export default useIsAuthorized;
