import { TRANSACTION_FILTERS } from "../../utils/transactionMeta";

const TransactionFilter = ({ value, onChange }) => {
  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {TRANSACTION_FILTERS.map((filter) => {
        const active = value === filter.id;

        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => onChange(filter.id)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-medium transition ${
              active
                ? "border-[#9d4edd] bg-[#5a189a]/50 text-white"
                : "border-[#3c096c] bg-[#3c096c]/30 text-[#c77dff] hover:bg-[#3c096c]/50"
            }`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
};

export default TransactionFilter;
