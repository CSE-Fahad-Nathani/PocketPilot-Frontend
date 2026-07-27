const SummaryCard = ({
    title,
    value,
    subtitle,
    bgColor = "bg-white",
  }) => {
    return (
      <div className={`${bgColor} rounded-xl p-4 shadow`}>
        <p className="text-sm text-gray-500">{title}</p>
  
        <h2 className="text-2xl font-bold mt-1">
          ₹ {value}
        </h2>
  
        {subtitle && (
          <p className="text-xs text-gray-400 mt-2">
            {subtitle}
          </p>
        )}
      </div>
    );
  };
  
  export default SummaryCard;