import {
  FiArchive,
  FiArrowDownLeft,
  FiArrowUpRight,
  FiDollarSign,
  FiTrendingDown,
} from "react-icons/fi";

import { formatDisplayDate, parseDisplayDate } from "./formatDate";

export const TRANSACTION_FILTERS = [
  { id: "all", label: "All", types: null },
  { id: "allocation", label: "Allocation", types: ["ALLOCATION"] },
  { id: "withdrawal", label: "Withdrawal", types: ["WITHDRAWAL"] },
  { id: "transfer_in", label: "Transfer In", types: ["TRANSFER_IN"] },
  { id: "transfer_out", label: "Transfer Out", types: ["TRANSFER_OUT"] },
  { id: "archived", label: "Archived", types: ["ARCHIVE"] },
];

export const TRANSACTION_META = {
  ALLOCATION: {
    label: "Allocation",
    Icon: FiDollarSign,
    tone: "text-[#4ade80]",
    badge: "bg-[#4ade80]/15 border-[#4ade80]/30 text-[#86efac]",
    sign: "+",
  },
  WITHDRAWAL: {
    label: "Withdrawal",
    Icon: FiTrendingDown,
    tone: "text-[#f87171]",
    badge: "bg-[#ef4444]/15 border-[#ef4444]/30 text-[#fca5a5]",
    sign: "-",
  },
  TRANSFER_IN: {
    label: "Transfer In",
    Icon: FiArrowDownLeft,
    tone: "text-[#4ade80]",
    badge: "bg-[#4ade80]/15 border-[#4ade80]/30 text-[#86efac]",
    sign: "+",
  },
  TRANSFER_OUT: {
    label: "Transfer Out",
    Icon: FiArrowUpRight,
    tone: "text-[#fb923c]",
    badge: "bg-[#f59e0b]/15 border-[#f59e0b]/30 text-[#fcd34d]",
    sign: "-",
  },
  ARCHIVE: {
    label: "Bucket Archived",
    Icon: FiArchive,
    tone: "text-[#9ca3af]",
    badge: "bg-[#6b7280]/15 border-[#6b7280]/30 text-[#d1d5db]",
    sign: null,
  },
};

export const getTransactionMeta = (type) => {
  return TRANSACTION_META[String(type || "").toUpperCase()] || {
    label: type || "Transaction",
    Icon: FiDollarSign,
    tone: "text-[#c77dff]",
    badge: "bg-[#5a189a]/15 border-[#7b2cbf]/30 text-[#e0aaff]",
    sign: null,
  };
};

export const formatTransactionAmount = (transaction) => {
  const type = String(transaction.type || "").toUpperCase();

  if (type === "ARCHIVE") {
    return "Archived";
  }

  const meta = getTransactionMeta(type);
  const amount = Number(transaction.amount) || 0;

  if (!meta.sign) {
    return `₹${amount.toLocaleString("en-IN")}`;
  }

  return `${meta.sign}₹${amount.toLocaleString("en-IN")}`;
};

const toDateKey = (value) => {
  const date = parseDisplayDate(value);
  if (!date) return "unknown";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatGroupLabel = (value) => {
  const date = parseDisplayDate(value);
  if (!date) return "Unknown";

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const key = toDateKey(date);
  if (key === toDateKey(today)) return "Today";
  if (key === toDateKey(yesterday)) return "Yesterday";

  return formatDisplayDate(date);
};

export const formatTransactionTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const groupTransactionsByDate = (transactions) => {
  const groups = new Map();

  transactions.forEach((item) => {
    const key = toDateKey(item.createdAt);
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: formatGroupLabel(item.createdAt),
        items: [],
      });
    }
    groups.get(key).items.push(item);
  });

  return Array.from(groups.values());
};

export const filterTransactions = (transactions, filterId, query) => {
  const filter = TRANSACTION_FILTERS.find((item) => item.id === filterId);
  const normalizedQuery = String(query || "").trim().toLowerCase();

  return transactions.filter((item) => {
    const matchesFilter =
      !filter?.types || filter.types.includes(String(item.type).toUpperCase());

    if (!matchesFilter) return false;
    if (!normalizedQuery) return true;

    const haystack = [item.title, item.bucketName, item.note]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
};
