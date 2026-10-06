const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const ordinal = (day) => {
  const rem100 = day % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${day}th`;

  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
};

/** Parse date-only strings as local calendar dates to avoid UTC shift. */
export const parseDisplayDate = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const raw = String(value).trim();
  const dateOnly = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dateOnly) {
    const year = Number(dateOnly[1]);
    const month = Number(dateOnly[2]) - 1;
    const day = Number(dateOnly[3]);
    const date = new Date(year, month, day);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * UI date format: "6th Oct 2026"
 * @param {string|Date} value
 * @param {{ includeYear?: boolean }} [options]
 */
export const formatDisplayDate = (value, options = {}) => {
  const { includeYear = true } = options;
  const date = parseDisplayDate(value);
  if (!date) return value ? String(value).slice(0, 10) : "—";

  const day = ordinal(date.getDate());
  const month = MONTHS[date.getMonth()];

  if (!includeYear) return `${day} ${month}`;
  return `${day} ${month} ${date.getFullYear()}`;
};
