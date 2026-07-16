import type { BookingPlatform, CheckinStatus, DepositStatus } from "./checkin-store";

export interface OwnerSubmission {
  id: string;
  propertyId: string;
  name: string;
  platform: BookingPlatform;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: CheckinStatus;
  deposit: DepositStatus;
  phone: string;
  email: string;
  arrivalTime: string;
  hasPet: boolean;
  needParking: boolean;
  notes: string;
  idUploaded: boolean;
  proofUploaded: boolean;
  faqRead: boolean;
  rulesAgreed: boolean;
  submittedAt: string;
}

export const demoSubmissions: OwnerSubmission[] = [
  {
    id: "demo",
    propertyId: "walnut",
    name: "王小明",
    platform: "booking",
    checkIn: "2026-07-18",
    checkOut: "2026-07-20",
    guests: 2,
    status: "submitted",
    deposit: "pending",
    phone: "0912-345-678",
    email: "ming@example.com",
    arrivalTime: "16:00",
    hasPet: false,
    needParking: true,
    notes: "希望有面山的房型，並協助預約礁溪泡湯券。",
    idUploaded: true,
    proofUploaded: true,
    faqRead: true,
    rulesAgreed: true,
    submittedAt: "2026-07-14 10:24",
  },
  {
    id: "s2",
    propertyId: "anping9",
    name: "陳美惠",
    platform: "line",
    checkIn: "2026-07-19",
    checkOut: "2026-07-21",
    guests: 4,
    status: "need_more_info",
    deposit: "unpaid",
    phone: "0922-111-222",
    email: "meihui@example.com",
    arrivalTime: "18:30",
    hasPet: true,
    needParking: true,
    notes: "攜帶一隻中型犬。",
    idUploaded: true,
    proofUploaded: false,
    faqRead: true,
    rulesAgreed: true,
    submittedAt: "2026-07-13 21:12",
  },
  {
    id: "s3",
    propertyId: "walnut",
    name: "林大成",
    platform: "airbnb",
    checkIn: "2026-07-20",
    checkOut: "2026-07-22",
    guests: 3,
    status: "approved",
    deposit: "confirmed",
    phone: "0933-987-654",
    email: "dacheng@example.com",
    arrivalTime: "15:00",
    hasPet: false,
    needParking: false,
    notes: "",
    idUploaded: true,
    proofUploaded: true,
    faqRead: true,
    rulesAgreed: true,
    submittedAt: "2026-07-13 14:05",
  },
  {
    id: "s4",
    propertyId: "anping9",
    name: "黃雅琪",
    platform: "agoda",
    checkIn: "2026-07-22",
    checkOut: "2026-07-23",
    guests: 2,
    status: "submitted",
    deposit: "pending",
    phone: "0955-321-987",
    email: "yaqi@example.com",
    arrivalTime: "17:00",
    hasPet: false,
    needParking: true,
    notes: "希望能安排提早入住。",
    idUploaded: true,
    proofUploaded: true,
    faqRead: true,
    rulesAgreed: true,
    submittedAt: "2026-07-14 08:47",
  },
  {
    id: "s5",
    propertyId: "walnut",
    name: "劉承翰",
    platform: "official",
    checkIn: "2026-07-25",
    checkOut: "2026-07-27",
    guests: 6,
    status: "submitted",
    deposit: "unpaid",
    phone: "0966-654-321",
    email: "chenghan@example.com",
    arrivalTime: "20:00",
    hasPet: false,
    needParking: true,
    notes: "包棟入住，會有六位大人。",
    idUploaded: false,
    proofUploaded: false,
    faqRead: true,
    rulesAgreed: false,
    submittedAt: "2026-07-14 11:53",
  },
  {
    id: "s6",
    propertyId: "anping9",
    name: "張慧君",
    platform: "phone",
    checkIn: "2026-07-15",
    checkOut: "2026-07-16",
    guests: 2,
    status: "completed",
    deposit: "confirmed",
    phone: "0977-000-111",
    email: "huijun@example.com",
    arrivalTime: "16:30",
    hasPet: false,
    needParking: false,
    notes: "",
    idUploaded: true,
    proofUploaded: true,
    faqRead: true,
    rulesAgreed: true,
    submittedAt: "2026-07-12 09:00",
  },
];

export const ownerStats = {
  today: 3,
  awaitingReview: 3,
  needMoreInfo: 1,
  approved: 1,
  depositPending: 2,
};
