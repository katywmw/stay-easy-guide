import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useOwnerAuth, useOwnerAuthHydrated } from "@/lib/owner-auth";

export const Route = createFileRoute("/owner/")({
  component: OwnerEntry,
  head: () => ({ meta: [{ title: "業者入口 · 胡桃民宿" }] }),
});

function OwnerEntry() {
  const loggedIn = useOwnerAuth((s) => s.loggedIn);
  const hydrated = useOwnerAuthHydrated();
  // Wait for zustand persist to rehydrate; otherwise a signed-in owner
  // briefly reads loggedIn=false and gets bounced to /owner/login.
  if (!hydrated) return null;
  return <Navigate to={loggedIn ? "/owner/dashboard" : "/owner/login"} />;
}
