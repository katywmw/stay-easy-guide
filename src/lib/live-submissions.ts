import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OwnerSubmission } from "./owner-demo";

export interface LiveSubmission extends OwnerSubmission {
  source: "live";
}

interface State {
  items: LiveSubmission[];
  push: (s: LiveSubmission) => void;
  updateOne: (id: string, patch: Partial<LiveSubmission>) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useLiveSubmissions = create<State>()(
  persist(
    (set) => ({
      items: [],
      push: (s) => set((st) => ({ items: [s, ...st.items] })),
      updateOne: (id, patch) =>
        set((st) => ({
          items: st.items.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),
      remove: (id) =>
        set((st) => ({ items: st.items.filter((x) => x.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    { name: "walnut-live-submissions" },
  ),
);

export function isLiveId(id: string) {
  return id.startsWith("live-");
}
