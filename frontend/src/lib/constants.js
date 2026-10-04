// These values MUST match the backend (main.py) exactly.

export const STATUSES = [
  "Pending",
  "Picked Up",
  "In Transit",
  "Delivered",
  "Cancelled",
];

// Normal delivery journey (Cancelled is a separate end-state)
export const JOURNEY = ["Pending", "Picked Up", "In Transit", "Delivered"];

export const CATEGORIES = [
  { value: "Electronics", label: "Electronics" },
  { value: "Documents", label: "Documents" },
  { value: "Clothing", label: "Clothing" },
  { value: "Food", label: "Food / Groceries" },
  { value: "Others", label: "Others" },
];

// Backend pricing: charge = 60 + weight_kg * 20
export const BASE_CHARGE = 60;
export const PER_KG_CHARGE = 20;

export const calcCharge = (weight) =>
  BASE_CHARGE + (Number(weight) || 0) * PER_KG_CHARGE;

export const SUPPORT_EMAIL = "support@courier.com";
export const SUPPORT_PHONE = "+880 1572915166";
export const SUPPORT_PHONE_HREF = "+8801572915166";

export const formatBDT = (value) =>
  `৳${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const formatDate = (value) => {
  if (!value) return "N/A";
  const d = parseServerDate(value);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatDateTime = (value) => {
  if (!value) return "N/A";
  const d = parseServerDate(value);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Backend stores naive UTC (datetime.utcnow) without a "Z" suffix.
function parseServerDate(value) {
  const str = String(value);
  const hasZone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(str);
  return new Date(hasZone ? str : `${str}Z`);
}

export const maskPhone = (phone) => {
  const p = String(phone || "");
  if (p.length < 6) return p;
  return `${p.slice(0, 3)}${"•".repeat(p.length - 5)}${p.slice(-2)}`;
};

export const BD_PHONE_REGEX = /^(\+?88)?01[3-9]\d{8}$/;
