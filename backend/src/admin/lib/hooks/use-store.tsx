import useSWR from "swr";
import { sdk } from "../sdk";

const useStore = () => {
  const { data, error, isLoading } = useSWR(["store"], () => sdk.admin.store.list());

  return {
    store: data?.stores?.[0],
    error,
    isLoading,
  };
};

export default useStore;
