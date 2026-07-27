/**
 * Category-specific expense fields collected into `extraData`.
 * Matched by category.type first, then by category name keywords.
 */

export const EXTRA_DATA_FIELDS = {
  fuel: [
    {
      key: "distance",
      label: "Distance covered (km)",
      type: "number",
      placeholder: "230",
      step: "0.1",
    },
    {
      key: "liters",
      label: "Fuel filled (L)",
      type: "number",
      placeholder: "12.75",
      step: "0.01",
    },
    {
      key: "mileage",
      label: "Mileage (km/L)",
      type: "number",
      placeholder: "Auto",
      readOnly: true,
      computed: true,
    },
  ],
  shopping: [
    {
      key: "shopName",
      label: "Shop Name",
      type: "text",
      placeholder: "DMart",
    },
    {
      key: "paymentMethod",
      label: "Payment Method",
      type: "text",
      placeholder: "UPI / Cash / Card",
    },
  ],
  medical: [
    {
      key: "hospital",
      label: "Hospital",
      type: "text",
      placeholder: "Apollo",
    },
    {
      key: "doctor",
      label: "Doctor",
      type: "text",
      placeholder: "Dr Shah",
    },
  ],
  travel: [
    {
      key: "from",
      label: "From",
      type: "text",
      placeholder: "Nashik",
    },
    {
      key: "to",
      label: "To",
      type: "text",
      placeholder: "Pune",
    },
    {
      key: "distance",
      label: "Distance (km)",
      type: "number",
      placeholder: "210",
    },
  ],
};

/** EMI / SIP / Bills / Gym / loans — paid/unpaid fixed flow */
const SIMPLE_EXPENSE_TYPES = new Set([
  "emi",
  "sip",
  "subscription",
  "bills",
]);

const SIMPLE_NAME_MATCH = /emi|loan|sip|gym|subscription|bills?/i;

export const isFixedPaymentType = (type) => {
  return SIMPLE_EXPENSE_TYPES.has(String(type || "").toLowerCase());
};

export const isSimpleExpense = (category) => {
  if (!category) return false;

  const type = String(category.type || "").toLowerCase();
  if (SIMPLE_EXPENSE_TYPES.has(type)) return true;

  return SIMPLE_NAME_MATCH.test(String(category.name || ""));
};

export const hidesReasonField = (category) => {
  if (!category) return false;
  if (isSimpleExpense(category)) return true;
  return resolveExtraDataType(category) === "fuel";
};

const NAME_ALIASES = [
  { match: /fuel|petrol|diesel/i, type: "fuel" },
  { match: /shop|mart|grocery/i, type: "shopping" },
  { match: /medical|hospital|health|doctor/i, type: "medical" },
  { match: /travel|trip|transport/i, type: "travel" },
  { match: /emi|loan/i, type: "emi" },
];

export const resolveExtraDataType = (category) => {
  if (!category) return null;

  const type = String(category.type || "").toLowerCase();
  if (EXTRA_DATA_FIELDS[type]) return type;

  const name = String(category.name || "");
  const alias = NAME_ALIASES.find((item) => item.match.test(name));
  return alias?.type || null;
};

export const getExtraDataFields = (category) => {
  if (isSimpleExpense(category)) return [];

  const type = resolveExtraDataType(category);
  return type ? EXTRA_DATA_FIELDS[type] : [];
};

export const emptyExtraData = (fields) => {
  return fields.reduce((acc, field) => {
    acc[field.key] = "";
    return acc;
  }, {});
};

/** Access petrol pump rate used to estimate liters from amount */
export const FUEL_PRICE_PER_LITER = 112.51;

export const calcFuelLitersFromAmount = (amount) => {
  const value = Number(amount);
  if (!value || value <= 0) return "";
  return (value / FUEL_PRICE_PER_LITER).toFixed(2);
};

/** Estimated distance from liters (default mileage assumption) */
export const FUEL_KM_PER_LITER = 50;

export const calcFuelDistanceFromLiters = (liters) => {
  const value = Number(liters);
  if (!value || value <= 0) return "";
  return (value * FUEL_KM_PER_LITER).toFixed(2);
};

export const calcFuelMileage = (distance, liters) => {
  const d = Number(distance);
  const l = Number(liters);

  if (!d || !l || l <= 0) return "";

  return (d / l).toFixed(2);
};

const PERSONAL_REASON_SUGGESTIONS = [
  "Cafe",
  "Soda",
  "Gaming",
  "Outing",
  "Dinner",
  "Movies",
  "Haircut",
];

/** Quick reason picks by category name / type — empty = free text only */
export const getReasonSuggestions = (category) => {
  if (!category) return [];

  const name = String(category.name || "").toLowerCase();
  const type = String(category.type || "").toLowerCase();

  if (name.includes("personal") || type === "default") {
    return PERSONAL_REASON_SUGGESTIONS;
  }

  return [];
};

export const buildExtraDataPayload = (fields, values) => {
  const extraData = {};

  fields.forEach((field) => {
    const raw = values[field.key];

    if (raw === undefined || raw === null || String(raw).trim() === "") {
      return;
    }

    if (field.type === "number") {
      extraData[field.key] = Number(raw);
      return;
    }

    extraData[field.key] = String(raw).trim();
  });

  return extraData;
};

const EXTRA_DATA_LABELS = {
  distance: "Distance",
  liters: "Liters",
  mileage: "Mileage",
  shopName: "Shop",
  paymentMethod: "Payment",
  hospital: "Hospital",
  doctor: "Doctor",
  from: "From",
  to: "To",
  bank: "Bank",
  emiMonth: "EMI month",
};

export const formatExtraDataSummary = (extraData) => {
  if (!extraData || typeof extraData !== "object") return [];

  return Object.entries(extraData)
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .map(([key, value]) => {
      const label = EXTRA_DATA_LABELS[key] || key;
      if (key === "distance") return `${label}: ${value} km`;
      if (key === "liters") return `${label}: ${value} L`;
      if (key === "mileage") return `${label}: ${value} km/L`;
      return `${label}: ${value}`;
    });
};
