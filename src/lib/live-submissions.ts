import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OwnerSubmission } from "./owner-demo";

export interface LiveSubmission extends OwnerSubmission {
  source: "live";
  /** Soft-delete timestamp set when owner removes the submission. */
  removedAt?: string;
  removedBy?: "owner";
  removedReason?: string;
}

interface State {
  items: LiveSubmission[];
  push: (s: LiveSubmission) => void;
  updateOne: (id: string, patch: Partial<LiveSubmission>) => void;
  softRemove: (id: string, reason?: string) => void;
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
      softRemove: (id, reason) =>
        set((st) => ({
          items: st.items.map((x) =>
            x.id === id
              ? {
                  ...x,
                  removedAt: new Date().toISOString(),
                  removedBy: "owner",
                  removedReason: reason,
                }
              : x,
          ),
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

export function isActiveSubmission(s: LiveSubmission | undefined | null) {
  return !!s && !s.removedAt;
}
