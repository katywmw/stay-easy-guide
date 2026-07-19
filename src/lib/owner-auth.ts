import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface OwnerAuthState {
  loggedIn: boolean;
  login: () => void;
  logout: () => void;
}

export const useOwnerAuth = create<OwnerAuthState>()(
  persist(
    (set) => ({
      loggedIn: false,
      login: () => set({ loggedIn: true }),
      logout: () => set({ loggedIn: false }),
    }),
    { name: "walnut-owner-auth" },
  ),
);

/**
 * Zustand persist rehydrates asynchronously (and is skipped entirely during
 * SSR). Components that gate rendering on persisted state must wait for
 * hydration; otherwise the first client render sees the default state
 * (`loggedIn: false`) and any auth-redirect effect fires immediately —
 * kicking a signed-in owner back to /owner/login and losing in-progress work.
 */
export function useOwnerAuthHydrated() {
  const [hydrated, setHydrated] = useState(() =>
    useOwnerAuth.persist.hasHydrated(),
  );
  useEffect(() => {
    if (hydrated) return;
    const unsubFinish = useOwnerAuth.persist.onFinishHydration(() =>
      setHydrated(true),
    );
    if (useOwnerAuth.persist.hasHydrated()) setHydrated(true);
    return () => {
      unsubFinish();
    };
  }, [hydrated]);
  return hydrated;
}
