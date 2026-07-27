const getBudgetStatus = (percent) => {
  if (percent > 100) {
    return {
      key: "over",
      bar: "#7f1d1d",
      text: "#fca5a5",
      track: "rgba(127, 29, 29, 0.25)",
    };
  }

  if (percent >= 90) {
    return {
      key: "critical",
      bar: "#ef4444",
      text: "#f87171",
      track: "rgba(239, 68, 68, 0.2)",
    };
  }

  if (percent >= 75) {
    return {
      key: "high",
      bar: "#f97316",
      text: "#fb923c",
      track: "rgba(249, 115, 22, 0.2)",
    };
  }

  if (percent >= 50) {
    return {
      key: "mid",
      bar: "#eab308",
      text: "#facc15",
      track: "rgba(234, 179, 8, 0.2)",
    };
  }

  if (percent >= 25) {
    return {
      key: "ok",
      bar: "#84cc16",
      text: "#a3e635",
      track: "rgba(132, 204, 22, 0.2)",
    };
  }

  return {
    key: "safe",
    bar: "#22c55e",
    text: "#4ade80",
    track: "rgba(34, 197, 94, 0.2)",
  };
};

const BudgetCard = ({ category, spent = 0 }) => {
  const budget = Number(category.budget) || 0;
  const spentAmount = Number(spent) || 0;
  const remaining = budget - spentAmount;
  const rawPercent = budget > 0 ? (spentAmount / budget) * 100 : 0;
  const barWidth = Math.min(rawPercent, 100);
  const status = getBudgetStatus(rawPercent);
  const isOver = rawPercent > 100;

  return (
    <div
      className={`rounded-2xl border bg-[#240046] px-3 py-2.5 ${
        isOver ? "budget-card-over" : "border-[#e0aaff1f]"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ background: status.bar }}
        />

        <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-white">
          {category.name}
        </h3>

        <span
          className="shrink-0 text-xs font-semibold"
          style={{ color: status.text }}
        >
          {rawPercent.toFixed(0)}%
        </span>
      </div>

      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full"
        style={{ background: status.track }}
      >
        <div
          className="h-full rounded-full transition-[width,background-color] duration-300 ease-out"
          style={{
            width: `${barWidth}%`,
            background: status.bar,
          }}
        />
      </div>

      <div className="mt-1.5 flex items-center justify-between text-[11px]">
        <span className="text-[#c77dff]">
          ₹{spentAmount.toLocaleString()}
          <span className="text-[#9d4edd]"> / ₹{budget.toLocaleString()}</span>
        </span>
        <span style={{ color: status.text }}>
          {isOver
            ? `₹${Math.abs(remaining).toLocaleString()} over`
            : `₹${remaining.toLocaleString()} left`}
        </span>
      </div>
    </div>
  );
};

export default BudgetCard;
