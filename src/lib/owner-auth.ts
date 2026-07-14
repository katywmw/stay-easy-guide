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
