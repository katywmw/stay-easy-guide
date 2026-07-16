import { create } from "zustand";
import { persist } from "zustand/middleware";

// ============ Types ============

export interface Property {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  checkInTime: string;
  checkOutTime: string;
  /** Gate password shared across the whole property (used when a group's gatePasswordMode = 'sharedProperty'). */
  gatePassword?: string;
}

/** Legacy — used by existing UI for backward compat while UI migrates to groups. */
export type RoomType = "private" | "suite" | "whole";
export const roomTypeLabels: Record<RoomType, string> = {
  private: "雅房",
  suite: "套房",
  whole: "整棟",
};

export type AccessMode = "password" | "key";

/**
 * Room type group — owners create a group per bed style / rate class.
 * e.g. 「雙人床套房」「單人床」「整棟包棟」. Shared: description, deposit,
 * access mode (password vs key), guide notes.
 */
export type GatePasswordMode = "sharedProperty" | "sharedGroup" | "perRoom";

export interface RoomTypeGroup {
  id: string;
  propertyId: string;
  name: string;               // 業者自訂 (雙人床 / 單人床 / 整棟)
  description: string;        // 房型描述
  bedType?: string;           // 選填：單人床 / 雙人床 / 加大床…（提供快速篩選 tag）
  depositAmount: number;      // 該房型的單間押金
  accessMode: AccessMode;     // 密碼 / 鑰匙
  keyPickupLocation?: string; // accessMode = key 時使用
  guideNote?: string;         // 該房型的入住指引補充
  gatePasswordShared?: string; // 大門密碼（此房型群組共用，用於 sharedGroup 模式）
  /** 大門密碼設定模式：整館共用 / 房型群組共用 / 每房獨立。預設 sharedProperty。 */
  gatePasswordMode?: GatePasswordMode;
}

export interface Room {
  id: string;
  propertyId: string;
  /** Optional — new rooms belong to a group; migrated rooms may not have one initially. */
  groupId?: string;
  roomNumber?: string;
  /** 房間別名（例：Happy 101 / 松風），未設定則顯示 roomNumber。 */
  displayName?: string;
  /** Legacy fields kept for backward compatibility. */
  name: string;
  type: RoomType;
  beds: number;
  depositAmount: number;
  guideNote?: string;
  doorPassword?: string;
  gatePassword?: string;
  note?: string;
}

export type DepositMode = "none" | "fixed" | "perRoom";

export interface ExtraFeeItem {
  id: string;
  name: string;
  unit: string;
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

export interface Guide {
  address: string;
  parking: string;
  gate: string;
  door: string;
  notes: string;
  emergency: string;
}
export type GuideField = keyof Guide;
export type GuidePhotos = Record<GuideField, string[]>;

export const guideFieldOrder: GuideField[] = [
  "address",
  "parking",
  "gate",
  "door",
  "notes",
  "emergency",
];
export const guideFieldLabels: Record<GuideField, string> = {
  address: "地址",
  parking: "停車資訊",
  gate: "大門說明",
  door: "房門說明",
  notes: "注意事項",
  emergency: "緊急聯絡",
};

export type ContactChannelType =
  | "line"
  | "whatsapp"
  | "phone"
  | "email"
  | "messenger"
  | "sms"
  | "custom";

export interface ContactChannel {
  id: string;
  type: ContactChannelType;
  label: string;      // 顯示名稱
  value: string;      // ID / 電話 / URL
  enabled: boolean;
}

export const contactChannelTypeLabels: Record<ContactChannelType, string> = {
  line: "LINE",
  whatsapp: "WhatsApp",
  phone: "電話",
  email: "Email",
  messenger: "Messenger",
  sms: "簡訊",
  custom: "其他連結",
};

export interface PropertyConfigState {
  properties: Property[];
  currentPropertyId: string;

  // ==== Rooms ====
  roomGroups: RoomTypeGroup[];
  rooms: Room[];

  // ==== Current-property snapshots (mirrored from *ByProperty maps) ====
  depositMode: DepositMode;
  fixedDepositAmount: number;

  extraFeeCatalog: ExtraFeeItem[];

  payment: PaymentInfo;
  houseRules: string;
  guide: Guide;
  guidePhotos: GuidePhotos;
  faq: FaqEntry[];
  contactChannels: ContactChannel[];

  passwordReleaseMode: PasswordReleaseMode;
  passwordReleaseTime: string;

  // ==== Per-property stores ====
  paymentByProperty: Record<string, PaymentInfo>;
  houseRulesByProperty: Record<string, string>;
  guideByProperty: Record<string, Guide>;
  guidePhotosByProperty: Record<string, GuidePhotos>;
  contactChannelsByProperty: Record<string, ContactChannel[]>;

  // ==== Actions ====
  update: (patch: Partial<PropertyConfigState>) => void;

  addProperty: (p: Omit<Property, "id">) => void;
  updateProperty: (id: string, patch: Partial<Property>) => void;
  removeProperty: (id: string) => void;

  addRoomGroup: (g: Omit<RoomTypeGroup, "id">) => string;
  updateRoomGroup: (id: string, patch: Partial<RoomTypeGroup>) => void;
  removeRoomGroup: (id: string) => void;
  duplicateRoomGroup: (id: string) => void;

  addRoom: (r: Omit<Room, "id">) => void;
  updateRoom: (id: string, patch: Partial<Room>) => void;
  removeRoom: (id: string) => void;
  duplicateRoom: (id: string) => void;

  addExtraFee: (f: Omit<ExtraFeeItem, "id">) => void;
  updateExtraFee: (id: string, patch: Partial<ExtraFeeItem>) => void;
  removeExtraFee: (id: string) => void;

  addFaq: (f: Omit<FaqEntry, "id">) => void;
  updateFaq: (id: string, patch: Partial<FaqEntry>) => void;
  removeFaq: (id: string) => void;

  addContactChannel: (c: Omit<ContactChannel, "id">) => void;
  updateContactChannel: (id: string, patch: Partial<ContactChannel>) => void;
  removeContactChannel: (id: string) => void;

  /** Copy from one property to another for a given data kind. */
  copyFromProperty: (
    fromId: string,
    toId: string,
    kinds: Array<"payment" | "houseRules" | "guide" | "contact">,
  ) => void;
}

const uid = () => Math.random().toString(36).slice(2, 9);

// ============ Seed data ============

const seedProperties: Property[] = [
  {
    id: "walnut",
    name: "胡桃民宿",
    address: "宜蘭縣礁溪鄉溫泉路 123 號",
    phone: "03-988-1234",
    email: "hello@walnut-stay.tw",
    checkInTime: "15:00",
    checkOutTime: "11:00",
    gatePassword: "9945",
  },
  {
    id: "anping9",
    name: "安平九號",
    address: "台南市安平區安北路 9 號",
    phone: "06-222-9999",
    email: "hello@anping9.tw",
    checkInTime: "16:00",
    checkOutTime: "11:00",
    gatePassword: "3388",
  },
];

const seedGroups: RoomTypeGroup[] = [
  {
    id: "g-walnut-double",
    propertyId: "walnut",
    name: "雙人床套房",
    bedType: "雙人床",
    description: "獨立衛浴、山景陽台、Queen size 雙人床",
    depositAmount: 1000,
    accessMode: "password",
    guideNote: "進門後右手邊為房間，Wi-Fi 密碼在桌面卡片上。",
    gatePasswordShared: "9945",
  },
  {
    id: "g-walnut-quad",
    propertyId: "walnut",
    name: "四人房",
    bedType: "雙人床 × 2",
    description: "四人房型，兩張雙人床",
    depositAmount: 1500,
    accessMode: "password",
    gatePasswordShared: "9945",
  },
  {
    id: "g-walnut-whole",
    propertyId: "walnut",
    name: "整棟包棟",
    bedType: "包棟",
    description: "整棟包棟含客廳、廚房、烤肉區",
    depositAmount: 6000,
    accessMode: "key",
    keyPickupLocation: "民宿門口右側鑰匙盒（密碼 5588）",
    gatePasswordShared: "9945",
  },
  {
    id: "g-anping-suite",
    propertyId: "anping9",
    name: "海景套房",
    bedType: "雙人床",
    description: "面海景觀套房",
    depositAmount: 1500,
    accessMode: "password",
  },
];

const seedRooms: Room[] = [
  {
    id: "w-101",
    propertyId: "walnut",
    groupId: "g-walnut-double",
    roomNumber: "101",
    name: "101 松風",
    type: "suite",
    beds: 1,
    depositAmount: 1000,
    doorPassword: "5821",
    gatePassword: "9945",
  },
  {
    id: "w-102",
    propertyId: "walnut",
    groupId: "g-walnut-double",
    roomNumber: "102",
    name: "102 竹影",
    type: "suite",
    beds: 1,
    depositAmount: 1000,
    doorPassword: "7263",
    gatePassword: "9945",
  },
  {
    id: "w-201",
    propertyId: "walnut",
    groupId: "g-walnut-quad",
    roomNumber: "201",
    name: "201 楓月",
    type: "suite",
    beds: 2,
    depositAmount: 1500,
    doorPassword: "3311",
    gatePassword: "9945",
  },
  {
    id: "w-whole",
    propertyId: "walnut",
    groupId: "g-walnut-whole",
    roomNumber: "整棟",
    name: "整棟包棟",
    type: "whole",
    beds: 6,
    depositAmount: 6000,
    gatePassword: "9945",
  },
  {
    id: "a-201",
    propertyId: "anping9",
    groupId: "g-anping-suite",
    roomNumber: "201",
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

function emptyPhotos(): GuidePhotos {
  return {
    address: [],
    parking: [],
    gate: [],
    door: [],
    notes: [],
    emergency: [],
  };
}

const seedPaymentWalnut: PaymentInfo = {
  bankName: "胡桃國際商銀",
  bankCode: "013",
  accountName: "胡桃民宿有限公司",
  accountNumber: "1234-5678-9012",
  linePayQrDataUrl: null,
  notes: "匯款完成後請上傳付款證明。",
};
const seedPaymentAnping: PaymentInfo = {
  bankName: "台南企銀",
  bankCode: "050",
  accountName: "安平九號民宿",
  accountNumber: "9988-7766-5544",
  linePayQrDataUrl: null,
  notes: "匯款完成後請上傳付款證明。",
};

const seedGuideWalnut: Guide = {
  address: "宜蘭縣礁溪鄉溫泉路 123 號",
  parking: "民宿正對面有付費停車場（30 元/小時），或路邊白線車位。",
  gate: "大門密碼將於審核通過後提供。",
  door: "房門密碼將於審核通過後提供。",
  notes: "室內全面禁菸，請維持環境整潔。",
  emergency: "民宿聯絡電話：03-988-1234；緊急請撥 110 / 119。",
};

const seedContactWalnut: ContactChannel[] = [
  { id: uid(), type: "line", label: "LINE 官方帳號", value: "@walnutstay", enabled: true },
  { id: uid(), type: "phone", label: "民宿電話", value: "03-988-1234", enabled: true },
];

// ============ Store ============

export const usePropertyConfig = create<PropertyConfigState>()(
  persist(
    (set) => {
      const initial: PropertyConfigState = {
        properties: seedProperties,
        currentPropertyId: "walnut",

        roomGroups: seedGroups,
        rooms: seedRooms,

        depositMode: "perRoom",
        fixedDepositAmount: 1000,

        extraFeeCatalog: seedFees,

        payment: seedPaymentWalnut,
        houseRules: "",
        guide: seedGuideWalnut,
        guidePhotos: emptyPhotos(),
        faq: [],
        contactChannels: seedContactWalnut,

        passwordReleaseMode: "manual",
        passwordReleaseTime: "15:00",

        paymentByProperty: {
          walnut: seedPaymentWalnut,
          anping9: seedPaymentAnping,
        },
        houseRulesByProperty: {},
        guideByProperty: { walnut: seedGuideWalnut },
        guidePhotosByProperty: {},
        contactChannelsByProperty: { walnut: seedContactWalnut },

        update: (patch) =>
          set((state) => {
            const next: PropertyConfigState = { ...state, ...patch };
            const prevPid = state.currentPropertyId;
            const newPid = patch.currentPropertyId ?? prevPid;

            // Property switch: hydrate top-level snapshots from maps
            if (patch.currentPropertyId && patch.currentPropertyId !== prevPid) {
              next.payment =
                state.paymentByProperty[newPid] ?? {
                  bankName: "",
                  bankCode: "",
                  accountName: "",
                  accountNumber: "",
                  linePayQrDataUrl: null,
                  notes: "",
                };
              next.houseRules = state.houseRulesByProperty[newPid] ?? "";
              next.guide =
                state.guideByProperty[newPid] ?? {
                  address: "",
                  parking: "",
                  gate: "",
                  door: "",
                  notes: "",
                  emergency: "",
                };
              next.guidePhotos =
                state.guidePhotosByProperty[newPid] ?? emptyPhotos();
              next.contactChannels = state.contactChannelsByProperty[newPid] ?? [];
            }

            // Mirror top-level edits into per-property maps
            if (patch.payment) {
              next.paymentByProperty = {
                ...state.paymentByProperty,
                [newPid]: patch.payment,
              };
            }
            if (patch.houseRules !== undefined) {
              next.houseRulesByProperty = {
                ...state.houseRulesByProperty,
                [newPid]: patch.houseRules,
              };
            }
            if (patch.guide) {
              next.guideByProperty = {
                ...state.guideByProperty,
                [newPid]: patch.guide,
              };
            }
            if (patch.guidePhotos) {
              next.guidePhotosByProperty = {
                ...state.guidePhotosByProperty,
                [newPid]: patch.guidePhotos,
              };
            }
            if (patch.contactChannels) {
              next.contactChannelsByProperty = {
                ...state.contactChannelsByProperty,
                [newPid]: patch.contactChannels,
              };
            }

            return next;
          }),

        addProperty: (p) =>
          set((s) => ({ properties: [...s.properties, { ...p, id: uid() }] })),
        updateProperty: (id, patch) =>
          set((s) => ({
            properties: s.properties.map((x) => (x.id === id ? { ...x, ...patch } : x)),
          })),
        removeProperty: (id) =>
          set((s) => ({ properties: s.properties.filter((x) => x.id !== id) })),

        addRoomGroup: (g) => {
          const id = uid();
          set((s) => ({ roomGroups: [...s.roomGroups, { ...g, id }] }));
          return id;
        },
        updateRoomGroup: (id, patch) =>
          set((s) => ({
            roomGroups: s.roomGroups.map((x) => (x.id === id ? { ...x, ...patch } : x)),
          })),
        removeRoomGroup: (id) =>
          set((s) => ({
            roomGroups: s.roomGroups.filter((x) => x.id !== id),
            rooms: s.rooms.map((r) =>
              r.groupId === id ? { ...r, groupId: undefined } : r,
            ),
          })),
        duplicateRoomGroup: (id) =>
          set((s) => {
            const src = s.roomGroups.find((g) => g.id === id);
            if (!src) return {};
            return {
              roomGroups: [
                ...s.roomGroups,
                { ...src, id: uid(), name: src.name + "（副本）" },
              ],
            };
          }),

        addRoom: (r) => set((s) => ({ rooms: [...s.rooms, { ...r, id: uid() }] })),
        updateRoom: (id, patch) =>
          set((s) => ({
            rooms: s.rooms.map((x) => (x.id === id ? { ...x, ...patch } : x)),
          })),
        removeRoom: (id) => set((s) => ({ rooms: s.rooms.filter((x) => x.id !== id) })),
        duplicateRoom: (id) =>
          set((s) => {
            const src = s.rooms.find((r) => r.id === id);
            if (!src) return {};
            return {
              rooms: [
                ...s.rooms,
                {
                  ...src,
                  id: uid(),
                  roomNumber: (src.roomNumber ?? "") + "-副本",
                  doorPassword: "",
                  name: (src.name || "") + "（副本）",
                },
              ],
            };
          }),

        addExtraFee: (f) =>
          set((s) => ({ extraFeeCatalog: [...s.extraFeeCatalog, { ...f, id: uid() }] })),
        updateExtraFee: (id, patch) =>
          set((s) => ({
            extraFeeCatalog: s.extraFeeCatalog.map((x) =>
              x.id === id ? { ...x, ...patch } : x,
            ),
          })),
        removeExtraFee: (id) =>
          set((s) => ({
            extraFeeCatalog: s.extraFeeCatalog.filter((x) => x.id !== id),
          })),

        addFaq: (f) => set((s) => ({ faq: [...s.faq, { ...f, id: uid() }] })),
        updateFaq: (id, patch) =>
          set((s) => ({ faq: s.faq.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
        removeFaq: (id) => set((s) => ({ faq: s.faq.filter((x) => x.id !== id) })),

        addContactChannel: (c) =>
          set((s) => {
            const list = [...s.contactChannels, { ...c, id: uid() }];
            return {
              contactChannels: list,
              contactChannelsByProperty: {
                ...s.contactChannelsByProperty,
                [s.currentPropertyId]: list,
              },
            };
          }),
        updateContactChannel: (id, patch) =>
          set((s) => {
            const list = s.contactChannels.map((x) =>
              x.id === id ? { ...x, ...patch } : x,
            );
            return {
              contactChannels: list,
              contactChannelsByProperty: {
                ...s.contactChannelsByProperty,
                [s.currentPropertyId]: list,
              },
            };
          }),
        removeContactChannel: (id) =>
          set((s) => {
            const list = s.contactChannels.filter((x) => x.id !== id);
            return {
              contactChannels: list,
              contactChannelsByProperty: {
                ...s.contactChannelsByProperty,
                [s.currentPropertyId]: list,
              },
            };
          }),

        copyFromProperty: (fromId, toId, kinds) =>
          set((s) => {
            const next: Partial<PropertyConfigState> = {};
            if (kinds.includes("payment")) {
              const p = s.paymentByProperty[fromId];
              if (p) {
                next.paymentByProperty = {
                  ...s.paymentByProperty,
                  [toId]: { ...p },
                };
                if (toId === s.currentPropertyId) next.payment = { ...p };
              }
            }
            if (kinds.includes("houseRules")) {
              const v = s.houseRulesByProperty[fromId];
              if (v !== undefined) {
                next.houseRulesByProperty = {
                  ...s.houseRulesByProperty,
                  [toId]: v,
                };
                if (toId === s.currentPropertyId) next.houseRules = v;
              }
            }
            if (kinds.includes("guide")) {
              const g = s.guideByProperty[fromId];
              if (g) {
                next.guideByProperty = { ...s.guideByProperty, [toId]: { ...g } };
                if (toId === s.currentPropertyId) next.guide = { ...g };
              }
              const gp = s.guidePhotosByProperty[fromId];
              if (gp) {
                next.guidePhotosByProperty = {
                  ...s.guidePhotosByProperty,
                  [toId]: { ...gp },
                };
                if (toId === s.currentPropertyId) next.guidePhotos = { ...gp };
              }
            }
            if (kinds.includes("contact")) {
              const c = s.contactChannelsByProperty[fromId] ?? [];
              next.contactChannelsByProperty = {
                ...s.contactChannelsByProperty,
                [toId]: c.map((x) => ({ ...x, id: uid() })),
              };
              if (toId === s.currentPropertyId)
                next.contactChannels = next.contactChannelsByProperty[toId] ?? [];
            }
            return next;
          }),
      };
      return initial;
    },
    {
      name: "walnut-property-config-v2",
      version: 2,
    },
  ),
);

export function computeDeposit(
  state: PropertyConfigState,
  selectedRoomIds: string[],
): number {
  if (state.depositMode === "none") return 0;
  if (state.depositMode === "fixed") return state.fixedDepositAmount;
  return state.rooms
    .filter((r) => selectedRoomIds.includes(r.id))
    .reduce((sum, r) => {
      if (r.depositAmount) return sum + r.depositAmount;
      const g = state.roomGroups.find((x) => x.id === r.groupId);
      return sum + (g?.depositAmount ?? 0);
    }, 0);
}

/** Convenience helpers. */
export function currentProperty(s: PropertyConfigState): Property | undefined {
  return s.properties.find((p) => p.id === s.currentPropertyId);
}
