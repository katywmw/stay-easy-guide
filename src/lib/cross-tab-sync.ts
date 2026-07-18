/**
 * Cross-tab sync for zustand persist stores used in the demo.
 * When another tab (or another window on the same browser) mutates a persisted
 * store, we call `persist.rehydrate()` here so the current tab picks up the
 * change without a manual refresh — makes guest ↔ owner side-by-side testing
 * feel real-time.
 */
import { useEffect } from "react";
import { useCheckinStore } from "@/lib/checkin-store";
import { usePropertyConfig } from "@/lib/property-config";
import { usePropertySettings } from "@/lib/property-settings";
import { useLiveSubmissions } from "@/lib/live-submissions";
import { useSurchargeStore } from "@/lib/surcharge-store";
import { useRoomAssignments } from "@/lib/room-assignments";
import { useSubmissionUpdates } from "@/lib/submission-updates";
import { useChatStore } from "@/lib/chat-store";

const stores = [
  useCheckinStore,
  usePropertyConfig,
  usePropertySettings,
  useLiveSubmissions,
  useSurchargeStore,
  useRoomAssignments,
  useSubmissionUpdates,
  useChatStore,
] as const;

export function useCrossTabSync() {
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (!e.key) return;
      for (const s of stores) {
        // zustand persist attaches a .persist API to the store
        const p = (s as unknown as { persist?: { getOptions: () => { name: string }; rehydrate: () => void } }).persist;
        if (p && p.getOptions().name === e.key) {
          p.rehydrate();
        }
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);
}
