import { capitalize, some } from "lodash";
import { Resource } from "../data/permissions";
import useUser from "./useUser";

const useIsAuthorized = (resource: Resource) => {
  const { user, isLoading } = useUser();

  /**
   * isLoading: we want the default status to be authorized while we are still loading the user data
   * !user.role: If user has no role, he's considered a superadmin
   */
  // TODO: uncapitilize resource
  const isAuthorized = isLoading || !user?.role || some(user.role.permissions, { name: capitalize(resource) });

  return { isAuthorized, isLoading };
};

export default useIsAuthorized;
