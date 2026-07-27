import {
  formatTransactionAmount,
  formatTransactionTime,
  getTransactionMeta,
} from "../../utils/transactionMeta";

const TransactionCard = ({ transaction }) => {
  const meta = getTransactionMeta(transaction.type);
  const Icon = meta.Icon;
  const amountLabel = formatTransactionAmount(transaction);

  return (
    <div className="rounded-xl border border-[#3c096c] bg-[#240046] px-3 py-3">
      <div className="flex items-start gap-3">
        <span
          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${meta.badge}`}
        >
          <Icon size={16} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#9d4edd]">
            {meta.label}
          </p>
          <p className="mt-0.5 truncate text-sm font-medium text-white">
            {transaction.title}
          </p>
          <p className="mt-0.5 text-[11px] text-[#c77dff]">
            Bucket · {transaction.bucketName || "—"}
          </p>
          {transaction.note ? (
            <p className="mt-1 truncate text-[10px] text-[#9d4edd]">
              Note · {transaction.note}
            </p>
          ) : null}
        </div>

        <div className="shrink-0 text-right">
          <p className={`text-sm font-semibold ${meta.tone}`}>{amountLabel}</p>
          <p className="mt-1 text-[10px] text-[#9d4edd]">
            {formatTransactionTime(transaction.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TransactionCard;
