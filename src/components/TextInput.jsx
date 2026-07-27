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
  return (
    <div className={compact ? "mb-2.5" : "mb-6"}>
      <label
        className={`mb-1 block font-medium text-[#c77dff] ${
          compact ? "text-[11px]" : "mb-2 text-sm"
        }`}
      >
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={onChange}
        className={`w-full bg-[#3c096c] text-white outline-none transition focus:ring-2 focus:ring-[#9d4edd] disabled:opacity-60 ${
          compact
            ? "rounded-xl px-3 py-2 text-sm"
            : "rounded-2xl px-4 py-3"
        }`}
      />
    </div>
  );
};

export default TextInput;
