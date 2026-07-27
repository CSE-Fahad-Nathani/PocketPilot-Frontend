const PrimaryButton = ({
  children,
  onClick,
  type = "button",
  className = "",
  disabled = false,
  compact = false,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
          w-full bg-[#7b2cbf]
          font-semibold text-white
          transition-all duration-200
          hover:bg-[#9d4edd]
          active:scale-[0.98]
          disabled:cursor-not-allowed
          disabled:opacity-50
          ${compact ? "rounded-xl py-2.5 text-sm" : "rounded-2xl py-4"}
          ${className}
        `}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;
