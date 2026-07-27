const PageHeader = ({
  title,
  subtitle,
  right,
  compact = false,
}) => {
  return (
    <div
      className={`flex items-start justify-between ${
        compact ? "mb-3" : "mb-8"
      }`}
    >
      <div className="min-w-0">
        {subtitle && (
          <p
            className={`text-[#c77dff] ${
              compact ? "text-[11px]" : "text-sm"
            }`}
          >
            {subtitle}
          </p>
        )}

        <h1
          className={`font-bold text-white ${
            compact
              ? "mt-0.5 text-lg leading-tight"
              : "mt-1 text-3xl"
          }`}
        >
          {title}
        </h1>
      </div>

      {right}
    </div>
  );
};

export default PageHeader;
