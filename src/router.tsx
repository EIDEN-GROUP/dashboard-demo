import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { BrandLoader } from "@/components/brand-loader";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Précharge le chunk de la route au survol : la navigation devient instantanée.
    defaultPreload: "intent",
    defaultPreloadDelay: 50,
    // Le loader plein écran ne doit apparaître que si la route tarde vraiment,
    // et ne pas être maintenu artificiellement une fois le chunk arrivé.
    defaultPendingMs: 1500,
    defaultPendingMinMs: 0,
    defaultPendingComponent: () => <BrandLoader fullScreen />,
  });

  return router;
};
