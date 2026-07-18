import { create } from "zustand";
import { persist } from "zustand/middleware";

export type BookingPlatform =
  | "booking"
  | "agoda"
  | "airbnb"
  | "line"
  | "official"
  | "phone"
  | "other";

export const platformLabels: Record<BookingPlatform, string> = {
  booking: "Booking.com",
  agoda: "Agoda",
  airbnb: "Airbnb",
  line: "LINE",
  official: "官方網站",
  phone: "電話訂房",
  other: "其他",
};

export type DepositStatus = "unpaid" | "pending" | "confirmed";
export const depositStatusLabels: Record<DepositStatus, string> = {
  unpaid: "尚未支付",
  pending: "等待確認",
  confirmed: "已確認",
};

export type CheckinStatus =
  | "draft"
  | "submitted"
  | "need_more_info"
  | "approved"
  | "completed";

export interface CheckinState {
  // Property / rooms
  propertyId: string;
  selectedRoomIds: string[];

  // Booking
  platform: BookingPlatform | "";
  bookingName: string;
  phone: string;
  email: string;
  checkInDate: string;
  checkOutDate: string;
  orderId: string;

  // Guest info
  guestCount: string;
  arrivalTime: string;
  hasPet: "yes" | "no" | "";
  needParking: "yes" | "no" | "";
  specialNotes: string;

  /** Answers to owner-defined extra fees marked confirmAtCheckin.
   *  key = fee id, value = "yes" | "no" */
  extraFeeAnswers: Record<string, "yes" | "no">;


  // ID
  idUploaded: boolean;
  idConsent: boolean;

  // Deposit
  depositMethod: string;
  depositProofUploaded: boolean;
  depositStatus: DepositStatus;

  // Agreement
  faqRead: boolean;
  rulesAgreed: boolean;

  // Status
  status: CheckinStatus;
  submittedAt: string | null;

  update: (patch: Partial<CheckinState>) => void;
  submit: () => void;
  reset: () => void;
}

const initial = {
  propertyId: "walnut",
  selectedRoomIds: [] as string[],
  platform: "" as const,
  bookingName: "",
  phone: "",
  email: "",
  checkInDate: "",
  checkOutDate: "",
  orderId: "",
  guestCount: "2",
  arrivalTime: "16:00",
  hasPet: "" as const,
  needParking: "" as const,
  specialNotes: "",
  extraFeeAnswers: {} as Record<string, "yes" | "no">,
  idUploaded: false,
  idConsent: false,
  depositMethod: "",
  depositProofUploaded: false,
  depositStatus: "unpaid" as DepositStatus,
  faqRead: false,
  rulesAgreed: false,
  status: "draft" as CheckinStatus,
  submittedAt: null,
};

export const useCheckinStore = create<CheckinState>()(
  persist(
    (set) => ({
      ...initial,
      update: (patch) => set(patch),
      submit: () =>
        set({ status: "submitted", submittedAt: new Date().toISOString() }),
      reset: () => set(initial),
    }),
    { name: "walnut-checkin-demo" },
  ),
);
