import { FiBarChart2 } from "react-icons/fi";

import { getBudgetStatus } from "../utils/budgetStatus";

const BudgetCard = ({ category, spent = 0, onExpand }) => {
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

        {onExpand ? (
          <button
            type="button"
            onClick={onExpand}
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#3c096c] bg-[#3c096c]/35 text-[#22d3ee] transition hover:border-[#22d3ee]/40 hover:bg-[#3c096c]/60"
            aria-label={`View ${category.name} fuel analysis`}
            title="Fuel analysis"
          >
            <FiBarChart2 size={14} />
          </button>
        ) : null}

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
