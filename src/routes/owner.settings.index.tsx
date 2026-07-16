import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/owner/settings/")({
  component: () => <Navigate to="/owner/settings/property" />,
});
