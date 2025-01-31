import useSWR from "swr";
import { sdk } from "../sdk";

const useUser = () => {
  const { data, error, isLoading } = useSWR(["user"], () => sdk.admin.user.me({ fields: "role.*" }));

  return {
    user: data?.user,
    error,
    isLoading,
  };
};

export default useUser;
