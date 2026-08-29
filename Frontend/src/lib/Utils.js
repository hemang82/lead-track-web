// Status metadata — label + tailwind classes, used across all pages
export const STATUS_META = {
  new: { label: "New", text: "text-blue-700", bg: "bg-blue-50", dot: "bg-blue-600" },
  contacted: { label: "Contacted", text: "text-amber-700", bg: "bg-amber-50", dot: "bg-amber-600" },
  qualified: { label: "Qualified", text: "text-emerald-700", bg: "bg-emerald-50", dot: "bg-emerald-600" },
  lost: { label: "Lost", text: "text-stone-600", bg: "bg-stone-100", dot: "bg-stone-500" },
};

export const LEAD_SOURCES = [
  "Website",
  "Referral",
  "LinkedIn",
  "Twitter",
  "Google Ads",
  "Cold Call",
  "Other",
];

export function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatDateTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export function formatPhone(phone) {
  if (!phone) return "";
  const cleaned = String(phone).replace(/\D/g, "");
  if (cleaned.startsWith("91") && cleaned.length === 12) {
    const num = cleaned.slice(2);
    return `+91 ${num.slice(0, 5)} ${num.slice(5)}`;
  }
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
}

export function getCleanPhoneDigits(phone) {
  if (!phone) return "";
  const cleaned = String(phone).replace(/\D/g, "");
  if (cleaned.startsWith("91") && cleaned.length === 12) {
    return cleaned.slice(2);
  }
  if (cleaned.length >= 10) {
    return cleaned.slice(-10);
  }
  return cleaned;
}

export function validateLead({ name, email, phone, source }) {
  const errors = {};
  if (!name || !name.trim()) errors.name = "Name is required";
  if (!email || !email.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address";
  if (!phone || !phone.trim()) errors.phone = "Phone is required";
  if (!source || !source.trim()) errors.source = "Source is required";
  return errors;
}
 