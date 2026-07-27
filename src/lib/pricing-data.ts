export type GmsTier = {
  id: string;
  name: string;
  monthlyInr: number;
  monthlyUsdApprox: number;
  isCustom?: boolean;
  users: string;
  locations: string;
  jobCardsPerMonth: string;
  supportLevel: string;
  highlights: string[];
  addOnLevelUnlocked: string;
};

export const GMS_TIERS: GmsTier[] = [
  {
    id: "foundation",
    name: "Foundation",
    monthlyInr: 3499,
    monthlyUsdApprox: 42,
    users: "Up to 3",
    locations: "1",
    jobCardsPerMonth: "350",
    supportLevel: "Email, 24–48 hr",
    addOnLevelUnlocked: "Lite",
    highlights: [
      "Complete Daily Operations & Front-Desk Basics",
      "Full Service Queue & Job Card Management",
      "Feedback forms, vehicle image sharing, SMS reminders",
      "Email support with 24–48 hour response SLA",
    ],
  },
  {
    id: "accelerate",
    name: "Accelerate",
    monthlyInr: 5999,
    monthlyUsdApprox: 72,
    users: "Up to 6",
    locations: "1",
    jobCardsPerMonth: "700",
    supportLevel: "Chat + Email, next-day",
    addOnLevelUnlocked: "Standard",
    highlights: [
      "Everything in Foundation, plus:",
      "Full System Configuration suite",
      "Manage Workshop & Manage Spares operations",
      "Coupons Management, Basic Business Reports",
      "Chat + Email support, next-business-day response",
    ],
  },
  {
    id: "momentum",
    name: "Momentum",
    monthlyInr: 9999,
    monthlyUsdApprox: 120,
    users: "Up to 12",
    locations: "Up to 2",
    jobCardsPerMonth: "1,500",
    supportLevel: "Phone + Chat, same-day",
    addOnLevelUnlocked: "Pro",
    highlights: [
      "Everything in Accelerate, plus:",
      "Full CRM suite",
      "Inventory Management & Daybook Management",
      "Counter Sales, Advanced Vehicle Service History",
      "GST Filing Reports & Report by Invoices",
    ],
  },
  {
    id: "command",
    name: "Command",
    monthlyInr: 16999,
    monthlyUsdApprox: 205,
    users: "Up to 25",
    locations: "Up to 5",
    jobCardsPerMonth: "Unlimited",
    supportLevel: "Dedicated Account Mgr",
    addOnLevelUnlocked: "Scale",
    highlights: [
      "Everything in Momentum, plus:",
      "Employee Management & Technician Productivity",
      "Store Management, Inventory Reports",
      "Business Analytics & Business Intelligence dashboards",
      "Dedicated Account Manager",
    ],
  },
  {
    id: "summit",
    name: "Summit",
    monthlyInr: 28999,
    monthlyUsdApprox: 350,
    isCustom: true,
    users: "Unlimited",
    locations: "Unlimited",
    jobCardsPerMonth: "Unlimited",
    supportLevel: "24×7 Priority + QBR",
    addOnLevelUnlocked: "Enterprise",
    highlights: [
      "Everything in Command, plus:",
      "Business Forecasting",
      "Advanced Communication suite (internal)",
      "Outsourcing Vendor Management",
      "Custom SLAs, onboarding & staff training, 24×7 priority + QBR",
    ],
  },
];

// GMS-integrated add-ons: bundle discount ~10% (15% at Enterprise) off standalone price
export type IntegratedAddOnLevel = {
  level: string;
  standaloneInr: number | null; // null = Custom
  bundledInr: number | null; // null = Custom
  detail: string;
};

export type IntegratedAddOn = {
  id: string;
  name: string;
  description: string;
  levels: IntegratedAddOnLevel[];
};

export const GMS_LEVEL_ORDER = ["Lite", "Standard", "Pro", "Scale", "Enterprise"];

export const INTEGRATED_ADDONS: IntegratedAddOn[] = [
  {
    id: "dvi",
    name: "Digital Vehicle Inspection (DVI)",
    description:
      "Unlimited inspections at every level. Pricing scales with media storage consumed.",
    levels: [
      { level: "Lite", standaloneInr: 799, bundledInr: 719, detail: "10 GB included · ₹40/GB overage" },
      { level: "Standard", standaloneInr: 1499, bundledInr: 1349, detail: "40 GB included · ₹35/GB overage" },
      { level: "Pro", standaloneInr: 2999, bundledInr: 2699, detail: "120 GB included · ₹30/GB overage" },
      { level: "Scale", standaloneInr: 5999, bundledInr: 5399, detail: "400 GB included · ₹25/GB overage" },
      { level: "Enterprise", standaloneInr: null, bundledInr: null, detail: "1 TB+/Unlimited · Negotiated overage" },
    ],
  },
  {
    id: "accounting-sync",
    name: "Accounting Sync",
    description: "Tally / QuickBooks / Zoho Books — priced by sync depth and company files.",
    levels: [
      { level: "Lite", standaloneInr: 999, bundledInr: 899, detail: "One-way export · 1 company file" },
      { level: "Standard", standaloneInr: 1999, bundledInr: 1799, detail: "Two-way sync · 2 company files" },
      { level: "Pro", standaloneInr: 3499, bundledInr: 3149, detail: "Full two-way, multi-branch · 5 company files" },
      { level: "Enterprise", standaloneInr: null, bundledInr: null, detail: "API-level custom integration · Unlimited files" },
    ],
  },
  {
    id: "vendor-ordering",
    name: "Vendor / Parts Real-Time Ordering",
    description: "Priced by number of connected vendors and purchase-order automation depth.",
    levels: [
      { level: "Lite", standaloneInr: 999, bundledInr: 899, detail: "2 vendors · Manual price-list sync" },
      { level: "Standard", standaloneInr: 1999, bundledInr: 1799, detail: "5 vendors · Real-time pricing & availability" },
      { level: "Pro", standaloneInr: 3999, bundledInr: 3599, detail: "15 vendors · Auto PO generation" },
      { level: "Enterprise", standaloneInr: null, bundledInr: null, detail: "Unlimited vendors · EDI-level integration" },
    ],
  },
  {
    id: "insurance-claims",
    name: "Insurance Claims Management",
    description: "Priced by number of connected insurers and reconciliation automation.",
    levels: [
      { level: "Lite", standaloneInr: 799, bundledInr: 719, detail: "Manual claim status tracking" },
      { level: "Standard", standaloneInr: 1999, bundledInr: 1799, detail: "API integration with 2 insurers" },
      { level: "Pro", standaloneInr: 3499, bundledInr: 3149, detail: "Up to 8 insurers + auto reconciliation" },
      { level: "Enterprise", standaloneInr: null, bundledInr: null, detail: "Unlimited insurers · Dedicated claims desk" },
    ],
  },
];

// Standalone add-ons: no bundle discount, independent of GMS tier
export type StandaloneLevel = {
  level: string;
  feeInr: number;
  detail: string;
};

export const SMS_WHATSAPP_LEVELS: StandaloneLevel[] = [
  { level: "Lite", feeInr: 499, detail: "300 SMS · 200 WA Utility/Auth" },
  { level: "Standard", feeInr: 999, detail: "1,000 SMS · 800 WA Utility/Auth · 100 WA Marketing" },
  { level: "Pro", feeInr: 2499, detail: "3,000 SMS · 2,500 WA Utility/Auth · 500 WA Marketing" },
  { level: "Scale", feeInr: 5999, detail: "8,000 SMS · 6,000 WA Utility/Auth · 1,500 WA Marketing" },
];

export const PAYMENT_GATEWAY_LEVELS: StandaloneLevel[] = [
  { level: "Lite", feeInr: 0, detail: "2.4% txn fee · Up to ₹2 lakh/mo included" },
  { level: "Standard", feeInr: 499, detail: "2.0% txn fee · Up to ₹5 lakh/mo included" },
  { level: "Pro", feeInr: 1499, detail: "1.7% txn fee · Up to ₹15 lakh/mo · UPI QR + payment links" },
  { level: "Enterprise", feeInr: 0, detail: "~1.2–1.5% txn fee · Unlimited · Dedicated settlement (custom fee)" },
];

export const HRMS_PER_EMPLOYEE: { level: string; baseFeeInr: number; perEmployeeInr: number; detail: string }[] = [
  { level: "Lite", baseFeeInr: 999, perEmployeeInr: 40, detail: "Attendance tracking, payslip generation" },
  { level: "Standard", baseFeeInr: 1999, perEmployeeInr: 65, detail: "Onboarding-to-exit workflow, reimbursements" },
  { level: "Pro", baseFeeInr: 3499, perEmployeeInr: 90, detail: "Automated arrears/salary revision, one-click payroll" },
];

export const USD_PER_INR = 42 / 3499; // derived from Foundation tier ratio in the guide (~0.012)

export function inrToUsd(inr: number): number {
  return Math.round(inr * USD_PER_INR);
}

export function formatInr(value: number): string {
  return "₹" + value.toLocaleString("en-IN");
}
