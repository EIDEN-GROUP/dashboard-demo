import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useLayoutEffect } from "react";

export const Route = createFileRoute("/")({
  component: function IndexRedirect() {
    const navigate = useNavigate();
    useLayoutEffect(() => {
      navigate({ to: "/landing", replace: true });
    }, [navigate]);
    return null;
  },
});
