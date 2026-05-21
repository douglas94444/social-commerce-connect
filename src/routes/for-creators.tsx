import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/for-creators")({
  beforeLoad: () => {
    throw redirect({ to: "/for-brands" });
  },
});
