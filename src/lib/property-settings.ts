import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface PropertySettingsState {
  askParking: boolean;
  askPet: boolean;
  petFeeEnabled: boolean;
  petFeePerNight: number;
  depositAmount: number;
  linePayQrDataUrl: string | null;
  update: (patch: Partial<Omit<PropertySettingsState, "update">>) => void;
}

export const usePropertySettings = create<PropertySettingsState>()(
  persist(
    (set) => ({
      askParking: false,
      askPet: true,
      petFeeEnabled: false,
      petFeePerNight: 500,
      depositAmount: 1000,
      linePayQrDataUrl: null,
      update: (patch) => set(patch),
    }),
    { name: "walnut-property-settings" },
  ),
);
