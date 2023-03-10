import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/react-query";
import type { AppRouter } from "../../../server/src/api/router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { getToken } from "./token";
import { server_url } from "../data/api";

/*** App trpc client */
export const trpc = createTRPCReact<AppRouter>();

const appQueryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, staleTime: 60 * 1000 } },
});

const trpcClient = trpc.createClient({
  links: [httpBatchLink({ url: server_url + "/api", headers: () => ({ authorization: getToken() }) })],
});

/** trpc and react-query providers wrapper function */
export default function TRPCProvider(props: PropsWithChildren) {
  return (
    <trpc.Provider client={trpcClient} queryClient={appQueryClient}>
      <QueryClientProvider client={appQueryClient}>{props.children}</QueryClientProvider>
    </trpc.Provider>
  );
}

