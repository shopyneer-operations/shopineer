import useSWR from "swr";
import { sdk } from "../sdk";
import { AdminUserResponse } from "@medusajs/framework/types";
import { Permission } from "../types/role";

const useUser = () => {
  const { data, error, isLoading } = useSWR(["user"], () => sdk.admin.user.me({ fields: "role.*" }));

  return {
    user: data?.user as (AdminUserResponse & { role: { permissions: Permission[] } }) | undefined,
    error,
    isLoading,
  };
};

export default useUser;
