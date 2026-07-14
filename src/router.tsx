import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Deliberately no pending component: the outgoing page stays on screen while
    // <PageTransition> sweeps its curtain across. A blank loading screen underneath
    // would defeat the wipe.
  });

  return router;
};
