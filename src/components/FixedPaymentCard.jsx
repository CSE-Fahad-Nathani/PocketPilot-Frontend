const FixedPaymentCard = ({ category, spent = 0 }) => {
  const budget = Number(category.budget) || 0;
  const spentAmount = Number(spent) || 0;
  const isPaid = spentAmount >= budget && budget > 0;

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 ${
        isPaid
          ? "border-emerald-500/30 bg-[#240046]"
          : "border-[#e0aaff1f] bg-[#240046]"
      }`}
    >
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm ${
          isPaid
            ? "border-emerald-400 bg-emerald-500/20 text-emerald-400"
            : "border-[#7b2cbf] bg-[#3c096c] text-transparent"
        }`}
        aria-hidden
      >
        {isPaid ? "✓" : "·"}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-white">
          {category.name}
        </h3>
        <p className="mt-0.5 text-[11px] capitalize text-[#9d4edd]">
          {category.type}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold text-white">
          ₹{budget.toLocaleString()}
        </p>
        <p
          className={`mt-0.5 text-[11px] font-medium ${
            isPaid ? "text-emerald-400" : "text-orange-400"
          }`}
        >
          {isPaid ? "Paid" : "Due"}
        </p>
      </div>
    </div>
  );
};

export default FixedPaymentCard;
