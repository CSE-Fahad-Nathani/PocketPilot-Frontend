import { FiCalendar } from "react-icons/fi";

import { formatDisplayDate } from "../utils/formatDate";

const TextInput = ({
  label,
  name,
  placeholder,
  value,
  onChange,
  disabled = false,
  type = "text",
  compact = false,
}) => {
  const shellClass = compact ? "mb-2.5" : "mb-6";
  const labelClass = `mb-1 block font-medium text-[#c77dff] ${
    compact ? "text-[11px]" : "mb-2 text-sm"
  }`;
  const fieldClass = `w-full bg-[#3c096c] text-white outline-none transition focus:ring-2 focus:ring-[#9d4edd] disabled:opacity-60 ${
    compact ? "rounded-xl px-3 py-2 text-sm" : "rounded-2xl px-4 py-3"
  }`;

  if (type === "date") {
    const displayValue = value ? formatDisplayDate(value) : "";

    return (
      <div className={shellClass}>
        <label className={labelClass}>{label}</label>

        <div className="relative">
          <div
            className={`${fieldClass} pointer-events-none flex items-center justify-between pr-10 ${
              disabled ? "opacity-60" : ""
            }`}
          >
            <span className={displayValue ? "text-white" : "text-[#c77dff]/70"}>
              {displayValue || placeholder || "Select date"}
            </span>
          </div>

          <FiCalendar
            size={compact ? 14 : 16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#c77dff]"
          />

          <input
            type="date"
            name={name}
            value={value || ""}
            disabled={disabled}
            onChange={onChange}
            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={shellClass}>
      <label className={labelClass}>{label}</label>

      <input
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={onChange}
        className={fieldClass}
      />
    </div>
  );
};

export default TextInput;
