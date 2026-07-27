import { FiArchive, FiRepeat, FiTrendingDown } from "react-icons/fi";
import { BucketIcon, formatAmount } from "./bucketMeta";

const iconButton =
  "inline-flex h-8 w-8 items-center justify-center rounded-full border transition";

export const BucketActionLegend = () => (
  <div className="rounded-xl border border-[#3c096c] bg-[#3c096c]/25 px-3 py-2">
    <p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-[#9d4edd]">
      Action Guide
    </p>
    <div className="flex flex-wrap gap-3 text-[11px] text-[#c77dff]">
      <span className="inline-flex items-center gap-1.5">
        <span className={`${iconButton} border-[#f59e0b]/30 bg-[#f59e0b]/10 text-[#ffd089]`}>
          <FiTrendingDown size={13} />
        </span>
        Withdraw
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className={`${iconButton} border-[#3b82f6]/30 bg-[#3b82f6]/10 text-[#93c5fd]`}>
          <FiRepeat size={13} />
        </span>
        Transfer
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className={`${iconButton} border-[#ef4444]/30 bg-[#ef4444]/10 text-[#fca5a5]`}>
          <FiArchive size={13} />
        </span>
        Archive
      </span>
    </div>
  </div>
);

const BucketCard = ({ bucket, onWithdraw, onTransfer, onArchive }) => {
  const color = bucket.color || "#7b2cbf";

  return (
    <div className="rounded-xl border border-[#3c096c] bg-[#240046]">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-2.5">
        <BucketIcon icon={bucket.icon} color={color} size={15} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{bucket.name}</p>
          <p className="text-[10px] text-[#9d4edd]">Balance {formatAmount(bucket.balance)}</p>
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => onWithdraw?.(bucket)}
            className={`${iconButton} border-[#f59e0b]/30 bg-[#f59e0b]/10 text-[#ffd089] hover:bg-[#f59e0b]/20`}
            aria-label={`Withdraw from ${bucket.name}`}
            title="Withdraw"
          >
            <FiTrendingDown size={13} />
          </button>
          <button
            type="button"
            onClick={() => onTransfer?.(bucket)}
            className={`${iconButton} border-[#3b82f6]/30 bg-[#3b82f6]/10 text-[#93c5fd] hover:bg-[#3b82f6]/20`}
            aria-label={`Transfer from ${bucket.name}`}
            title="Transfer"
          >
            <FiRepeat size={13} />
          </button>
          <button
            type="button"
            onClick={() => onArchive?.(bucket)}
            className={`${iconButton} border-[#ef4444]/30 bg-[#ef4444]/10 text-[#fca5a5] hover:bg-[#ef4444]/20`}
            aria-label={`Archive ${bucket.name}`}
            title="Archive"
          >
            <FiArchive size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BucketCard;
