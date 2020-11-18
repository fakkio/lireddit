import {useRouter} from "next/router";
import {useEffect} from "react";
import {useMeQuery} from "../generated/graphql";

export const useAuth = () => {
  const router = useRouter();
  const {data, loading} = useMeQuery();

  useEffect(() => {
    (async () => {
      if (!loading && !data?.me) {
        await router.replace(`/login?next=${router.pathname}`);
      }
    })();
  }, []);
};
