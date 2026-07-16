import { create } from "zustand";
import { persist } from "zustand/middleware";

interface State {
  assignments: Record<string, string[]>; // submissionId -> roomIds
  set: (submissionId: string, roomIds: string[]) => void;
  clear: (submissionId: string) => void;
  get: (submissionId: string) => string[];
}

export const useRoomAssignments = create<State>()(
  persist(
    (set, get) => ({
      assignments: {},
      set: (submissionId, roomIds) =>
        set((s) => ({
          assignments: { ...s.assignments, [submissionId]: roomIds },
        })),
      clear: (submissionId) =>
        set((s) => {
          const n = { ...s.assignments };
          delete n[submissionId];
          return { assignments: n };
        }),
      get: (submissionId) => get().assignments[submissionId] ?? [],
    }),
    { name: "walnut-room-assignments-v1" },
  ),
);
