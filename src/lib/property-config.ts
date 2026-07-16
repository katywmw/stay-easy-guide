import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Property {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  checkInTime: string; // "15:00"
  checkOutTime: string; // "11:00"
}

export type RoomType = "private" | "suite" | "whole";
export const roomTypeLabels: Record<RoomType, string> = {
  private: "雅房",
  suite: "套房",
  whole: "整棟",
};

export interface Room {
  id: string;
  propertyId: string;
  name: string;
  type: RoomType;
  beds: number;
  depositAmount: number; // per-room deposit
  guideNote?: string;
  doorPassword?: string;
  gatePassword?: string;
}

export type DepositMode = "none" | "fixed" | "perRoom";

export interface ExtraFeeItem {
  id: string;
  name: string; // 寵物費、加床費、烤肉費…
  unit: string; // 每晚 / 每次 / 每人
  defaultAmount: number;
}

export type PasswordReleaseMode = "manual" | "scheduled" | "conditional";

export interface FaqEntry {
  id: string;
  category: "id" | "deposit" | "general";
  q: string;
  a: string;
}

export interface PaymentInfo {
  bankName: string;
  bankCode: string;
  accountName: string;
  accountNumber: string;
  linePayQrDataUrl: string | null;
  notes: string;
}

export interface PropertyConfigState {
  properties: Property[];
  currentPropertyId: string;

  rooms: Room[];

  depositMode: DepositMode;
  fixedDepositAmount: number; // used when mode = "fixed"

  extraFeeCatalog: ExtraFeeItem[];

  payment: PaymentInfo;

  houseRules: string; // markdown-ish
  guide: {
    address: string;
    parking: string;
    gate: string;
    door: string;
    notes: string;
    emergency: string;
  };
  faq: FaqEntry[];

  passwordReleaseMode: PasswordReleaseMode;
  passwordReleaseTime: string; // "15:00"

  update: (patch: Partial<Omit<PropertyConfigState, "update">>) => void;
  addProperty: (p: Omit<Property, "id">) => void;
  updateProperty: (id: string, patch: Partial<Property>) => void;
  removeProperty: (id: string) => void;
  addRoom: (r: Omit<Room, "id">) => void;
  updateRoom: (id: string, patch: Partial<Room>) => void;
  removeRoom: (id: string) => void;
  addExtraFee: (f: Omit<ExtraFeeItem, "id">) => void;
  updateExtraFee: (id: string, patch: Partial<ExtraFeeItem>) => void;
  removeExtraFee: (id: string) => void;
  addFaq: (f: Omit<FaqEntry, "id">) => void;
  updateFaq: (id: string, patch: Partial<FaqEntry>) => void;
  removeFaq: (id: string) => void;
}

const uid = () => Math.random().toString(36).slice(2, 9);

const seedProperties: Property[] = [
  {
    id: "walnut",
    name: "胡桃民宿",
    address: "宜蘭縣礁溪鄉溫泉路 123 號",
    phone: "03-988-1234",
    email: "hello@walnut-stay.tw",
    checkInTime: "15:00",
    checkOutTime: "11:00",
  },
  {
    id: "anping9",
    name: "安平九號",
    address: "台南市安平區安北路 9 號",
    phone: "06-222-9999",
    email: "hello@anping9.tw",
    checkInTime: "16:00",
    checkOutTime: "11:00",
  },
];

const seedRooms: Room[] = [
  {
    id: "w-101",
    propertyId: "walnut",
    name: "101 松風雙人房",
    type: "suite",
    beds: 1,
    depositAmount: 1000,
    doorPassword: "5821",
    gatePassword: "9945",
  },
  {
    id: "w-102",
    propertyId: "walnut",
    name: "102 竹影四人房",
    type: "suite",
    beds: 2,
    depositAmount: 1000,
    doorPassword: "7263",
    gatePassword: "9945",
  },
  {
    id: "w-whole",
    propertyId: "walnut",
    name: "整棟包棟",
    type: "whole",
    beds: 6,
    depositAmount: 6000,
    gatePassword: "9945",
  },
  {
    id: "a-201",
    propertyId: "anping9",
    name: "201 海景套房",
    type: "suite",
    beds: 2,
    depositAmount: 1500,
    doorPassword: "3388",
  },
];

const seedFees: ExtraFeeItem[] = [
  { id: uid(), name: "寵物費", unit: "每晚每隻", defaultAmount: 500 },
  { id: uid(), name: "加床費", unit: "每晚", defaultAmount: 500 },
  { id: uid(), name: "烤肉設備", unit: "每次", defaultAmount: 800 },
  { id: uid(), name: "訪客費", unit: "每人", defaultAmount: 200 },
  { id: uid(), name: "早餐", unit: "每人", defaultAmount: 200 },
];

export const usePropertyConfig = create<PropertyConfigState>()(
  persist(
    (set) => ({
      properties: seedProperties,
      currentPropertyId: "walnut",
      rooms: seedRooms,
      depositMode: "perRoom",
      fixedDepositAmount: 1000,
      extraFeeCatalog: seedFees,
      payment: {
        bankName: "胡桃國際商銀",
        bankCode: "013",
        accountName: "胡桃民宿有限公司",
        accountNumber: "1234-5678-9012",
        linePayQrDataUrl: null,
        notes: "匯款完成後請上傳付款證明。",
      },
      houseRules: "",
      guide: {
        address: "宜蘭縣礁溪鄉溫泉路 123 號",
        parking: "民宿正對面有付費停車場（30 元/小時），或路邊白線車位。",
        gate: "大門密碼將於審核通過後提供。",
        door: "房門密碼將於審核通過後提供。",
        notes: "室內全面禁菸，請維持環境整潔。",
        emergency: "民宿聯絡電話：03-988-1234；緊急請撥 110 / 119。",
      },
      faq: [],
      passwordReleaseMode: "manual",
      passwordReleaseTime: "15:00",

      update: (patch) => set(patch as Partial<PropertyConfigState>),

      addProperty: (p) =>
        set((s) => ({ properties: [...s.properties, { ...p, id: uid() }] })),
      updateProperty: (id, patch) =>
        set((s) => ({
          properties: s.properties.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),
      removeProperty: (id) =>
        set((s) => ({ properties: s.properties.filter((x) => x.id !== id) })),

      addRoom: (r) => set((s) => ({ rooms: [...s.rooms, { ...r, id: uid() }] })),
      updateRoom: (id, patch) =>
        set((s) => ({
          rooms: s.rooms.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),
      removeRoom: (id) => set((s) => ({ rooms: s.rooms.filter((x) => x.id !== id) })),

      addExtraFee: (f) =>
        set((s) => ({ extraFeeCatalog: [...s.extraFeeCatalog, { ...f, id: uid() }] })),
      updateExtraFee: (id, patch) =>
        set((s) => ({
          extraFeeCatalog: s.extraFeeCatalog.map((x) =>
            x.id === id ? { ...x, ...patch } : x,
          ),
        })),
      removeExtraFee: (id) =>
        set((s) => ({ extraFeeCatalog: s.extraFeeCatalog.filter((x) => x.id !== id) })),

      addFaq: (f) => set((s) => ({ faq: [...s.faq, { ...f, id: uid() }] })),
      updateFaq: (id, patch) =>
        set((s) => ({ faq: s.faq.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      removeFaq: (id) => set((s) => ({ faq: s.faq.filter((x) => x.id !== id) })),
    }),
    { name: "walnut-property-config-v1" },
  ),
);

export function computeDeposit(
  state: PropertyConfigState,
  selectedRoomIds: string[],
): number {
  if (state.depositMode === "none") return 0;
  if (state.depositMode === "fixed") return state.fixedDepositAmount;
  // perRoom
  return state.rooms
    .filter((r) => selectedRoomIds.includes(r.id))
    .reduce((sum, r) => sum + (r.depositAmount || 0), 0);
}
