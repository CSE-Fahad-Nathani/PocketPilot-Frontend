const TransactionSkeleton = ({ count = 4 }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-xl border border-[#3c096c] bg-[#240046] px-3 py-3"
        >
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-full bg-[#3c096c]/70" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3 w-24 rounded bg-[#3c096c]/70" />
              <div className="h-4 w-40 rounded bg-[#3c096c]/60" />
              <div className="h-3 w-28 rounded bg-[#3c096c]/50" />
            </div>
            <div className="h-4 w-16 rounded bg-[#3c096c]/60" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionSkeleton;
