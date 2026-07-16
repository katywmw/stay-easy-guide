import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useOwnerAuth } from "@/lib/owner-auth";

export const Route = createFileRoute("/owner/")({
  component: OwnerEntry,
  head: () => ({ meta: [{ title: "業者入口 · 胡桃民宿" }] }),
});

function OwnerEntry() {
  const loggedIn = useOwnerAuth((s) => s.loggedIn);
  return <Navigate to={loggedIn ? "/owner/dashboard" : "/owner/login"} />;
}
