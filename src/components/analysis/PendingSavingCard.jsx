import { formatAmount } from "./bucketMeta";

const PendingSavingCard = ({ saving, onDistribute }) => {
  return (
    <div className="rounded-xl border border-[#e0aaff1f] bg-[#240046] px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">
            {saving.title}
          </p>
          <p className="mt-1 text-xs text-[#c77dff]">
            Remaining{" "}
            <span className="font-semibold text-[#4ade80]">
              {formatAmount(saving.remaining_amount)}
            </span>
          </p>
          <p className="mt-0.5 text-[10px] text-[#9d4edd]">
            Total {formatAmount(saving.amount)} · Allocated{" "}
            {formatAmount(saving.allocated_amount)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onDistribute(saving)}
          className="shrink-0 rounded-full bg-[#5a189a] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#7b2cbf]"
        >
          Distribute
        </button>
      </div>
    </div>
  );
};

export default PendingSavingCard;
