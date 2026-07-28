const BalanceCard = ({
  currentBalance,
  totalIncome,
  totalBudget,
  totalExpense = 0,
  savedAmount = 0,
}) => {
  const balanceValue = Number(currentBalance) || 0;
  const leftValue = Number(savedAmount) || 0;

  const stats = [
    {
      label: "Income",
      value: totalIncome,
      tone: "text-[#4ade80]",
      labelTone: "text-[#86efac]",
      track: "rgba(34, 197, 94, 0.14)",
      border: "rgba(74, 222, 128, 0.22)",
    },
    {
      label: "Spent",
      value: totalExpense,
      tone: "text-[#fb923c]",
      labelTone: "text-[#fdba74]",
      track: "rgba(249, 115, 22, 0.14)",
      border: "rgba(251, 146, 60, 0.22)",
    },
    {
      label: "Budget",
      value: totalBudget,
      tone: "text-[#38bdf8]",
      labelTone: "text-[#7dd3fc]",
      track: "rgba(56, 189, 248, 0.14)",
      border: "rgba(125, 211, 252, 0.22)",
    },
    {
      label: "Left",
      value: savedAmount,
      tone: leftValue < 0 ? "text-[#f87171]" : "text-[#eab308]",
      labelTone: leftValue < 0 ? "text-[#fca5a5]" : "text-[#fde047]",
      track:
        leftValue < 0
          ? "rgba(239, 68, 68, 0.14)"
          : "rgba(234, 179, 8, 0.14)",
      border:
        leftValue < 0
          ? "rgba(248, 113, 113, 0.22)"
          : "rgba(253, 224, 71, 0.22)",
    },
  ];

  return (
    <div className="rounded-2xl border border-[#e0aaff1f] bg-[#240046] px-4 py-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-[#c77dff]">
            Balance
          </p>
          <h2
            className={`mt-0.5 text-2xl font-bold leading-none ${
              balanceValue < 0 ? "text-[#f87171]" : "text-[#4ade80]"
            }`}
          >
            ₹{balanceValue.toLocaleString()}
          </h2>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-1.5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border px-1.5 py-2 text-center"
            style={{
              background: stat.track,
              borderColor: stat.border,
            }}
          >
            <p className={`text-[10px] leading-none ${stat.labelTone}`}>
              {stat.label}
            </p>
            <p className={`mt-1 truncate text-xs font-semibold ${stat.tone}`}>
              ₹{Number(stat.value).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BalanceCard;
