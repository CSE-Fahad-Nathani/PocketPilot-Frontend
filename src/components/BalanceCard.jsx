const BalanceCard = ({
  currentBalance,
  totalIncome,
  totalBudget,
  totalExpense = 0,
  savedAmount = 0,
}) => {
  const stats = [
    { label: "Income", value: totalIncome },
    { label: "Spent", value: totalExpense },
    { label: "Budget", value: totalBudget },
    { label: "Left", value: savedAmount },
  ];

  return (
    <div className="rounded-2xl border border-[#e0aaff1f] bg-[#240046] px-4 py-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-[#c77dff]">
            Balance
          </p>
          <h2 className="mt-0.5 text-2xl font-bold leading-none text-white">
            ₹{Number(currentBalance).toLocaleString()}
          </h2>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-1.5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl bg-[#3c096c] px-1.5 py-2 text-center"
          >
            <p className="text-[10px] leading-none text-[#c77dff]">
              {stat.label}
            </p>
            <p className="mt-1 truncate text-xs font-semibold text-white">
              ₹{Number(stat.value).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BalanceCard;
