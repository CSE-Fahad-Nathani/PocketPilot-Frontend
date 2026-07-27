import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Compact text input with quick-pick suggestions.
 * User can select a suggestion or type any custom name.
 */
const SuggestTextInput = ({
  label = "Name",
  name = "name",
  placeholder = "Select or type",
  value,
  onChange,
  suggestions = [],
  onSelectSuggestion,
  compact = true,
  disabled = false,
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const filtered = useMemo(() => {
    const query = String(value || "").trim().toLowerCase();
    if (!query) return suggestions;

    return suggestions.filter((item) =>
      item.toLowerCase().includes(query)
    );
  }, [suggestions, value]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleSelect = (suggestion) => {
    if (onSelectSuggestion) {
      onSelectSuggestion(suggestion);
    } else {
      onChange({ target: { name, value: suggestion } });
    }
    setOpen(false);
  };

  return (
    <div
      ref={rootRef}
      className={`relative min-w-0 ${compact ? "" : "mb-6"} ${className}`}
    >
      <label
        className={`mb-1 block font-medium text-[#c77dff] ${
          compact ? "text-[11px]" : "mb-2 text-sm"
        }`}
      >
        {label}
      </label>

      <input
        type="text"
        name={name}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        onChange={(e) => {
          onChange(e);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className={`w-full bg-[#3c096c] text-white outline-none transition focus:ring-2 focus:ring-[#9d4edd] disabled:opacity-60 ${
          compact
            ? "rounded-xl px-2.5 py-2 text-sm"
            : "rounded-2xl px-4 py-3"
        }`}
      />

      {open && filtered.length > 0 && (
        <div className="absolute top-full right-0 left-0 z-50 mt-1 max-h-48 overflow-y-auto rounded-lg border border-[#7b2cbf]/50 bg-[#240046] shadow-xl shadow-black/40">
          {filtered.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleSelect(item)}
              className={`flex w-full px-2.5 py-1.5 text-left text-xs transition ${
                item === value
                  ? "bg-[#5a189a]/50 text-white"
                  : "text-[#e0aaff] active:bg-[#3c096c]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SuggestTextInput;
